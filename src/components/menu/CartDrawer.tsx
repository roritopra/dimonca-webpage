import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
	$cart,
	$cartTotal,
	$isCartOpen,
	closeCart,
	updateQuantity,
	removeFromCart,
	addToCart,
	formatCurrency,
} from '../../stores/cartStore';

// Imagen de caja vacía
import emptyBoxImg from '../../assets/images/menu/home/empty-box.png';

// Mock de sugerencias para "¿Un último antojo?" (estilo de galletas del menú)
import carameloSaladoImg from '../../assets/images/menu/home/galleta-item-banner-3.png';
import rocheImg from '../../assets/images/menu/home/galleta-item-banner-4.png';
import klimImg from '../../assets/images/menu/home/galleta-item-banner-5.png';
import type { Product } from '../../types/products';

const UPSELL_ITEMS: Product[] = [
	{
		id: 'galleta-caramelo-salado',
		name: 'Galleta Caramelo Salado',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Galleta con trozos de caramelo suave y un toque de sal marina.',
		fullDescription: 'Galleta con trozos de caramelo suave y un toque de sal marina.',
		imageSrc: carameloSaladoImg.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'galleta-roche',
		name: 'Galleta Roché',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Galleta estilo bombón roche con avellanas y centro de chocolate.',
		fullDescription: 'Galleta estilo bombón roche con avellanas y centro de chocolate.',
		imageSrc: rocheImg.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'galleta-klim',
		name: 'Galleta Klim',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'La consentida de la casa con deliciosa leche en polvo Klim.',
		fullDescription: 'La consentida de la casa con deliciosa leche en polvo Klim.',
		imageSrc: klimImg.src,
		available: true,
		variant: 'standard',
	},
];

export default function CartDrawer() {
	const cart = useStore($cart);
	const total = useStore($cartTotal);
	const isOpen = useStore($isCartOpen);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			document.documentElement.style.overflow = 'hidden';
			if ((window as any).lenis) {
				(window as any).lenis.stop();
			}
		} else {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
			if ((window as any).lenis) {
				(window as any).lenis.start();
			}
		}
		return () => {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
			if ((window as any).lenis) {
				(window as any).lenis.start();
			}
		};
	}, [isOpen]);

	function handleOverlayWheel(e: React.WheelEvent) {
		const scrollContainer = document.getElementById('cart-scroll-body');
		if (scrollContainer) {
			scrollContainer.scrollTop += e.deltaY;
		}
	}

	function handleGoToMenu() {
		closeCart();
		if (window.location.pathname !== '/menu' && window.location.pathname !== '/menu/') {
			window.location.href = '/menu';
		}
	}

	function handleCheckout() {
		alert('¡Listo para comprar! Aquí se validará la autenticación con Supabase.');
		window.location.href = '/login';
	}

	if (!mounted) return null;

	const isEmpty = cart.length === 0;

	return (
		<div
			className={`fixed inset-0 z-[10001] transition-visibility duration-300 overscroll-none touch-none ${
				isOpen ? 'visible' : 'invisible'
			}`}
			aria-hidden={!isOpen}
			onWheel={handleOverlayWheel}
		>
			{/* Backdrop oscurecido */}
			<div
				className={`fixed inset-0 bg-brown/50 backdrop-blur-2xs transition-opacity duration-300 overscroll-none touch-none ${
					isOpen ? 'opacity-100' : 'opacity-0'
				}`}
				onClick={closeCart}
			/>

			{/* Panel lateral */}
			<aside
				className={`fixed inset-y-0 right-0 z-10 flex w-full max-w-[500px] sm:max-w-[540px] flex-col bg-[#f7f3eb] text-brown shadow-2xl transition-transform duration-300 ease-out overscroll-contain touch-auto ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
				onWheel={(e) => e.stopPropagation()}
			>
				{/* 1. Header del Carrito */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-brown/10 bg-[#fbf8f2]">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg p-1 text-pink">
							<svg className="h-6 w-6 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h2 className="font-sans text-2xl font-black tracking-tight text-brown">
							Tu carrito
						</h2>
					</div>

					<button
						type="button"
						onClick={closeCart}
						className="flex h-8 w-8 items-center justify-center rounded-md text-pink hover:bg-pink/10 transition-colors"
						aria-label="Cerrar carrito"
					>
						<span className="text-base font-bold leading-none">✕</span>
					</button>
				</div>

				{/* 2. Cuerpo del Carrito */}
				{isEmpty ? (
					// ESTADO VACÍO: Imagen de la caja, texto y botón "Ver menú ↗"
					<div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
						<div className="relative w-72 sm:w-80 max-w-full flex items-center justify-center mb-6">
							<img
								src={emptyBoxImg.src}
								alt="Caja Dimonca vacía"
								className="w-full h-auto object-contain drop-shadow-sm"
							/>
						</div>

						<h3 className="font-sans text-3xl sm:text-4xl font-extrabold text-brown tracking-tight mb-6">
							Tu carrito está vacío
						</h3>

						<button
							type="button"
							onClick={handleGoToMenu}
							className="inline-flex items-center justify-center gap-2 rounded-full bg-pink px-7 py-3 font-sans text-base font-bold text-white shadow-md shadow-pink/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
						>
							<span>Ver menú</span>
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-pink text-xs font-extrabold">
								↗
							</span>
						</button>
					</div>
				) : (
					// ESTADO CON PRODUCTOS: Lista de items + Antojo + Subtotal
					<>
						<div
							id="cart-scroll-body"
							className="flex-1 overflow-y-auto px-6 py-5 space-y-6 overscroll-contain cart-scrollbar"
						>
							<div className="space-y-5">
								{cart.map((item) => {
									const isBox = item.name.toLowerCase().includes('caja');

									return (
										<div
											key={item.productId}
											className="relative flex items-center gap-4 bg-transparent pb-4"
										>
											{/* Marco de Imagen Cuadrado compacto con borde rosa suave */}
											<div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 rounded-2xl border border-pink/60 bg-[#faf6f0] p-1.5 flex items-center justify-center overflow-hidden shadow-2xs">
												<img
													src={item.imageSrc}
													alt={item.name}
													className="max-h-full max-w-full object-contain drop-shadow-xs"
												/>
											</div>

											{/* Detalles del Ítem */}
											<div className="flex flex-1 flex-col justify-between self-stretch py-0.5">
												<div className="flex items-start justify-between">
													<h3 className="font-sans text-base font-extrabold text-brown leading-tight">
														{item.name}
													</h3>
													<button
														type="button"
														onClick={() => removeFromCart(item.productId)}
														className="flex h-6 w-6 items-center justify-center rounded text-pink hover:bg-pink/10 transition-colors"
														aria-label={`Eliminar ${item.name}`}
													>
														<span className="text-xs font-bold leading-none">✕</span>
													</button>
												</div>

												{isBox && item.selectedItems && item.selectedItems.length > 0 ? (
													<ul className="mt-1 space-y-0.5 text-xs text-brown/70">
														{item.selectedItems.map((cookieName, idx) => (
															<li key={`${idx}-${cookieName}`} className="flex items-center gap-1.5">
																<span className="h-1 w-1 rounded-full bg-brown/50 inline-block shrink-0"></span>
																<span className="truncate">{cookieName}</span>
															</li>
														))}
													</ul>
												) : (
													<p className="mt-1 text-xs text-brown/60 line-clamp-2 leading-relaxed">
														{item.shortDescription ||
															'El postre que nos transporta a la infancia en cada bocado...'}
													</p>
												)}

												<div className="mt-2.5 flex items-center justify-between">
													<div className="flex items-center rounded-full border border-pink/40 bg-[#fff5f8] px-2 py-0.5 shadow-2xs">
														<button
															type="button"
															onClick={() => updateQuantity(item.productId, -1)}
															className="flex h-5 w-5 items-center justify-center rounded-full bg-pink text-white text-xs font-bold hover:opacity-90 active:scale-90 cursor-pointer"
														>
															−
														</button>
														<span className="min-w-6 text-center font-sans text-xs font-bold text-brown/75">
															{item.quantity}
														</span>
														<button
															type="button"
															onClick={() => updateQuantity(item.productId, 1)}
															className="flex h-5 w-5 items-center justify-center rounded-full bg-pink text-white text-xs font-bold hover:opacity-90 active:scale-90 cursor-pointer"
														>
															+
														</button>
													</div>

													<span className="font-sans text-base font-extrabold text-pink">
														{formatCurrency(item.price * item.quantity)}
													</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<hr className="border-t-2 border-pink/30 my-4" />

							<div className="pt-1">
								<h3 className="font-sans text-xl font-extrabold text-brown mb-3">
									¿Un último antojo?
								</h3>

								<div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
									{UPSELL_ITEMS.map((upsell) => {
										const currentItemInCart = cart.find((item) => item.productId === upsell.id);
										const itemQty = currentItemInCart ? currentItemInCart.quantity : 0;

										return (
											<article
												key={upsell.id}
												className="flex flex-col justify-between rounded-[22px] sm:rounded-[26px] border border-pink/60 bg-beige overflow-hidden pb-3 shadow-[0_2px_10px_rgba(58,32,14,0.04)] hover:shadow-[0_6px_16px_rgba(58,32,14,0.08)] transition-all duration-300"
											>
												{/* Imagen recortada como la card de galleta estándar */}
												<div className="relative h-20 sm:h-24 w-full overflow-hidden bg-transparent">
													<img
														src={upsell.imageSrc}
														alt={upsell.name}
														className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 sm:w-36 max-w-none object-contain drop-shadow-[0_4px_10px_rgba(58,32,14,0.12)] transition-transform duration-300 hover:scale-105"
														loading="lazy"
													/>
												</div>

												{/* Información y botones */}
												<div className="mt-2 flex flex-col px-2.5 sm:px-3">
													<h4 className="font-sans text-xs sm:text-sm font-extrabold text-brown leading-tight line-clamp-1">
														{upsell.name}
													</h4>

													<div className="mt-1.5 flex flex-col gap-1.5 sm:gap-2">
														<span className="font-sans text-xs sm:text-sm font-bold text-pink">
															{upsell.priceFormatted}
														</span>

														{/* Píldora de Cantidad (-  qty  +) */}
														<div className="flex w-full items-center justify-between rounded-full border border-pink/40 bg-[#fff5f8] px-1.5 py-0.5 shadow-2xs">
															<button
																type="button"
																onClick={() => {
																	if (itemQty > 0) {
																		updateQuantity(upsell.id, -1);
																	}
																}}
																disabled={itemQty <= 0}
																className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-pink text-white transition-all hover:opacity-90 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
																aria-label={`Restar 1 unidad de ${upsell.name}`}
															>
																<span className="text-xs sm:text-sm font-extrabold leading-none">−</span>
															</button>

															<span className="font-sans text-[11px] sm:text-xs font-semibold text-brown/70 select-none">
																{itemQty}
															</span>

															<button
																type="button"
																onClick={() => addToCart(upsell, 1)}
																className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-pink text-white transition-all hover:opacity-90 active:scale-90 cursor-pointer"
																aria-label={`Añadir 1 unidad de ${upsell.name}`}
															>
																<span className="text-xs sm:text-sm font-extrabold leading-none">+</span>
															</button>
														</div>
													</div>
												</div>
											</article>
										);
									})}
								</div>
							</div>
						</div>

						{/* 3. Footer Fijo con Subtotal y Botón Comprar */}
						<div className="border-t border-brown/10 bg-[#f5efe3] px-6 py-5">
							<div className="flex items-center justify-between mb-4">
								<span className="font-sans text-lg font-black text-brown">Subtotal:</span>
								<span className="font-sans text-xl font-black text-brown">
									{formatCurrency(total)}
								</span>
							</div>

							<button
								type="button"
								onClick={handleCheckout}
								className="flex w-full items-center justify-center gap-2 rounded-full bg-pink py-3 px-6 font-sans text-base font-bold text-white shadow-md shadow-pink/20 transition-all hover:opacity-95 active:scale-98 cursor-pointer"
							>
								<span>Comprar</span>
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-pink text-xs font-extrabold">
									↗
								</span>
							</button>
						</div>
					</>
				)}
			</aside>
		</div>
	);
}