import React from 'react';
import type { Product } from '../../types/products';

interface MenuBoxCardProps {
	product: Product;
}

/**
 * Card exclusiva para CAJAS (productos `isPremium` / custom_box).
 * - La imagen de la caja se expande en escala en hover (no se desplaza hacia arriba).
 * - El bloque de info es un panel blanco FIJO (rounded-lg), sin overlays ni flotación.
 */
export default function MenuBoxCard({ product }: MenuBoxCardProps) {
	return (
		<article className="group relative col-span-2 flex flex-col justify-between rounded-[28px] sm:rounded-[34px] border border-pink/60 bg-beige backdrop-blur-xs shadow-[0_4px_16px_rgba(58,32,14,0.04)] transition-[background-color,box-shadow] duration-300 ease-out hover:bg-[#ffeaf2] hover:shadow-[0_12px_28px_rgba(58,32,14,0.09)]">
			{/* Imagen de la caja: en hover solo escala, sin desplazarse */}
			<div className="relative flex h-48 sm:h-56 w-full items-center justify-center overflow-hidden bg-transparent">
				<img
					src={product.imageSrc}
					alt={product.name}
					className="h-full w-full object-contain drop-shadow-md transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
					loading="lazy"
				/>
			</div>

			{/* Bloque de info: transparente en reposo; en hover aparece el blanco flotando con transición */}
			<div className="relative mt-3 rounded-lg sm:mt-4 p-4 sm:p-5 bg-transparent transition-[transform,border-radius,box-shadow,background-color] duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[0.94] group-hover:rounded-2xl group-hover:bg-white group-hover:shadow-[0_10px_26px_rgba(58,32,14,0.10)]">
				{/* Contenido en su propio div de flujo (sin overlays encima) */}
				<div>
					<h3 className="font-sans text-base sm:text-lg font-extrabold text-brown leading-tight line-clamp-1">
						{product.name}
					</h3>

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
				</div>
			</div>
		</article>
	);
}
