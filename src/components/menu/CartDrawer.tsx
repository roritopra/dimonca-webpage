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

// Mock de sugerencias para "¿Un último antojo?"
import cuchareableRedVelvetImg from '../../assets/images/home/more-than/cuchareable.png';
import klimImg from '../../assets/images/menu/products/product-3.png';
import miniCuchareableImg from '../../assets/images/home/more-than/mini-cake.png';

const UPSELL_ITEMS = [
	{
		id: 'cuchareable-red-velvet',
		name: 'Cuchareable Red Velvet',
		price: 18000,
		priceFormatted: '$ 18.000',
		imageSrc: cuchareableRedVelvetImg.src,
		borderClass: 'border-[#9accf4]',
	},
	{
		id: 'galleta-klim-upsell',
		name: 'Galleta Klim',
		price: 11000,
		priceFormatted: '$ 11.000',
		imageSrc: klimImg.src,
		borderClass: 'border-pink/70',
	},
	{
		id: 'mini-cuchareable-maracuya',
		name: 'Mini Cuchareable Maracuyá',
		price: 14000,
		priceFormatted: '$ 14.000',
		imageSrc: miniCuchareableImg.src,
		borderClass: 'border-[#9accf4]',
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
		// Redirigir el scroll del mouse hacia el interior del carrito incluso si el cursor está sobre el overlay
		const scrollContainer = document.getElementById('cart-scroll-body');
		if (scrollContainer) {
			scrollContainer.scrollTop += e.deltaY;
		}
	}

	function handleCheckout() {
		alert('¡Listo para comprar! Aquí se validará la autenticación con Supabase.');
		window.location.href = '/login';
	}

	if (!mounted) return null;

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

			{/* Panel lateral con ancho ampliado según diseño */}
			<aside
				className={`fixed inset-y-0 right-0 z-10 flex w-full max-w-[500px] sm:max-w-[540px] flex-col bg-[#f7f3eb] text-brown shadow-2xl transition-transform duration-300 ease-out overscroll-contain touch-auto ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
				onWheel={(e) => e.stopPropagation()}
			>
				{/* 1. Header del Carrito */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-brown/10 bg-[#fbf8f2]">
					<div className="flex items-center gap-3">
						{/* Icono de Carrito con borde azul y cuerpo rosa */}
						<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#9accf4] p-1 text-pink">
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

					{/* Botones de Cabecera a la derecha (opciones / cerrar) */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={closeCart}
							className="flex h-8 w-8 items-center justify-center rounded-md border border-pink/60 text-pink hover:bg-pink/10 transition-colors"
							aria-label="Cerrar carrito"
						>
							<span className="text-base font-bold leading-none">✕</span>
						</button>
					</div>
				</div>

				{/* 2. Cuerpo desplazable (Items + Sugerencias) con scrollbar pink sin fondo blanco */}
				<div
					id="cart-scroll-body"
					className="flex-1 overflow-y-auto px-6 py-5 space-y-6 overscroll-contain cart-scrollbar"
				>
					{cart.length === 0 ? (
						<div className="py-16 text-center">
							<p className="font-sans text-lg font-bold text-brown">Tu carrito está vacío</p>
							<p className="mt-1 text-xs text-brown/70">
								Agrega tus postres y galletas favoritas para verlas aquí.
							</p>
						</div>
					) : (
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
												{/* Botón Eliminar con X celeste */}
												<button
													type="button"
													onClick={() => removeFromCart(item.productId)}
													className="flex h-6 w-6 items-center justify-center rounded text-pink hover:bg-pink/10 transition-colors"
													aria-label={`Eliminar ${item.name}`}
												>
													<span className="text-xs font-bold leading-none">✕</span>
												</button>
											</div>

											{/* Lista de Sabores seleccionados o descripción corta */}
											{isBox ? (
												<ul className="mt-1 space-y-0.5 text-xs text-brown/70">
													<li className="flex items-center gap-1.5">
														<span className="h-1 w-1 rounded-full bg-brown/50 inline-block"></span>
														Red Velvet
													</li>
													<li className="flex items-center gap-1.5">
														<span className="h-1 w-1 rounded-full bg-brown/50 inline-block"></span>
														Pistacho
													</li>
													<li className="flex items-center gap-1.5">
														<span className="h-1 w-1 rounded-full bg-brown/50 inline-block"></span>
														Maracuyá
													</li>
												</ul>
											) : (
												<p className="mt-1 text-xs text-brown/60 line-clamp-2 leading-relaxed">
													{item.shortDescription ||
														'El postre que nos transporta a la infancia en cada bocado...'}
												</p>
											)}

											{/* Fila Inferior: Píldora de Cantidad (- 0 +) y Precio a la derecha */}
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
					)}

					{/* Línea divisoria rosa */}
					<hr className="border-t-2 border-pink/30 my-4" />

					{/* 3. Sección "¿Un último antojo?" */}
					<div className="pt-1">
						<h3 className="font-sans text-xl font-extrabold text-brown mb-3">
							¿Un último antojo?
						</h3>

						{/* Carrusel / Grid de 3 tarjetas de antojo */}
						<div className="grid grid-cols-3 gap-2.5 sm:gap-3">
							{UPSELL_ITEMS.map((upsell) => (
								<div
									key={upsell.id}
									onClick={() =>
										addToCart(
											{
												id: upsell.id,
												name: upsell.name,
												category: 'cuchareables',
												categoryLabel: 'Antojos',
												price: upsell.price,
												priceFormatted: upsell.priceFormatted,
												shortDescription: upsell.name,
												fullDescription: upsell.name,
												imageSrc: upsell.imageSrc,
												available: true,
											},
											1
										)
									}
									className={`flex flex-col justify-between rounded-2xl border ${upsell.borderClass} bg-white/80 p-2.5 shadow-2xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer`}
								>
									<div className="relative h-20 w-full flex items-center justify-center overflow-hidden">
										<img
											src={upsell.imageSrc}
											alt={upsell.name}
											className="h-full w-full object-contain"
										/>
									</div>
									<p className="mt-2 font-sans text-xs font-bold text-brown leading-tight line-clamp-2">
										{upsell.name}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* 4. Footer Fijo con Subtotal y Botón Comprar */}
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
			</aside>
		</div>
	);
}