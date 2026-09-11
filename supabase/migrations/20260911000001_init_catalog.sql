-- ============================================================================
-- DIMONCA · Migración 20260911000001 · Esquema del catálogo
-- Proyecto Supabase: dimonca-products (ref: lllfiozaabjevitbpfch)
-- Crea: función fmt_money_cop, tabla categories, tabla products,
--       índices, trigger updated_at, RLS de lectura pública
-- Documentación completa: /database.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Función auxiliar: formatea un entero COP como '$11.000'
--    La usan las columnas generadas price_formatted y extra_price_formatted,
--    para que el formato quede consistente sin depender del front.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fmt_money_cop(amount integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT '$' || regexp_replace(amount::text, '\d(?=(\d{3})+$)', '\0.', 'g');
$$;

-- ----------------------------------------------------------------------------
-- 2) Tabla categories — categorías del menú (5 fijas, ver seed)
-- ----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id           text        PRIMARY KEY,           -- 'galletas' | 'cuchareables' | 'brownies' | 'tortas' | 'otros'
  label        text        NOT NULL,              -- 'Galletas'
  description  text        NOT NULL DEFAULT '',
  sort_order   integer     NOT NULL DEFAULT 0,    -- orden de aparición en tabs/filtros
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_id_format CHECK (id ~ '^[a-z0-9_-]+$')
);

-- ----------------------------------------------------------------------------
-- 3) Tabla products — catálogo de productos (una fila por producto)
--    product_type: 'single' (producto normal) | 'custom_box' (caja para armar)
--    Los combos/cajas especiales son custom_box con variant = 'premium'.
-- ----------------------------------------------------------------------------
CREATE TABLE public.products (
  id                     text        PRIMARY KEY,   -- slug: 'galleta-roche', 'combo-arma-tu-caja-x3'
  name                   text        NOT NULL,
  product_type           text        NOT NULL DEFAULT 'single',
  category               text        NOT NULL REFERENCES public.categories(id)
                                     ON UPDATE CASCADE ON DELETE RESTRICT,
  category_label         text        NOT NULL,      -- texto mostrado (ej. 'Combos' para las cajas)
  price                  integer     NOT NULL,      -- COP, sin decimales
  price_formatted        text        GENERATED ALWAYS AS (public.fmt_money_cop(price)) STORED,
  extra_price            integer,                   -- recargo opcional (ej. galleta Habibi +$2.000)
  extra_price_formatted  text        GENERATED ALWAYS AS (
                           CASE WHEN extra_price IS NOT NULL
                                THEN '(+ ' || public.fmt_money_cop(extra_price) || ')' END
                         ) STORED,
  short_description      text        NOT NULL DEFAULT '',
  full_description       text        NOT NULL DEFAULT '',
  ingredients            text[],                    -- nullable
  allergens              text[],                    -- nullable
  image_src              text        NOT NULL,      -- ruta dentro del bucket 'product-images'
  image_hover_src        text,
  gallery                text[],                    -- máx. 3 fotos terciarias (opcional)
  badge                  text,
  badge_color            text,
  rating                 numeric(2,1),
  available              boolean     NOT NULL DEFAULT true,
  accent_color           text,
  variant                text        DEFAULT 'standard',
  sort_order             integer     NOT NULL DEFAULT 0,   -- orden de visualización en la grilla
  box_config             jsonb,                     -- solo custom_box: {capacity, allowDuplicates, includesIceCream, availableItemCategory}
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT products_product_type_check CHECK (product_type IN ('single', 'custom_box')),
  -- box_config solo existe en custom_box (obligatorio ahí, prohibido en single)
  CONSTRAINT products_box_config_presence CHECK (
    (product_type = 'custom_box' AND box_config IS NOT NULL)
    OR (product_type = 'single'  AND box_config IS NULL)
  ),
  -- box_config debe tener la forma esperada por el front (BoxConfiguration)
  CONSTRAINT products_box_config_shape CHECK (
    box_config IS NULL OR (
      jsonb_typeof(box_config) = 'object'
      AND box_config ? 'capacity'
      AND (box_config->>'capacity') ~ '^\d+$'
      AND (box_config->>'capacity')::int > 0
      AND jsonb_typeof(box_config->'allowDuplicates')  IN ('boolean', 'null')
      AND jsonb_typeof(box_config->'includesIceCream') IN ('boolean', 'null')
      AND (box_config->>'availableItemCategory') IS NOT NULL
    )
  ),
  -- Galería terciaria: opcional, entre 1 y 3 fotos
  CONSTRAINT products_gallery_check CHECK (
    gallery IS NULL OR cardinality(gallery) BETWEEN 1 AND 3
  ),
  CONSTRAINT products_price_check CHECK (price > 0),
  CONSTRAINT products_extra_price_check CHECK (extra_price IS NULL OR extra_price > 0),
  CONSTRAINT products_rating_check CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  CONSTRAINT products_variant_check CHECK (variant IS NULL OR variant IN ('standard', 'premium'))
);

CREATE INDEX products_category_idx     ON public.products (category);
CREATE INDEX products_product_type_idx ON public.products (product_type);
CREATE INDEX products_available_idx    ON public.products (available);
CREATE INDEX products_sort_idx         ON public.products (sort_order);

-- ----------------------------------------------------------------------------
-- 4) Trigger updated_at (mantener la fecha de última modificación)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5) RLS (Row Level Security)
--    Catálogo: lectura pública (la tienda se puede ver sin sesión).
--    Escritura: sin políticas para clientes → solo dashboard / service_role.
-- ----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede leer las categorias"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Cualquiera puede leer los productos"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.categories, public.products TO anon, authenticated;
