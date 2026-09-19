import React from 'react';
import { motion } from 'motion/react';
import type { Product } from '../../types/products';

interface MenuBoxCardProps {
	product: Product;
}

// Springs suaves: salida elástica sin rebotes bruscos
const CARD_SPRING = { type: 'spring', stiffness: 220, damping: 26 } as const;
const IMAGE_SPRING = { type: 'spring', stiffness: 180, damping: 18 } as const;

/**
 * Card exclusiva para CAJAS (productos `isPremium` / custom_box).
 * - La imagen de la caja se expande en escala en hover con spring de `motion`
 *   (no se desplaza hacia arriba).
 * - El bloque de info es transparente en reposo; en hover aparece el panel
 *   blanco flotando (bg + scale + subida + redondeo + sombra, todo animado
 *   con springs), sin overlays absolutos ni cambios de layout.
 */
export default function MenuBoxCard({ product }: MenuBoxCardProps) {
	return (
		<motion.article
			initial="rest"
			whileHover="hover"
			animate="rest"
			variants={{
				rest: {
					backgroundColor: '#f7f2e8',
					boxShadow: '0 4px 16px rgba(58,32,14,0.04)',
				},
				hover: {
					backgroundColor: '#fddfe8',
					boxShadow: '0 12px 28px rgba(58,32,14,0.09)',
				},
			}}
			transition={CARD_SPRING}
			className="relative col-span-2 flex h-full flex-col justify-between rounded-[18px] border-2 border-pink-500 backdrop-blur-xs"
		>
			{/* Imagen de la caja: en hover solo escala, sin desplazarse */}
			<div className="relative flex h-48 sm:h-56 w-full items-center justify-center overflow-hidden bg-transparent">
				<motion.img
					src={product.imageSrc}
					alt={product.name}
					variants={{ rest: { scale: 1 }, hover: { scale: 1.1 } }}
					transition={IMAGE_SPRING}
					className="h-full w-full object-contain drop-shadow-md"
					loading="lazy"
				/>
			</div>

			{/* Bloque de info: transparente en reposo; en hover aparece el blanco flotando */}
			<motion.div
				variants={{
					rest: {
						backgroundColor: 'rgba(255,255,255,0)',
						scale: 1,
						y: 0,
						borderRadius: '8px',
						boxShadow: '0 0 0 rgba(58,32,14,0)',
					},
					hover: {
						backgroundColor: 'rgba(255,255,255,1)',
						scale: 0.94,
						y: -4,
						borderRadius: '16px',
						boxShadow: '0 10px 26px rgba(58,32,14,0.10)',
					},
				}}
				transition={CARD_SPRING}
				className="relative mt-3 sm:mt-4 p-4 sm:p-5"
			>
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
			</motion.div>
		</motion.article>
	);
}
