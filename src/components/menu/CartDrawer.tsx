import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
	$cart,
	$cartTotal,
	$cartCount,
	$isCartOpen,
	closeCart,
	updateQuantity,
	removeFromCart,
	formatCurrency,
} from '../../stores/cartStore';

export default function CartDrawer() {
	const cart = useStore($cart);
	const total = useStore($cartTotal);
	const count = useStore($cartCount);
	const isOpen = useStore($isCartOpen);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	function handleCheckout() {
		// Mock de validación de autenticación previo a checkout
		alert(
			'¡Listo para pagar! Aquí se verificará tu sesión con Supabase. Como aún no has iniciado sesión, te redirigirá a /login.'
		);
		window.location.href = '/login';
	}

	if (!mounted) return null;

	return (
		<div
			className={`fixed inset-0 z-[10001] transition-visibility duration-300 ${
				isOpen ? 'visible' : 'invisible'
			}`}
			aria-hidden={!isOpen}
		>
			{/* Backdrop oscurecido */}
			<div
				className={`fixed inset-0 bg-brown/60 backdrop-blur-xs transition-opacity duration-300 ${
					isOpen ? 'opacity-100' : 'opacity-0'
				}`}
				onClick={closeCart}
			/>

			{/* Panel lateral */}
			<aside
				className={`fixed inset-y-0 right-0 z-10 flex w-full max-w-md flex-col bg-beige text-brown shadow-2xl transition-transform duration-300 ease-out ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				{/* Header del carrito */}
				<div className="flex items-center justify-between border-b border-brown/15 px-6 py-5 bg-beige">
					<div className="flex items-center gap-2.5">
						<h2 className="font-sans text-xl font-bold text-brown">Tu Carrito</h2>
						<span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-pink px-2 text-xs font-semibold text-white">
							{count}
						</span>
					</div>
					<button
						type="button"
						onClick={closeCart}
						className="flex h-9 w-9 items-center justify-center rounded-full text-brown/70 transition-colors hover:bg-brown/10 hover:text-brown"
						aria-label="Cerrar carrito"
					>
						<svg className="h-5 w-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Lista de productos */}
				<div className="flex-1 overflow-y-auto px-6 py-4">
					{cart.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-center py-12">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink/15 text-pink mb-4">
								<svg className="h-10 w-10 stroke-current stroke-[1.8]" fill="none" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
								</svg>
							</div>
							<p className="font-sans text-lg font-bold text-brown">Tu carrito está vacío</p>
							<p className="mt-1 text-sm text-brown/70">
								Explora nuestro menú y endulza tu día con tus postres favoritos.
							</p>
							<button
								type="button"
								onClick={closeCart}
								className="mt-6 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
							>
								Ver Menú
							</button>
						</div>
					) : (
						<div className="flex flex-col divide-y divide-brown/10">
							{cart.map((item) => (
								<div key={item.productId} className="flex items-center gap-4 py-4">
									<img
										src={item.imageSrc}
										alt={item.name}
										className="h-20 w-20 shrink-0 rounded-2xl bg-white/70 object-contain p-2 shadow-xs border border-brown/10"
									/>
									<div className="flex flex-1 flex-col">
										<span className="text-xs font-medium text-pink uppercase tracking-wider">
											{item.categoryLabel}
										</span>
										<a
											href={`/menu/${item.productId}`}
											onClick={closeCart}
											className="font-sans text-sm font-bold text-brown hover:text-pink transition-colors line-clamp-1"
										>
											{item.name}
										</a>
										<span className="text-sm font-semibold text-brown mt-0.5">
											{item.priceFormatted}
										</span>

										{/* Controles de cantidad */}
										<div className="mt-2 flex items-center justify-between">
											<div className="flex items-center rounded-full border border-brown/20 bg-white/80 p-0.5 shadow-2xs">
												<button
													type="button"
													onClick={() => updateQuantity(item.productId, -1)}
													className="flex h-6 w-6 items-center justify-center rounded-full text-brown/70 hover:bg-pink hover:text-white transition-colors text-xs font-bold"
													aria-label="Disminuir cantidad"
												>
													-
												</button>
												<span className="min-w-6 text-center text-xs font-bold text-brown px-1">
													{item.quantity}
												</span>
												<button
													type="button"
													onClick={() => updateQuantity(item.productId, 1)}
													className="flex h-6 w-6 items-center justify-center rounded-full text-brown/70 hover:bg-pink hover:text-white transition-colors text-xs font-bold"
													aria-label="Aumentar cantidad"
												>
													+
												</button>
											</div>

											<button
												type="button"
												onClick={() => removeFromCart(item.productId)}
												className="text-xs text-brown/50 hover:text-pink transition-colors font-medium underline"
											>
												Eliminar
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer con subtotal y botón de pagar */}
				{cart.length > 0 && (
					<div className="border-t border-brown/15 bg-white/50 p-6 backdrop-blur-xs">
						<div className="mb-4 flex items-center justify-between">
							<span className="font-sans text-sm font-medium text-brown/80">Subtotal</span>
							<span className="font-sans text-xl font-bold text-brown">
								{formatCurrency(total)}
							</span>
						</div>
						<p className="mb-4 text-xs text-brown/60 text-center">
							Impuestos incluidos. Costo de envío calculado en el checkout.
						</p>
						<button
							type="button"
							onClick={handleCheckout}
							className="flex w-full items-center justify-center gap-2 rounded-full bg-pink py-3.5 px-6 font-sans text-base font-bold text-white shadow-md shadow-pink/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
						>
							<span>Ir a Pagar</span>
							<svg className="h-5 w-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
							</svg>
						</button>
					</div>
				)}
			</aside>
		</div>
	);
}
