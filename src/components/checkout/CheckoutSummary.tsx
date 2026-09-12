import React from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartTotal, updateQuantity, removeFromCart, formatCurrency } from '../../stores/cartStore';

interface CheckoutSummaryProps {
	deliveryFee: number;
}

// Lado derecho del checkout: resumen de los items del carrito + totales
export default function CheckoutSummary({ deliveryFee }: CheckoutSummaryProps) {
	const cart = useStore($cart);
	const cartTotal = useStore($cartTotal);

	const subtotal = cartTotal;
	const total = subtotal + deliveryFee;

	if (cart.length === 0) {
		return (
			<aside className="flex w-full flex-col items-center gap-4 rounded-3xl border border-brown/10 bg-[#cfe0f5]/60 p-8 text-center">
				<p className="font-sans text-base font-bold text-brown">Tu carrito está vacío</p>
				<p className="font-sans text-sm text-brown/70">
					Agrega productos del menú para continuar con tu pedido.
				</p>
				<a
					href="/menu"
					className="flex h-11 items-center justify-center rounded-full bg-pink px-6 font-sans text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 no-underline"
				>
					Ir al menú
				</a>
			</aside>
		);
	}

	return (
		<aside className="flex w-full flex-col gap-4 rounded-3xl bg-[#cfe0f5]/60 p-4 sm:p-5">
			{/* Items del carrito */}
			{cart.map((item) => {
				const boxFlavors = item.boxContents ?? [];
				return (
					<article
						key={item.productId}
						className="flex gap-3 rounded-2xl border border-white bg-beige p-3 shadow-[0_4px_16px_rgba(58,32,14,0.05)]"
					>
						<div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
							<img src={item.imageSrc} alt={item.name} className="h-full w-full object-contain" />
						</div>

						<div className="flex min-w-0 flex-1 flex-col gap-1.5">
							<div className="flex items-start justify-between gap-2">
								<h3 className="font-sans text-sm font-extrabold leading-tight text-brown">
									{item.name}
								</h3>
								<button
									type="button"
									onClick={() => removeFromCart(item.productId)}
									aria-label={`Quitar ${item.name} del carrito`}
									className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border border-pink/60 text-pink transition-transform hover:scale-110 active:scale-90"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
										<path d="M18 6 6 18M6 6l12 12" />
									</svg>
								</button>
							</div>

							{/* Contenido de la caja armada */}
							{boxFlavors.length > 0 && (
								<ul className="flex flex-col gap-0.5">
									{boxFlavors.map((flavor) => (
										<li key={`${item.productId}-${flavor.productId}`} className="flex items-center gap-1.5 font-sans text-xs text-brown/80">
											<span className="h-1 w-1 rounded-full bg-pink" aria-hidden="true" />
											{flavor.name}
											{flavor.quantity > 1 && <span className="text-brown/50">×{flavor.quantity}</span>}
										</li>
									))}
								</ul>
							)}
							{!boxFlavors.length && item.shortDescription && (
								<p className="line-clamp-1 font-sans text-xs text-brown/70">{item.shortDescription}</p>
							)}

							<div className="mt-auto flex flex-col gap-1.5">
								<span className="font-sans text-sm font-bold text-pink">{item.priceFormatted}</span>

								{/* Píldora de cantidad */}
								<div className="flex w-full items-center justify-between rounded-full border border-pink/60 bg-white px-1.5 py-0.5">
									<button
										type="button"
										onClick={() => updateQuantity(item.productId, -1)}
										aria-label={`Restar una unidad de ${item.name}`}
										className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-pink text-white transition-all hover:opacity-90 active:scale-90"
									>
										<span className="text-sm font-extrabold leading-none">−</span>
									</button>
									<span className="font-sans text-sm font-semibold text-brown">{item.quantity}</span>
									<button
										type="button"
										onClick={() => updateQuantity(item.productId, 1)}
										aria-label={`Sumar una unidad de ${item.name}`}
										className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-pink text-white transition-all hover:opacity-90 active:scale-90"
									>
										<span className="text-sm font-extrabold leading-none">+</span>
									</button>
								</div>
							</div>
						</div>
					</article>
				);
			})}

			{/* Totales */}
			<div className="flex flex-col gap-2 px-2 pb-1 pt-2">
				<div className="flex items-center justify-between font-sans text-sm text-brown">
					<span>Subtotal:</span>
					<span className="font-semibold">{formatCurrency(subtotal)}</span>
				</div>
				<div className="flex items-center justify-between font-sans text-sm text-brown">
					<span>Domicilio:</span>
					<span className="font-semibold">{deliveryFee === 0 ? 'Gratis' : formatCurrency(deliveryFee)}</span>
				</div>
				<div className="mt-1 flex items-center justify-between border-t border-brown/15 pt-2">
					<span className="font-sans text-lg font-black text-brown">Total:</span>
					<span className="font-sans text-xl font-black text-brown">{formatCurrency(total)}</span>
				</div>
			</div>
		</aside>
	);
}
