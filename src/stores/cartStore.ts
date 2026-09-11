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

// Descarga el carrito del servidor al iniciar sesión:
// - Si el servidor YA tiene items → la BD es la fuente de verdad (el local se
//   descarta). Esto evita duplicación: si hicieramos merge local+servidor en
//   cada recarga, las cantidades crecerían x2 en cada refresh.
// - Si el servidor está VACÍO → se adopta el carrito local (migración de
//   invitado: lo que agregaste sin sesión sube a tu cuenta).
async function pullAndMerge(): Promise<void> {
	const user = $user.get();
	if (!user || isMerging) return;
	isMerging = true;

	try {
		const cartId = await getOrCreateCartId(user.id);
		const serverItems = await fetchCartItems(cartId);

		if (serverItems.length > 0) {
			$cart.set(serverItems);
		} else {
			const localItems = $cart.get();
			$cart.set(localItems);
			await replaceCartItems(cartId, localItems);
		}
	} catch (err) {
		console.error('[cartStore] Error al cargar el carrito al iniciar sesión:', err);
	} finally {
		isMerging = false;
	}
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
