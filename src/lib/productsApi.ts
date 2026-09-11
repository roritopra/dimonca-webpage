import type { Product, ProductCategory } from '../types/products';
import { PRODUCTS } from '../data/products';

/**
 * Capa de acceso a datos de productos con firma de Supabase.
 *
 * HOY: mock en memoria (importa PRODUCTS de data/products.ts) con latencia simulada,
 * para que todo el consumo sea asincrónico igual que en producción.
 *
 * Al integrar Supabase real, solo cambia el cuerpo de cada función; el resto del
 * código (páginas, componentes, stores) ya consume esta API asincrónicamente:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY);
 *   const { data, error } = await supabase.from('products').select('*').eq('available', true);
 *
 * Tabla `products` en Supabase (una fila por producto, columnas = interfaz Product):
 *   id               text  PK     'galleta-roche'
 *   name             text         'Galleta Roché'
 *   product_type     text         'single' | 'custom_box'
 *   category         text         'galletas' | 'cuchareables' | 'brownies' | 'tortas' | 'otros'
 *   category_label   text         'Galletas'
 *   price            int4         11000  (COP)
 *   price_formatted  text         '$11.000'
 *   short_desc       text
 *   full_desc        text
 *   ingredients      text[]       {Mantequilla pura, ...}     (nullable)
 *   allergens        text[]       {Gluten, Lácteos, Huevo}    (nullable)
 *   image_src        text         URL del PNG principal (obligatoria)
 *   image_hover_src  text                                     (nullable)
 *   gallery          text[]       máx. 3 fotos terciarias     (nullable, solo 'single')
 *   available        boolean
 *   box_config       jsonb?       {capacity, allowDuplicates, includesIceCream, availableItemCategory} (solo custom_box)
 */
export async function getProducts(): Promise<Product[]> {
	// Mock: simula la latencia de red de un GET
	await new Promise((resolve) => setTimeout(resolve, 120));
	return PRODUCTS;
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
	const products = await getProducts();
	return products.filter((p) => p.category === category && p.available);
}

export async function getProductById(id: string): Promise<Product | undefined> {
	const products = await getProducts();
	return products.find((p) => p.id === id);
}
