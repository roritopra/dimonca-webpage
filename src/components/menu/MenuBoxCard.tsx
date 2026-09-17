import React from 'react';
import type { Product } from '../../types/products';

interface MenuBoxCardProps {
	product: Product;
}

/**
 * Card exclusiva para CAJAS (productos `isPremium` / custom_box).
 * - La imagen de la caja se expande en escala en hover (no se desplaza hacia arriba).
 * - En hover aparece un panel blanco flotando ALREDEDOR del bloque de info:
 *   es `absolute` con insets negativos animados, así que no toca el layout
 *   y la card queda quieta (nada se mueve ni se corre).
 * - El panel es el PRIMER hijo con z-0 y el contenido va encima con z-10,
 *   por lo que título, precio y "Ver más" SIEMPRE quedan visibles.
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

			{/* Bloque de info: tamaño fijo, solo cambia el fondo flotante alrededor */}
			<div className="relative mt-3 rounded-lg sm:mt-4 p-4 sm:p-5 group-hover:bg-white">
				{/* Panel blanco: primer hijo (queda detrás) y con z-0 explícito */}
				<div
					aria-hidden="true"
					className="absolute inset-0 z-0 rounded-2xl bg-white opacity-0 transition-all duration-300 ease-out group-hover:-top-2 group-hover:-right-2.5 group-hover:-bottom-3.5 group-hover:-left-2.5 group-hover:opacity-100 group-hover:shadow-[0_6px_20px_rgba(58,32,14,0.07)]"
				/>

				{/* Contenido: siempre visible encima del panel */}
				<div className="relative z-10">
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
