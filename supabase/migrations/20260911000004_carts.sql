-- ============================================================================
-- DIMONCA · Migración 20260911000004 · Carrito persistente por usuario
-- Proyecto Supabase: dimonca-products (ref: lllfiozaabjevitbpfch)
-- Crea: tablas carts y cart_items, índices, triggers, RLS
-- Requiere: migraciones 1-3
-- Documentación completa: /database.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tabla carts — un carrito por usuario (1 a 1)
-- ----------------------------------------------------------------------------
CREATE TABLE public.carts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2) Tabla cart_items — líneas del carrito
--    Guarda snapshot del producto (nombre, precio, imagen) para renderizar el
--    carrito sin JOINs. Para cajas armadas (custom_box), product_id apunta al
--    producto real de la caja y el contenido va en box_contents.
-- ----------------------------------------------------------------------------
CREATE TABLE public.cart_items (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id           uuid        NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id        text        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_type      text        NOT NULL DEFAULT 'single',
  name              text        NOT NULL,
  category_label    text,
  price             integer     NOT NULL CHECK (price >= 0),
  price_formatted   text,
  image_src         text,
  quantity          integer     NOT NULL CHECK (quantity > 0),
  short_description text,
  selected_items    jsonb,      -- nombres de sabores elegidos (custom_box)
  box_contents      jsonb,      -- detalle de la caja armada: [{productId, name, imageSrc, quantity}]
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT cart_items_product_type_check CHECK (product_type IN ('single', 'custom_box')),
  CONSTRAINT cart_items_selected_items_check CHECK (selected_items IS NULL OR jsonb_typeof(selected_items) = 'array'),
  CONSTRAINT cart_items_box_contents_check CHECK (box_contents IS NULL OR jsonb_typeof(box_contents) = 'array')
);

-- Un solo producto 'single' no puede repetirse en el mismo carrito (se suma cantidad).
-- Las cajas armadas SÍ pueden repetirse (cada una con contenido distinto).
CREATE UNIQUE INDEX cart_items_single_unique
  ON public.cart_items (cart_id, product_id)
  WHERE product_type = 'single';

CREATE INDEX cart_items_cart_idx ON public.cart_items (cart_id);

-- ----------------------------------------------------------------------------
-- 3) Triggers updated_at
-- ----------------------------------------------------------------------------
CREATE TRIGGER carts_set_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER cart_items_set_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4) RLS — el carrito es del usuario: puede leer, crear, editar y borrar SUS
--    líneas (a diferencia de orders, aquí el usuario gestiona su carrito libremente).
-- ----------------------------------------------------------------------------
ALTER TABLE public.carts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario puede ver su carrito"
  ON public.carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuario puede crear su carrito"
  ON public.carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario puede actualizar su carrito"
  ON public.carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario puede ver los items de su carrito"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Usuario puede insertar items en su carrito"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Usuario puede actualizar items de su carrito"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_id AND c.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Usuario puede borrar items de su carrito"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_id AND c.user_id = auth.uid()
  ));

GRANT SELECT, INSERT, UPDATE ON public.carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
