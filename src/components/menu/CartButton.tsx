import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cartCount, toggleCart } from '../../stores/cartStore';

export default function CartButton() {
	const count = useStore($cartCount);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<button
			type="button"
			onClick={toggleCart}
			id="nav-cart-btn-trigger"
			className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-transform hover:scale-110 active:scale-95"
			aria-label={`Ver carrito de compras, ${mounted ? count : 0} artículos`}
		>
			<svg className="h-6 w-6 sm:h-7 sm:w-7 stroke-current stroke-[1.75]" fill="none" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
			{mounted && count > 0 && (
				<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink text-[11px] font-bold text-white shadow-xs animate-scaleIn">
					{count > 99 ? '99+' : count}
				</span>
			)}
		</button>
	);
}
