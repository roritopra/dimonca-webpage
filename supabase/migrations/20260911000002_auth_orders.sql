-- ============================================================================
-- DIMONCA · Migración 20260911000002 · Autenticación y pedidos
-- Proyecto Supabase: dimonca-products (ref: lllfiozaabjevitbpfch)
-- Crea: tabla profiles (+ trigger automático al registrarse),
--       tablas orders y order_items, índices, RLS
-- Requiere: migración 20260911000001 (products)
-- Documentación completa: /database.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tabla profiles — perfil público de cada usuario de Supabase Auth
--    Se crea sola (trigger) cuando alguien se registra con
--    email/contraseña, Google o Apple.
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,                              -- copia de auth.users.email (para analíticas)
  full_name   text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: cada nuevo usuario en auth.users crea su fila en profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2) Tabla orders — historial de pedidos (transacciones)
--    Un pedido pertenece siempre a un usuario autenticado.
--    Los datos de contacto se "congelan" (snapshot) en el momento de la compra.
-- ----------------------------------------------------------------------------
CREATE TABLE public.orders (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     bigint      GENERATED ALWAYS AS IDENTITY (START WITH 1001) UNIQUE, -- número visible: 1001, 1002...
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           text        NOT NULL DEFAULT 'pending',
  customer_name    text        NOT NULL,
  customer_email   text        NOT NULL,
  customer_phone   text,
  delivery_address text,       -- opcional (pickup en tienda si es NULL)
  notes            text,       -- notas del cliente (dedicatorias, etc.)
  subtotal         integer     NOT NULL DEFAULT 0,   -- COP
  delivery_fee     integer     NOT NULL DEFAULT 0,   -- COP
  total            integer     NOT NULL,             -- COP
  payment_method   text,       -- 'efectivo' | 'transferencia' | ... (se definirá con pagos)
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT orders_status_check CHECK (status IN ('pending','confirmed','preparing','delivered','cancelled')),
  CONSTRAINT orders_total_check  CHECK (total = subtotal + delivery_fee)
);

CREATE INDEX orders_user_created_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX orders_status_idx       ON public.orders (status);

-- ----------------------------------------------------------------------------
-- 3) Tabla order_items — líneas de cada pedido
--    Guarda snapshot del producto (nombre, tipo, precio unitario) para que el
--    historial sobreviva a cambios de precio o desactivación de productos.
--    box_contents: contenido de la caja armada (custom_box), ej.
--    [{"productId":"galleta-roche","name":"Galleta Roché","quantity":3}]
-- ----------------------------------------------------------------------------
CREATE TABLE public.order_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    text        NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name  text        NOT NULL,   -- snapshot
  product_type  text        NOT NULL,   -- snapshot: 'single' | 'custom_box'
  unit_price    integer     NOT NULL,   -- COP, precio al momento de la compra
  quantity      integer     NOT NULL,
  line_total    integer     GENERATED ALWAYS AS (unit_price * quantity) STORED,
  box_contents  jsonb,                  -- solo custom_box: array de {productId, name, imageSrc, quantity}
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT order_items_product_type_check CHECK (product_type IN ('single', 'custom_box')),
  CONSTRAINT order_items_quantity_check     CHECK (quantity > 0),
  CONSTRAINT order_items_unit_price_check   CHECK (unit_price >= 0),
  CONSTRAINT order_items_box_contents_check CHECK (box_contents IS NULL OR jsonb_typeof(box_contents) = 'array')
);

CREATE INDEX order_items_order_idx   ON public.order_items (order_id);
CREATE INDEX order_items_product_idx ON public.order_items (product_id);

-- ----------------------------------------------------------------------------
-- 4) Trigger updated_at para orders y profiles
-- ----------------------------------------------------------------------------
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5) RLS — cada usuario solo ve y crea SUS pedidos y SU perfil.
--    Nadie (ni el propio usuario) puede modificar/borrar pedidos desde el
--    cliente: la gestión (estados, cancelaciones) se hace desde el dashboard
--    o con la service_role key.
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Perfiles
CREATE POLICY "Usuario puede ver su perfil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuario puede actualizar su perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Pedidos
CREATE POLICY "Usuario puede ver sus pedidos"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuario puede crear sus pedidos"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ítems de pedidos (acceso vía el pedido padre)
CREATE POLICY "Usuario puede ver los items de sus pedidos"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Usuario puede crear items en sus pedidos"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  ));

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.orders     TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
