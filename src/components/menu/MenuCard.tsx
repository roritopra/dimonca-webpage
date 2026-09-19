import React, { useState } from 'react';
import { addToCart } from '../../stores/cartStore';
import type { Product } from '../../types/products';

interface MenuCardProps {
	product: Product;
	/**
	 * Activa los view-transition-name para la animación de expansión card → detalle.
	 * SOLO en la grilla del menú: si otra card en la misma página repite el nombre
	 * (ej. "Más sabores" en el detalle), el navegador aborta la transición completa
	 * y no se ve ninguna animación.
	 */
	withTransition?: boolean;
}

/**
 * Card de producto INDIVIDUAL (normal/single).
 * Las premium de CAJA viven en el componente aparte MenuBoxCard.
 */
export default function MenuCard({ product, withTransition = false }: MenuCardProps) {
	const [quantity, setQuantity] = useState<number>(0);

	// La animación de expansión es solo mobile (< 640px, gate por CSS en
	// view-transitions.css). Los nombres de transición NO se ponen aquí:
	// si todas las cards los tuvieran, las 11 no clickeadas quedarían como
	// snapshots fantasma flotando durante la transición. Un script global los
	// aplica SOLO a la card clickeada en el momento del click (ver Layout).
	const useNames = withTransition && product.variant !== 'premium';

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
			className="group relative col-span-1 flex h-full flex-col justify-between rounded-[18px] border-2 border-pink-500 bg-beige backdrop-blur-xs pb-4 sm:pb-5 shadow-[0_4px_16px_rgba(58,32,14,0.04)] hover:shadow-[0_12px_28px_rgba(58,32,14,0.09)] transition-[background-color,box-shadow] duration-300 ease-out hover:bg-pink-100"
			data-vt-card={useNames ? product.id : undefined}
		>
			{/* Área Superior: Imagen (Sin padding, ocupa todo el ancho y alto asignado de la card) */}
			{/* Franja de imagen más baja y la card empuja el contenido hacia abajo (justify-between);
			    en reposo galleta tapada a media vista (clip-path); en hover el clip se expande hacia
			    arriba y la galleta sube completa. */}
			<div className="relative h-28 sm:h-30 w-full bg-transparent [clip-path:inset(0_0_0_0)] transition-[clip-path] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[clip-path:inset(-140px_0_0_0)]">
				<img
					src={product.imageSrc}
					alt={product.name}
					className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 w-48 sm:w-56 max-w-none object-contain drop-shadow-[0_8px_16px_rgba(58,32,14,0.14)] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[42px] sm:group-hover:translate-y-[45px]"
					data-vt-image={useNames ? '' : undefined}
					loading="lazy"
				/>
			</div>


			{/* Área Inferior: Datos y Acciones (Con el padding original) */}
			<div className="relative mt-3 sm:mt-4 flex flex-col px-4 sm:px-5">
				{/* Título */}
				<h3
					className="font-sans text-base sm:text-lg font-extrabold text-brown leading-tight line-clamp-1"
					data-vt-name={useNames ? '' : undefined}
				>
					{product.name}
				</h3>

				{/* Precio arriba, Selector de unidades (- 0 +) y botón 'Ver más' */}
				<div className="mt-2 flex flex-col gap-2.5 sm:gap-3">
					<span
						className="font-sans text-sm sm:text-base font-bold text-pink"
						data-vt-price={useNames ? '' : undefined}
					>
						{product.priceFormatted}
					</span>

					{/* Píldora de Cantidad (-  0  +) */}
					<div className="flex w-full items-center justify-between rounded-full border border-pink/40 bg-pink-100 px-2 py-1 shadow-2xs">
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
			</div>
		</article>
	);
}
