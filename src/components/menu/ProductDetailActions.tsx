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

	return (
		<div className="flex flex-col gap-4">
			{/* Selector de Unidades: píldora blanca con bordes azules según diseño final */}
			<div className="relative flex h-12 items-center rounded-full border-2 border-blue-600 bg-white shadow-[0_3px_10px_rgba(58,32,14,0.10)]">
				<button
					type="button"
					onClick={handleDecrease}
					disabled={quantity <= 1}
					className="absolute left-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-[0_2px_8px_rgba(106,167,213,0.5)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
					aria-label="Disminuir unidades"
				>
					&minus;
				</button>
				<span className="w-full text-center font-sans text-lg font-bold text-blue-600">
					{quantity}
				</span>
				<button
					type="button"
					onClick={handleIncrease}
					className="absolute right-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-[0_2px_8px_rgba(106,167,213,0.5)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
					aria-label="Aumentar unidades"
				>
					+
				</button>
			</div>

			{/* Botón principal: agregar al carrito */}
			<button
				type="button"
				onClick={handleAddToCart}
				disabled={isAdding}
				className="flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 font-sans text-lg font-bold text-white shadow-[0_3px_12px_rgba(106,167,213,0.45)] transition-all hover:bg-blue-500 active:scale-[0.98] cursor-pointer disabled:opacity-80"
			>
				<span>Agregar al carrito</span>
				<span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
					<svg className="h-4 w-4 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</span>
			</button>
		</div>
	);
}
