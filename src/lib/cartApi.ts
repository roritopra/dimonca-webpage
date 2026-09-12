import { supabase } from './supabase';
import type { CartItem, SelectedBoxItem } from '../types/products';

// ============================================================================
// Capa de acceso al carrito persistente en Supabase (tablas carts / cart_items).
// El front sigue usando CartItem (camelCase) como formato interno; aquí solo se
// traduce hacia/desde las filas de la BD.
// ============================================================================

interface CartItemRow {
	id: string;
	cart_id: string;
	product_id: string;
	product_type: string;
	name: string;
	category_label: string | null;
	price: number;
	price_formatted: string | null;
	image_src: string | null;
	quantity: number;
	short_description: string | null;
	selected_items: string[] | null;
	box_contents: SelectedBoxItem[] | null;
}

// Ids de los productos custom_box (cacheado: se usan para resolver los ids
// falsos "combo-...-<timestamp>" que genera BoxBuilder al armar una caja)
let boxIdsCache: string[] | null = null;

async function getBoxProductIds(): Promise<string[]> {
	if (boxIdsCache) return boxIdsCache;
	const { data, error } = await supabase
		.from('products')
		.select('id')
		.eq('product_type', 'custom_box');

	if (error) {
		// NO cachear en error: un cache vacío haría que las cajas se guarden con
		// su id falso (con timestamp) y romperían la FK contra products.
		throw new Error(`No se pudieron resolver los ids de las cajas: ${error.message}`);
	}

	boxIdsCache = (data ?? []).map((row) => row.id);
	return boxIdsCache;
}

function isBoxItem(item: CartItem): boolean {
	return (item.boxContents?.length ?? 0) > 0 || (item.selectedItems?.length ?? 0) > 0;
}

// Resuelve el product_id real para la BD: los items de caja vienen con un id
// falso con timestamp (ej. "combo-arma-tu-caja-x3-1736...") que no existe en
// products; se mapea de vuelta al id real de la caja por prefijo.
// Exportada: ordersApi la reutiliza al crear las líneas del pedido.
export async function resolveProductId(item: CartItem): Promise<string> {
	if (isBoxItem(item)) {
		const boxIds = await getBoxProductIds();
		const match = boxIds.find((id) => item.productId === id || item.productId.startsWith(`${id}-`));
		if (match) return match;
	}
	return item.productId;
}

// Obtiene el id del carrito del usuario, creándolo si no existe
export async function getOrCreateCartId(userId: string): Promise<string> {
	const { data: existing, error: selectError } = await supabase
		.from('carts')
		.select('id')
		.eq('user_id', userId)
		.maybeSingle();

	if (selectError) throw new Error(`Error al buscar el carrito: ${selectError.message}`);
	if (existing) return existing.id;

	// Upsert idempotente: si dos pestañas lo crean a la vez, no falla
	const { error: insertError } = await supabase
		.from('carts')
		.upsert({ user_id: userId }, { onConflict: 'user_id' });

	if (insertError) throw new Error(`Error al crear el carrito: ${insertError.message}`);

	const { data: created, error: reselectError } = await supabase
		.from('carts')
		.select('id')
		.eq('user_id', userId)
		.maybeSingle();

	if (reselectError || !created) throw new Error('No se pudo obtener el carrito creado');
	return created.id;
}

// Lee los items del carrito del usuario desde la BD
export async function fetchCartItems(cartId: string): Promise<CartItem[]> {
	const { data, error } = await supabase
		.from('cart_items')
		.select('*')
		.eq('cart_id', cartId)
		.order('created_at');

	if (error) throw new Error(`Error al leer el carrito: ${error.message}`);

	return (data as CartItemRow[]).map((row) => ({
		productId: row.product_id,
		name: row.name,
		categoryLabel: row.category_label ?? '',
		price: row.price,
		priceFormatted: row.price_formatted ?? `$${row.price}`,
		imageSrc: row.image_src ?? '',
		quantity: row.quantity,
		shortDescription: row.short_description ?? undefined,
		selectedItems: row.selected_items ?? undefined,
		boxContents: row.box_contents ?? undefined,
	}));
}

// Reemplaza TODO el contenido del carrito en la BD con la lista dada
// (estrategia delete-all + insert-all: simple y siempre consistente)
export async function replaceCartItems(cartId: string, items: CartItem[]): Promise<void> {
	const { error: deleteError } = await supabase
		.from('cart_items')
		.delete()
		.eq('cart_id', cartId);

	if (deleteError) throw new Error(`Error al limpiar el carrito: ${deleteError.message}`);

	if (items.length === 0) return;

	const rows = await Promise.all(
		items.map(async (item) => ({
			cart_id: cartId,
			product_id: await resolveProductId(item),
			product_type: isBoxItem(item) ? 'custom_box' : 'single',
			name: item.name,
			category_label: item.categoryLabel || null,
			price: item.price,
			price_formatted: item.priceFormatted,
			image_src: item.imageSrc || null,
			quantity: item.quantity,
			short_description: item.shortDescription ?? null,
			selected_items: item.selectedItems?.length ? item.selectedItems : null,
			box_contents: item.boxContents?.length ? item.boxContents : null,
		}))
	);

	const { error: insertError } = await supabase.from('cart_items').insert(rows);

	if (insertError) throw new Error(`Error al guardar el carrito: ${insertError.message}`);
}
