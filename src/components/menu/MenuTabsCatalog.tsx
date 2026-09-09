import React, { useState } from 'react';
import type { Product, ProductCategory } from '../../types/products';
import { CATEGORIES } from '../../data/products';
import { addToCart } from '../../stores/cartStore';

interface Props {
	products: Product[];
}

export default function MenuTabsCatalog({ products }: Props) {
	const [activeCategory, setActiveCategory] = useState<string>('todas');
	const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

	const filteredProducts =
		activeCategory === 'todas'
			? products
			: products.filter((p) => p.category === activeCategory);

	return (
		<div className="w-full">
			{/* Barra de Tabs de Categorías */}
			<div className="sticky top-[72px] z-40 bg-beige/95 backdrop-blur-md py-4 border-b border-brown/10 mb-10 transition-all">
				<div className="mx-auto flex max-w-7xl items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto px-4 scrollbar-none">
					<button
						type="button"
						onClick={() => setActiveCategory('todas')}
						className={`shrink-0 rounded-full px-5 py-2.5 font-sans text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer ${
							activeCategory === 'todas'
								? 'bg-pink text-white shadow-md shadow-pink/20 scale-105'
								: 'bg-white/60 text-brown hover:bg-white hover:text-pink border border-brown/10'
						}`}
					>
						Todos los Postres
					</button>

					{CATEGORIES.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setActiveCategory(cat.id)}
							className={`shrink-0 rounded-full px-5 py-2.5 font-sans text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer ${
								activeCategory === cat.id
									? 'bg-pink text-white shadow-md shadow-pink/20 scale-105'
									: 'bg-white/60 text-brown hover:bg-white hover:text-pink border border-brown/10'
							}`}
						>
							{cat.label}
						</button>
					))}
				</div>
			</div>

			{/* Grid de Productos */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
				{filteredProducts.length === 0 ? (
					<div className="text-center py-20">
						<p className="text-xl font-bold text-brown">No hay productos en esta categoría por el momento.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
						{filteredProducts.map((product) => {
							const isHovered = hoveredProduct === product.id;
							const displayImg = isHovered && product.imageHoverSrc ? product.imageHoverSrc : product.imageSrc;

							return (
								<div
									key={product.id}
									onMouseEnter={() => setHoveredProduct(product.id)}
									onMouseLeave={() => setHoveredProduct(null)}
									className="group flex flex-col justify-between rounded-3xl bg-white p-5 shadow-[0_4px_20px_rgba(58,32,14,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(58,32,14,0.12)] border border-brown/10 relative overflow-hidden"
								>
									{/* Badge */}
									{product.badge && (
										<span
											style={{ backgroundColor: product.badgeColor || '#f45d8c' }}
											className="absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
										>
											{product.badge}
										</span>
									)}

									{/* Imagen enlazada al detalle */}
									<a
										href={`/menu/${product.id}`}
										className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-beige/50 p-4 transition-colors group-hover:bg-beige/80"
										aria-label={`Ver detalles de ${product.name}`}
									>
										<img
											src={displayImg}
											alt={product.name}
											className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
											loading="lazy"
										/>
									</a>

									{/* Info */}
									<div className="mt-4 flex flex-1 flex-col">
										<span className="text-xs font-semibold uppercase tracking-wider text-pink">
											{product.categoryLabel}
										</span>
										<a
											href={`/menu/${product.id}`}
											className="mt-1 font-sans text-lg font-bold text-brown transition-colors hover:text-pink line-clamp-1"
										>
											{product.name}
										</a>
										<p className="mt-1.5 text-xs text-brown/70 line-clamp-2 leading-relaxed flex-1">
											{product.shortDescription}
										</p>

										{/* Precio y Botón Agregar */}
										<div className="mt-4 flex items-center justify-between pt-3 border-t border-brown/10">
											<div>
												<span className="text-[11px] text-brown/50 block font-medium">Precio</span>
												<span className="font-sans text-lg font-bold text-brown">
													{product.priceFormatted}
												</span>
											</div>

											<button
												type="button"
												onClick={() => addToCart(product, 1)}
												className="flex items-center gap-1.5 rounded-full bg-pink px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-pink-600 hover:scale-105 active:scale-95 cursor-pointer"
												aria-label={`Agregar ${product.name} al carrito`}
											>
												<svg className="h-4 w-4 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
												</svg>
												<span>Agregar</span>
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
