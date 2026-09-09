import { persistentAtom } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';
import type { CartItem, Product } from '../types/products';

// Store persistente en localStorage bajo la clave "dimonca_cart"
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

export function addToCart(product: Product, quantity = 1): void {
	const current = $cart.get();
	const existingIndex = current.findIndex((item) => item.productId === product.id);

	if (existingIndex > -1) {
		const updated = [...current];
		updated[existingIndex].quantity += quantity;
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
		};
		$cart.set([...current, newItem]);
	}

	openCart();
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
}

export function removeFromCart(productId: string): void {
	const current = $cart.get();
	$cart.set(current.filter((item) => item.productId !== productId));
}

export function clearCart(): void {
	$cart.set([]);
}
