import React, { useState } from 'react';
import type { Product } from '../../types/products';
import { addToCart } from '../../stores/cartStore';

interface Props {
	product: Product;
}

export default function ProductDetailActions({ product }: Props) {
	const [quantity, setQuantity] = useState<number>(1);
	const [isAdding, setIsAdding] = useState<boolean>(false);

	function handleDecrease() {
		if (quantity > 1) setQuantity(quantity - 1);
	}

	function handleIncrease() {
		setQuantity(quantity + 1);
	}

	function handleAddToCart() {
		setIsAdding(true);
		addToCart(product, quantity);
		setTimeout(() => {
			setIsAdding(false);
		}, 600);
	}

	function handleBuyNow() {
		addToCart(product, quantity);
		// Mock de verificación de autenticación para pagar
		alert(
			'¡Listo para comprar! El sistema validará tu sesión con Supabase antes de proceder al pago.'
		);
		window.location.href = '/login';
	}

	return (
		<div className="flex flex-col gap-5 pt-6 border-t border-brown/15">
			{/* Selector de Unidades */}
			<div className="flex items-center gap-4">
				<span className="font-sans text-sm font-bold text-brown">Cantidad:</span>
				<div className="flex items-center rounded-full border border-brown/20 bg-white px-2 py-1 shadow-xs">
					<button
						type="button"
						onClick={handleDecrease}
						disabled={quantity <= 1}
						className="flex h-8 w-8 items-center justify-center rounded-full text-brown/70 hover:bg-pink/10 hover:text-pink transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-lg font-bold"
						aria-label="Disminuir unidades"
					>
						-
					</button>
					<span className="min-w-10 text-center font-sans text-base font-bold text-brown">
						{quantity}
					</span>
					<button
						type="button"
						onClick={handleIncrease}
						className="flex h-8 w-8 items-center justify-center rounded-full text-brown/70 hover:bg-pink/10 hover:text-pink transition-colors text-lg font-bold"
						aria-label="Aumentar unidades"
					>
						+
					</button>
				</div>
				<span className="text-xs text-brown/60">
					Subtotal: <strong className="text-brown">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price * quantity).replace('COP', '$')}</strong>
				</span>
			</div>

			{/* Botones de Acción */}
			<div className="flex flex-col sm:flex-row gap-3 pt-2">
				<button
					type="button"
					onClick={handleAddToCart}
					disabled={isAdding}
					className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-pink bg-white px-6 py-3.5 font-sans text-base font-bold text-pink shadow-xs transition-all hover:bg-pink hover:text-white active:scale-95 cursor-pointer"
				>
					<svg className="h-5 w-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<span>{isAdding ? '¡Agregado!' : 'Agregar al Carrito'}</span>
				</button>

				<button
					type="button"
					onClick={handleBuyNow}
					className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink px-6 py-3.5 font-sans text-base font-bold text-white shadow-md shadow-pink/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
				>
					<span>Comprar Ahora</span>
					<svg className="h-5 w-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				</button>
			</div>
		</div>
	);
}
