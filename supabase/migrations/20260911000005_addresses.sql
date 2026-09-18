-- ============================================================================
-- DIMONCA · Migración 20260911000005 · Direcciones del usuario
-- Proyecto Supabase: dimonca-products (ref: lllfiozaabjevitbpfch)
-- Crea: tabla addresses (N direcciones por usuario, una predeterminada),
--       índices, trigger updated_at, RLS con CRUD propio
-- Requiere: migraciones 1-4
-- Documentación completa: /database.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tabla addresses — libreta de direcciones del usuario
--    Alimenta el prellenado del checkout: usuario recurrente ve su dirección
--    predeterminada (is_default = true) ya puesta, y puede guardar varias.
--    Guarda snapshot del destinatario (nombre/teléfono) por dirección, porque
--    puede enviar a otra persona (regalo) con su propio teléfono.
-- ----------------------------------------------------------------------------
CREATE TABLE public.addresses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       text,                                    -- opcional: 'Casa', 'Trabajo', ...
  full_name   text        NOT NULL,                    -- nombre del destinatario
  phone       text        NOT NULL,                    -- teléfono del destinatario
  department  text        NOT NULL,
  city        text        NOT NULL,
  neighborhood text       NOT NULL,
  street_type  text       NOT NULL DEFAULT '',         -- 'Calle' | 'Carrera' | ...
  street_number text      NOT NULL DEFAULT '',         -- '12A'
  house_number text       NOT NULL DEFAULT '',         -- '34-56'
  interior    text,                                    -- opcional: 'Apt 302'
  address_line text       NOT NULL,                    -- "Calle 12A #34-56 - Apt 302"
  notes       text,                                    -- notas para el domiciliario
  is_default  boolean     NOT NULL DEFAULT false,      -- dirección predeterminada
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT addresses_full_name_check CHECK (full_name <> ''),
  CONSTRAINT addresses_phone_check     CHECK (phone <> ''),
  CONSTRAINT addresses_department_check CHECK (department <> ''),
  CONSTRAINT addresses_city_check      CHECK (city <> ''),
  CONSTRAINT addresses_neighborhood_check CHECK (neighborhood <> ''),
  CONSTRAINT addresses_address_line_check CHECK (address_line <> '')
);

-- Una sola dirección predeterminada por usuario
CREATE UNIQUE INDEX addresses_one_default_per_user
  ON public.addresses (user_id)
  WHERE is_default;

CREATE INDEX addresses_user_idx ON public.addresses (user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 2) Trigger updated_at
-- ----------------------------------------------------------------------------
CREATE TRIGGER addresses_set_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3) RLS — cada usuario gestiona (ve/crea/edita/borra) SOLO sus direcciones
-- ----------------------------------------------------------------------------
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario puede ver sus direcciones"
  ON public.addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuario puede crear sus direcciones"
  ON public.addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario puede actualizar sus direcciones"
  ON public.addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario puede borrar sus direcciones"
  ON public.addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
