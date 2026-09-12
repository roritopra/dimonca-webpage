import { supabase } from './supabase';
import type { CartItem } from '../types/products';
import { resolveProductId } from './cartApi';

// ============================================================================
// Capa de creación y lectura de pedidos (tablas orders / order_items).
// El usuario debe estar autenticado: RLS valida que el pedido le pertenezca.
// ============================================================================

export type DeliveryMethod = 'domicilio' | 'tienda';

export interface CheckoutContact {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
}

export interface CheckoutDelivery {
	method: DeliveryMethod;
	// Solo para domicilio; en tienda es null
	neighborhood?: string;
	addressLine?: string; // "Calle 12A #34-56" ya compuesta
	city?: string;
	department?: string;
	notes?: string;
}

export interface CreatedOrder {
	id: string;
	orderNumber: number;
}

// Crea el pedido del carrito actual en una secuencia order → order_items.
// subtotal/total se calculan aquí y se envían explícitos (la BD valida
// total = subtotal + delivery_fee con el constraint).
export async function createOrder(params: {
	userId: string;
	contact: CheckoutContact;
	delivery: CheckoutDelivery;
	deliveryFee: number;
	items: CartItem[];
}): Promise<CreatedOrder> {
	const { userId, contact, delivery, deliveryFee, items } = params;

	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const total = subtotal + deliveryFee;

	const isDelivery = delivery.method === 'domicilio';

	const { data: order, error: orderError } = await supabase
		.from('orders')
		.insert({
			user_id: userId,
			status: 'pending',
			customer_name: `${contact.firstName} ${contact.lastName}`.trim(),
			customer_email: contact.email,
			customer_phone: contact.phone,
			delivery_address: isDelivery
				? [
						delivery.addressLine,
						delivery.neighborhood ? `Barrio ${delivery.neighborhood}` : null,
						delivery.city,
						delivery.department,
					]
						.filter(Boolean)
						.join(', ')
				: null,
			notes: delivery.notes ?? null,
			subtotal,
			delivery_fee: deliveryFee,
			total,
		})
		.select('id, order_number')
		.single();

	if (orderError || !order) {
		throw new Error(`No se pudo crear el pedido: ${orderError?.message ?? 'sin respuesta'}`);
	}

	const rows = await Promise.all(
		items.map(async (item) => ({
			order_id: order.id,
			product_id: await resolveProductId(item),
			product_name: item.name,
			product_type: (item.boxContents?.length ?? 0) > 0 || (item.selectedItems?.length ?? 0) > 0 ? 'custom_box' : 'single',
			unit_price: item.price,
			quantity: item.quantity,
			box_contents: item.boxContents?.length ? item.boxContents : null,
		}))
	);

	const { error: itemsError } = await supabase.from('order_items').insert(rows);

	if (itemsError) {
		// El pedido quedó creado sin ítems: estado inconsistente. Se elimina para
		// no dejar pedidos vacíos colgados y se informa al usuario.
		await supabase.from('orders').delete().eq('id', order.id);
		throw new Error(`No se pudieron guardar los productos del pedido: ${itemsError.message}`);
	}

	return { id: order.id, orderNumber: Number(order.order_number) };
}

// Historial de pedidos del usuario logueado (para /mis-pedidos)
export interface OrderSummary {
	id: string;
	order_number: number;
	status: string;
	total: number;
	created_at: string;
	item_count: number;
}

export async function fetchMyOrders(): Promise<OrderSummary[]> {
	const { data, error } = await supabase
		.from('orders')
		.select('id, order_number, status, total, created_at, order_items(count)')
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error(`No se pudieron cargar tus pedidos: ${error.message}`);
	}

	return (data ?? []).map((row) => ({
		id: row.id,
		order_number: Number(row.order_number),
		status: row.status,
		total: row.total,
		created_at: row.created_at,
		item_count: Array.isArray(row.order_items) ? (row.order_items[0]?.count ?? 0) : 0,
	}));
}
