import { persistentAtom } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';
import type { CartItem, Product, SelectedBoxItem } from '../types/products';
import { $authStatus, $user } from './authStore';
import { fetchCartItems, getOrCreateCartId, replaceCartItems } from '../lib/cartApi';

// Store persistente en localStorage bajo la clave "dimonca_cart"
// (fuente de verdad para invitados; se sincroniza con Supabase al loguearse)
export const $cart = persistentAtom<CartItem[]>('dimonca_cart', [], {
	encode: JSON.stringify,
	decode: JSON.parse,
});

// Estado de visibilidad del Drawer lateral del carrito
export const $isCartOpen = atom<boolean>(false);

// Número total de ítems en el carrito
export const $cartCount = computed($cart, (items) =>
	items.reduce((total, item) => total + item.quantity, 0)
);

// Valor monetario total acumulado
export const $cartTotal = computed($cart, (items) =>
	items.reduce((total, item) => total + item.price * item.quantity, 0)
);

// Formateador de moneda colombiana
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		maximumFractionDigits: 0,
	}).format(amount).replace('COP', '$').trim();
}

export function openCart(): void {
	$isCartOpen.set(true);
}

export function closeCart(): void {
	$isCartOpen.set(false);
}

export function toggleCart(): void {
	$isCartOpen.set(!$isCartOpen.get());
}

// ============================================================================
// Sincronización con Supabase (carrito híbrido)
// - Invitado: todo vive en localStorage (arriba).
// - Login: se descarga el carrito del servidor, se hace MERGE con lo local
//   (sumando cantidades de los mismos productos) y el resultado queda en BD.
// - Logueado: cada cambio del carrito se replica a la BD (debounced).
// - Logout: se limpia el local y se vuelve a modo invitado.
// ============================================================================

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let isMerging = false;
let cartSyncInitialized = false;

/** Inicializa la sincronización del carrito. Llamar una sola vez (AuthProvider). */
export function initCartSync(): void {
	if (cartSyncInitialized) return;
	cartSyncInitialized = true;

	$authStatus.subscribe((status) => {
		if (status === 'loggedIn') {
			void pullAndMerge();
		} else if (status === 'loggedOut' && !isMerging) {
			// Volver a modo invitado con el carrito limpio
			$cart.set([]);
		}
	});
}

// Replica el estado actual del carrito a la BD (con debounce para agrupar cambios rápidos)
function queueServerSync(): void {
	if ($authStatus.get() !== 'loggedIn') return;
	if (syncTimer) clearTimeout(syncTimer);
	syncTimer = setTimeout(() => {
		void pushCartToServer();
	}, 400);
}

async function pushCartToServer(): Promise<void> {
	const user = $user.get();
	if (!user || isMerging) return;

	try {
		const cartId = await getOrCreateCartId(user.id);
		await replaceCartItems(cartId, $cart.get());
	} catch (err) {
		console.error('[cartStore] Error al sincronizar el carrito con Supabase:', err);
	}
}

// Descarga el carrito del servidor y lo fusiona con el local
async function pullAndMerge(): Promise<void> {
	const user = $user.get();
	if (!user || isMerging) return;
	isMerging = true;

	try {
		const cartId = await getOrCreateCartId(user.id);
		const serverItems = await fetchCartItems(cartId);
		const localItems = $cart.get();
		const merged = mergeCarts(localItems, serverItems);

		// El resultado fusionado pasa a ser la fuente de verdad (local + BD)
		$cart.set(merged);
		await replaceCartItems(cartId, merged);
	} catch (err) {
		console.error('[cartStore] Error al fusionar el carrito al iniciar sesión:', err);
	} finally {
		isMerging = false;
	}
}

// Fusiona el carrito local (invitado) con el del servidor:
// - items single con el mismo productId: se suman cantidades
// - cajas armadas (custom_box): se conservan como líneas independientes
function mergeCarts(localItems: CartItem[], serverItems: CartItem[]): CartItem[] {
	const result: CartItem[] = [...serverItems];

	for (const local of localItems) {
		const localIsBox =
			(local.boxContents?.length ?? 0) > 0 || (local.selectedItems?.length ?? 0) > 0;

		if (localIsBox) {
			result.push(local);
			continue;
		}

		const existingIndex = result.findIndex(
			(server) =>
				server.productId === local.productId &&
				(server.boxContents?.length ?? 0) === 0 &&
				(server.selectedItems?.length ?? 0) === 0
		);

		if (existingIndex >= 0) {
			result[existingIndex] = {
				...result[existingIndex],
				quantity: result[existingIndex].quantity + local.quantity,
			};
		} else {
			result.push(local);
		}
	}

	return result;
}

// ============================================================================
// Mutaciones del carrito (idénticas a antes + sincronización con la BD)
// ============================================================================

export function addToCart(product: Product, quantity = 1, selectedItems?: string[], boxContents?: SelectedBoxItem[]): void {
	const current = $cart.get();
	const existingIndex = current.findIndex((item) => item.productId === product.id);

	if (existingIndex > -1) {
		const updated = [...current];
		updated[existingIndex].quantity += quantity;
		if (selectedItems && selectedItems.length > 0) {
			updated[existingIndex].selectedItems = selectedItems;
		}
		if (boxContents && boxContents.length > 0) {
			updated[existingIndex].boxContents = boxContents;
		}
		$cart.set(updated);
	} else {
		const newItem: CartItem = {
			productId: product.id,
			name: product.name,
			categoryLabel: product.categoryLabel,
			price: product.price,
			priceFormatted: product.priceFormatted,
			imageSrc: product.imageSrc,
			quantity,
			shortDescription: product.shortDescription,
			selectedItems: selectedItems && selectedItems.length > 0 ? selectedItems : undefined,
			boxContents: boxContents && boxContents.length > 0 ? boxContents : undefined,
		};
		$cart.set([...current, newItem]);
	}


	openCart();
	queueServerSync();
}

export function updateQuantity(productId: string, delta: number): void {
	const current = $cart.get();
	const updated = current
		.map((item) => {
			if (item.productId === productId) {
				const nextQuantity = item.quantity + delta;
				return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
			}
			return item;
		})
		.filter((item): item is CartItem => item !== null);

	$cart.set(updated);
	queueServerSync();
}

export function removeFromCart(productId: string): void {
	const current = $cart.get();
	$cart.set(current.filter((item) => item.productId !== productId));
	queueServerSync();
}

export function restoreCartItem(item: CartItem, index?: number): void {
	const current = $cart.get();
	const exists = current.some((i) => i.productId === item.productId);
	if (exists) return;

	if (typeof index === 'number' && index >= 0 && index <= current.length) {
		const updated = [...current];
		updated.splice(index, 0, item);
		$cart.set(updated);
	} else {
		$cart.set([...current, item]);
	}
	queueServerSync();
}

export function clearCart(): void {
	$cart.set([]);
	queueServerSync();
}
