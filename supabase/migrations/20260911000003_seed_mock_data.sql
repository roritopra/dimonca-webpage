-- ============================================================================
-- DIMONCA · Migración 20260911000003 · Datos mockeados (seed)
-- Proyecto Supabase: dimonca-products (ref: lllfiozaabjevitbpfch)
-- Inserta: bucket de Storage 'product-images', 5 categorías y 12 productos
--          (espejo exacto de src/data/products.ts)
-- Requiere: migraciones 20260911000001 y 20260911000002
-- NOTA: las rutas de imagen apuntan al bucket 'product-images' (ver database.md).
--       Sube los PNG con esos nombres antes de conectar el front a Supabase.
-- Documentación completa: /database.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Bucket público de Storage para las imágenes del catálogo
--    URL pública de cada archivo:
--    https://lllfiozaabjevitbpfch.supabase.co/storage/v1/object/public/product-images/<ruta>
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2) Categorías (5)
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (id, label, description, sort_order) VALUES
  ('galletas',     'Galletas',        'Galletas artesanales recién horneadas con centros cremosos y suaves.', 1),
  ('cuchareables', 'Cuchareables',    'Postres por capas diseñados para disfrutar directo con cuchara.',       2),
  ('brownies',     'Brownies',        'Brownies fudgy con textura densa y chocolates seleccionados.',          3),
  ('tortas',       'Tortas',          'Tortas artesanales y mini cakes esponjosos con rellenos exquisitos.',   4),
  ('otros',        'Otros productos', 'Novedades de repostería, combinaciones crujientes y temporadas.',       5)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3) Productos (12) — espejo de src/data/products.ts
--    price_formatted y extra_price_formatted NO se insertan: son columnas
--    generadas automáticamente a partir de price / extra_price.
-- ----------------------------------------------------------------------------
INSERT INTO public.products (
  id, name, product_type, category, category_label, price,
  short_description, full_description, ingredients, allergens,
  image_src, image_hover_src, gallery, badge, badge_color, rating,
  available, accent_color, variant, sort_order, box_config, extra_price
) VALUES

  -- Fila 1
  (
    'galleta-caramelo-salado', 'Galleta Caramelo Salado', 'single', 'galletas', 'Galletas', 11000,
    'Galleta con centro fundente y topping de toffee y caramelo salado artesanal.',
    'Masa suave de mantequilla horneada al punto perfecto, con un generoso baño de caramelo salado casero y cristales de sal marina que realzan su sabor dulce e intenso.',
    ARRAY['Mantequilla pura', 'Caramelo toffee artesanal', 'Sal marina en escamas', 'Vainilla natural'],
    ARRAY['Gluten', 'Lácteos', 'Huevo'],
    'single/galleta-caramelo-salado.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 1, NULL, NULL
  ),
  (
    'galleta-roche', 'Galleta Roché', 'single', 'galletas', 'Galletas', 11000,
    'Galleta premium inspirada en el bombón italiano con avellanas y nutella.',
    'Crocante en su corteza con avellanas tostadas picadas y líneas de chocolate semiamargo derretido, rellena con cremosa pasta de avellanas.',
    ARRAY['Avellanas tostadas', 'Crema de cacao y avellanas', 'Chocolate de leche', 'Mantequilla fresca'],
    ARRAY['Frutos secos (avellanas)', 'Gluten', 'Lácteos', 'Huevo'],
    'single/galleta-roche.png', NULL,
    ARRAY['gallery/galleta-roche-foto-1.png', 'gallery/galleta-roche-foto-2.png', 'gallery/galleta-roche-foto-3.png'],
    NULL, NULL, NULL,
    true, NULL, 'standard', 2, NULL, NULL
  ),
  (
    'combo-arma-tu-caja-x3', 'Arma tu caja x3', 'custom_box', 'galletas', 'Combos', 39000,
    'Caja especial de 3 galletas a tu elección con empaque de regalo.',
    'Selecciona tus 3 sabores favoritos de nuestra vitrina y llévalos en la clásica caja rosa de Dimonca diseñada para compartir o regalar.',
    NULL, NULL,
    'boxes/arma-tu-caja-x3.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'premium', 3,
    '{"capacity": 3, "allowDuplicates": true, "includesIceCream": false, "availableItemCategory": "galletas"}'::jsonb,
    NULL
  ),
  (
    'galleta-klim', 'Galleta Klim', 'single', 'galletas', 'Galletas', 11000,
    'Masa suave con abundante leche en polvo y corazón untuoso.',
    'Un homenaje a uno de los sabores más queridos: masa enriquecida con leche en polvo, centro cremoso y una lluvia fina de leche Klim en el exterior.',
    ARRAY['Leche en polvo Klim', 'Mantequilla artesanal', 'Chocolate blanco', 'Harina seleccionada'],
    ARRAY['Lácteos', 'Gluten', 'Huevo'],
    'single/galleta-klim.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 4, NULL, NULL
  ),
  (
    'galleta-maracuya', 'Galleta Maracuyá', 'single', 'galletas', 'Galletas', 11000,
    'Cremoso centro de reducción de maracuyá ácido con chocolate blanco.',
    'El contraste perfecto entre la dulzura de la masa horneada y la acidez vibrante del curd de maracuyá natural con semillas crujientes.',
    ARRAY['Pulpa natural de maracuyá', 'Mantequilla', 'Chocolate blanco belga', 'Vainilla'],
    ARRAY['Lácteos', 'Gluten', 'Huevo'],
    'single/galleta-maracuya.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 5, NULL, NULL
  ),

  -- Fila 2
  (
    'combo-arma-tu-caja-x9', 'Arma tu caja x9', 'custom_box', 'galletas', 'Combos', 39000,
    'Nuestra caja más grande y completa para celebraciones especiales.',
    'La experiencia Dimonca definitiva: 9 de nuestras mejores galletas recién salidas del horno en nuestra caja coleccionable de fiesta.',
    NULL, NULL,
    'boxes/arma-tu-caja-x9.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'premium', 6,
    '{"capacity": 9, "allowDuplicates": true, "includesIceCream": false, "availableItemCategory": "galletas"}'::jsonb,
    NULL
  ),
  (
    'galleta-habibi', 'Galleta Habibi', 'single', 'galletas', 'Galletas', 11000,
    'Masa de chocolate brownie con pistachos y centro cremoso estilo Dubai.',
    'Inspirada en el sabor del medio oriente: masa densa de cacao oscuro cargada de pistachos tostados y relleno volcánico de auténtica crema de pistacho.',
    ARRAY['Cacao oscuro', 'Pistachos tostados', 'Crema de pistacho 100%', 'Mantequilla'],
    ARRAY['Frutos secos (pistacho)', 'Lácteos', 'Gluten', 'Huevo'],
    'single/galleta-habibi.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 7, NULL, 2000
  ),
  (
    'galleta-nutella', 'Nutella', 'single', 'galletas', 'Galletas', 11000,
    'Galleta con masa artesanal y generoso corazón de Nutella fundida.',
    'Crujiente por fuera con masa suave repleta de chispas y un centro volcánico de auténtica crema de avellanas Nutella.',
    NULL, NULL,
    'single/galleta-nutella.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 8, NULL, 1000
  ),
  (
    'crookie', 'Crookie', 'single', 'otros', 'Otros productos', 11000,
    'Croissant hojaldrado relleno y cubierto con masa de galleta horneada.',
    'Mantequilloso croissant francés combinado con nuestra masa de galleta con chispas de chocolate derretidas. Crujiente por fuera y suave en el interior.',
    ARRAY['Croissant hojaldrado', 'Masa de galleta artesanal', 'Mantequilla francesa', 'Chips de chocolate'],
    ARRAY['Gluten', 'Lácteos', 'Huevo'],
    'single/crookie.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 9, NULL, NULL
  ),
  (
    'combo-arma-tu-caja-x3-helado', 'Arma tu caja x3 + Helado', 'custom_box', 'galletas', 'Combos', 39000,
    '3 galletas calientitas acompañadas de tarros de helado artesanal.',
    'La combinación soñada: combina tus galletas favoritas con nuestros cremosos helados de autor para una experiencia de temperatura irresistible.',
    NULL, NULL,
    'boxes/arma-tu-caja-x3-helado.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'premium', 10,
    '{"capacity": 3, "allowDuplicates": true, "includesIceCream": true, "availableItemCategory": "galletas"}'::jsonb,
    NULL
  ),

  -- Fila 3
  (
    'galleta-red-velvet', 'Galleta Red Velvet', 'single', 'galletas', 'Galletas', 11000,
    'Galleta de red velvet con relleno cremoso de queso y chocolate blanco.',
    'Sutil sabor a cacao fino con el toque aterciopelado característico, relleno de crema de queso horneada y decorado con hilos de chocolate blanco.',
    ARRAY['Cacao fino', 'Queso crema especial', 'Chocolate blanco', 'Mantequilla fresca'],
    ARRAY['Lácteos', 'Gluten', 'Huevo'],
    'single/galleta-red-velvet.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 11, NULL, NULL
  ),
  (
    'galleta-pistacho', 'Galleta Pistacho', 'single', 'galletas', 'Galletas', 11000,
    'Masa verde de pistachos reales con chocolate blanco y tropezones crocantes.',
    'Masa elaborada a base de pasta pura de pistachos, con un balance aromático excepcional y tropezones crujientes en cada mordisco.',
    ARRAY['Pasta pura de pistacho', 'Pistachos enteros tostados', 'Mantequilla pura', 'Chocolate blanco'],
    ARRAY['Frutos secos (pistacho)', 'Lácteos', 'Gluten', 'Huevo'],
    'single/galleta-pistacho.png', NULL, NULL, NULL, NULL, NULL,
    true, NULL, 'standard', 12, NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4) (OPCIONAL) Pedido mockeado de prueba — REQUIERE un usuario real
--    La FK orders.user_id apunta a auth.users, así que primero crea un
--    usuario de prueba en: Dashboard → Authentication → Users → "Add user".
--    Luego copia su UUID en la línea marcada y descomenta este bloque.
-- ----------------------------------------------------------------------------
-- WITH nueva_orden AS (
--   INSERT INTO public.orders (user_id, status, customer_name, customer_email, subtotal, delivery_fee, total)
--   VALUES ('REEMPLAZA-CON-UUID-DEL-USUARIO', 'delivered', 'Cliente de Prueba', 'prueba@dimonca.com', 61000, 0, 61000)
--   RETURNING id
-- )
-- INSERT INTO public.order_items (order_id, product_id, product_name, product_type, unit_price, quantity, box_contents)
-- SELECT n.id, 'galleta-roche', 'Galleta Roché', 'single', 11000, 2, NULL
-- FROM nueva_orden n
-- UNION ALL
-- SELECT n.id, 'combo-arma-tu-caja-x3', 'Arma tu caja x3', 'custom_box', 39000, 1,
--        '[{"productId":"galleta-roche","name":"Galleta Roché","imageSrc":"gallery/galleta-roche-foto-1.png","quantity":3}]'::jsonb
-- FROM nueva_orden n;
