import type { Product, ProductCategory, ProductType } from '../types/products';
import { supabase } from './supabase';

const PRODUCT_IMAGES_BUCKET = 'product-images';

function publicImageUrl(path: string): string {
	return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

interface ProductRow {
	id: string;
	name: string;
	product_type: string;
	category: string;
	category_label: string;
	price: number;
	price_formatted: string;
	extra_price: number | null;
	extra_price_formatted: string | null;
	short_description: string;
	full_description: string;
	ingredients: string[] | null;
	allergens: string[] | null;
	image_src: string;
	image_hover_src: string | null;
	gallery: string[] | null;
	badge: string | null;
	badge_color: string | null;
	rating: number | null;
	available: boolean;
	accent_color: string | null;
	variant: string | null;
	box_config: {
		capacity: number;
		allowDuplicates?: boolean;
		includesIceCream?: boolean;
		availableItemCategory: string;
	} | null;
}

function mapProduct(row: ProductRow): Product {
	const product: Product = {
		id: row.id,
		name: row.name,
		productType: row.product_type as ProductType,
		category: row.category as ProductCategory,
		categoryLabel: row.category_label,
		price: row.price,
		priceFormatted: row.price_formatted,
		shortDescription: row.short_description,
		fullDescription: row.full_description,
		ingredients: row.ingredients ?? undefined,
		allergens: row.allergens ?? undefined,
		imageSrc: publicImageUrl(row.image_src),
		imageHoverSrc: row.image_hover_src ? publicImageUrl(row.image_hover_src) : undefined,
		gallery: row.gallery?.map(publicImageUrl),
		badge: row.badge ?? undefined,
		badgeColor: row.badge_color ?? undefined,
		rating: row.rating ?? undefined,
		available: row.available,
		accentColor: row.accent_color ?? undefined,
		variant: (row.variant as Product['variant']) ?? undefined,
		extraPrice: row.extra_price ?? undefined,
		extraPriceFormatted: row.extra_price_formatted ?? undefined,
		boxConfig: row.box_config
			? {
					capacity: row.box_config.capacity,
					allowDuplicates: row.box_config.allowDuplicates,
					includesIceCream: row.box_config.includesIceCream,
					availableItemCategory: row.box_config.availableItemCategory as ProductCategory,
				}
			: undefined,
	};
	return product;
}

export async function getProducts(): Promise<Product[]> {
	const { data, error } = await supabase
		.from('products')
		.select('*')
		.eq('available', true)
		.order('sort_order');

	if (error) {
		console.error('[productsApi] Error al obtener productos:', error.message);
		throw new Error(`No se pudieron cargar los productos: ${error.message}`);
	}

	return (data as ProductRow[]).map(mapProduct);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
	const products = await getProducts();
	return products.filter((p) => p.category === category);
}

export async function getProductById(id: string): Promise<Product | undefined> {
	const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();

	if (error) {
		console.error(`[productsApi] Error al obtener el producto ${id}:`, error.message);
		return undefined;
	}

	return data ? mapProduct(data as ProductRow) : undefined;
}

// Galletas armables para las cajas custom: productos single de categoría 'galletas'
export async function getAvailableCookies(): Promise<Product[]> {
	const { data, error } = await supabase
		.from('products')
		.select('*')
		.eq('available', true)
		.eq('product_type', 'single')
		.eq('category', 'galletas')
		.order('sort_order');

	if (error) {
		console.error('[productsApi] Error al obtener las galletas armables:', error.message);
		throw new Error(`No se pudieron cargar las galletas: ${error.message}`);
	}

	return (data as ProductRow[]).map(mapProduct);
}
