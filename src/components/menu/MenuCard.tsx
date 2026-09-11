import React, { useState } from 'react';
import { addToCart } from '../../stores/cartStore';
import type { Product } from '../../types/products';

interface MenuCardProps {
	product: Product;
}

export default function MenuCard({ product }: MenuCardProps) {
	const isPremium = product.variant === 'premium';
	const [quantity, setQuantity] = useState<number>(0);

	function handleDecrease() {
		if (quantity > 0) {
			setQuantity(quantity - 1);
		}
	}

	function handleIncrease() {
		const nextQty = quantity + 1;
		setQuantity(nextQty);
		// Sincronizar con el carrito global persistente
		addToCart(product, 1);
	}


	return (
		<article
			className={`flex flex-col justify-between rounded-[28px] sm:rounded-[34px] border border-pink/60 bg-beige backdrop-blur-xs overflow-hidden pb-4 sm:pb-5 shadow-[0_4px_16px_rgba(58,32,14,0.04)] hover:shadow-[0_12px_28px_rgba(58,32,14,0.09)] transition-all duration-300 ${
				isPremium ? 'col-span-2' : 'col-span-1'
			}`}
		>
			{/* Área Superior: Imagen (Sin padding, ocupa todo el ancho y alto asignado de la card) */}
			{isPremium ? (
				// Tarjeta Premium (Caja / Combo): Imagen completa centrada
				<div className="relative flex h-48 sm:h-56 w-full items-center justify-center overflow-hidden bg-transparent px-4 pt-4 py-2">
					<img
						src={product.imageSrc}
						alt={product.name}
						className="h-full w-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
						loading="lazy"
					/>
				</div>
			) : (
				// Tarjeta Estándar (Galleta individual): Sin padding, abarca todo el ancho de borde a borde
				<div className="relative h-32 sm:h-36 w-full overflow-hidden bg-transparent">
					<img
						src={product.imageSrc}
						alt={product.name}
						className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-48 sm:w-56 max-w-none object-contain drop-shadow-[0_8px_16px_rgba(58,32,14,0.14)] transition-transform duration-300 hover:scale-105"
						loading="lazy"
					/>
				</div>
			)}


			{/* Área Inferior: Datos y Acciones (Con el padding original) */}
			<div className="mt-3 sm:mt-4 flex flex-col px-4 sm:px-5">
				{/* Título */}
				<h3 className="font-sans text-base sm:text-lg font-extrabold text-brown leading-tight line-clamp-1">
					{product.name}
				</h3>


				{/* Contenido según tipo de card */}
				{isPremium ? (
					// Card Premium: Precio al lado izquierdo y botón 'Ver más' al lado derecho
					<div className="mt-3 sm:mt-4 flex items-center justify-between">
						<span className="font-sans text-base sm:text-lg font-bold text-pink">
							{product.priceFormatted}
						</span>

						<a
							href={`/menu/caja/${product.id}`}
							className="flex items-center gap-1.5 rounded-full bg-pink px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 no-underline cursor-pointer"
						>
							<span>Ver más</span>
							<span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-pink text-[10px] font-extrabold">
								↗
							</span>
						</a>
					</div>
				) : (
					// Card Estándar: Precio arriba, Selector de unidades (- 0 +) y botón 'Ver más'
					<div className="mt-2 flex flex-col gap-2.5 sm:gap-3">
						<span className="font-sans text-sm sm:text-base font-bold text-pink">
							{product.priceFormatted}
						</span>

						{/* Píldora de Cantidad (-  0  +) */}
						<div className="flex w-full items-center justify-between rounded-full border border-pink/40 bg-[#fff5f8] px-2 py-1 shadow-2xs">
							<button
								type="button"
								onClick={handleDecrease}
								disabled={quantity <= 0}
								className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-pink text-white transition-all hover:opacity-90 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
								aria-label="Restar 1 unidad"
							>
								<span className="text-sm sm:text-base font-extrabold leading-none">−</span>
							</button>

							<span className="font-sans text-xs sm:text-sm font-semibold text-brown/70 select-none">
								{quantity}
							</span>

							<button
								type="button"
								onClick={handleIncrease}
								className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-pink text-white transition-all hover:opacity-90 active:scale-90 cursor-pointer"
								aria-label="Añadir 1 unidad"
							>
								<span className="text-sm sm:text-base font-extrabold leading-none">+</span>
							</button>
						</div>

						{/* Botón Ver más ↗ */}
						<a
							href={`/menu/${product.id}`}
							className="flex w-full items-center justify-center gap-1.5 rounded-full bg-pink py-2 px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-transform hover:scale-[1.02] active:scale-95 no-underline cursor-pointer"
						>
							<span>Ver más</span>
							<span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-pink text-[10px] font-extrabold">
								↗
							</span>
						</a>
					</div>
				)}
			</div>
		</article>
	);
}