import React, { useState, useMemo, useEffect, useCallback } from 'react';
import MenuCard from './MenuCard';
import MenuFilters from './MenuFilters';
import { getProducts } from '../../lib/productsApi';
import type { Product } from '../../types/products';

type LoadStatus = 'loading' | 'ready' | 'error';

// Distribución del skeleton igual a la grilla real: las cajas premium (col-span-2)
// en las posiciones 3, 6 y 9
const SKELETON_LAYOUT: boolean[] = [
	false, false, true, false, false,
	true, false, false, true, false, false, false,
];

function MenuCardSkeleton({ premium }: { premium: boolean }) {
	return (
		<article
			aria-hidden="true"
			className={`flex flex-col justify-between rounded-[28px] sm:rounded-[34px] border border-pink/60 bg-beige overflow-hidden pb-4 sm:pb-5 shadow-[0_4px_16px_rgba(58,32,14,0.04)] ${
				premium ? 'col-span-2' : 'col-span-1'
			}`}
		>
			{premium ? (
				<div className="px-4 pt-4 py-2">
					<div className="h-40 sm:h-48 w-full animate-pulse rounded-2xl bg-pink/15" />
				</div>
			) : (
				<div className="h-32 sm:h-36 w-full" />
			)}

			<div className="mt-3 sm:mt-4 flex flex-col gap-2.5 sm:gap-3 px-4 sm:px-5">
				<div className="h-5 w-3/4 animate-pulse rounded-full bg-pink/15" />

				{premium ? (
					<div className="mt-1 flex items-center justify-between">
						<div className="h-5 w-20 animate-pulse rounded-full bg-pink/15" />
						<div className="h-8 w-24 animate-pulse rounded-full bg-pink/15" />
					</div>
				) : (
					<>
						<div className="h-4 w-16 animate-pulse rounded-full bg-pink/15" />
						<div className="h-8 w-full animate-pulse rounded-full bg-pink/15" />
						<div className="h-9 w-full animate-pulse rounded-full bg-pink/15" />
					</>
				)}
			</div>
		</article>
	);
}

function MenuErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center gap-4 py-16 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-7 w-7 text-pink"
					aria-hidden="true"
				>
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
					<path d="M12 9v4" />
					<path d="M12 17h.01" />
				</svg>
			</div>
			<div>
				<p className="font-sans text-lg font-bold text-brown">Ups, algo salió mal</p>
				<p className="mt-1 font-sans text-sm text-brown/70">
					No pudimos cargar los productos. Revisa tu conexión e inténtalo de nuevo.
				</p>
			</div>
			<button
				type="button"
				onClick={onRetry}
				className="rounded-full bg-pink px-6 py-2.5 font-sans text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
			>
				Reintentar
			</button>
		</div>
	);
}

export default function MenuCatalog() {
	const [products, setProducts] = useState<Product[]>([]);
	const [status, setStatus] = useState<LoadStatus>('loading');
	const [activeCategory, setActiveCategory] = useState<string>('galletas');
	const [searchQuery, setSearchQuery] = useState<string>('');

	const loadProducts = useCallback(async () => {
		setStatus('loading');
		try {
			const data = await getProducts();
			setProducts(data);
			setStatus('ready');
		} catch (err) {
			console.error('[MenuCatalog] Error al cargar productos:', err);
			setStatus('error');
		}
	}, []);

	useEffect(() => {
		loadProducts();
	}, [loadProducts]);

	// Filtrado reactivo en cliente (por pestaña y por búsqueda simultáneamente)
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			// Filtro de categoría: si es 'galletas' muestra galletas y combos relacionados de la vitrina
			const matchesCategory =
				activeCategory === 'todas' ||
				product.category === activeCategory ||
				(activeCategory === 'galletas' && product.variant === 'premium');

			// Filtro de búsqueda
			const matchesQuery =
				searchQuery.trim() === '' ||
				product.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase().trim());

			return matchesCategory && matchesQuery;
		});
	}, [products, activeCategory, searchQuery]);

	return (
		<div className="w-full">
			{/* Barra de Búsqueda y Tabs */}
			<MenuFilters
				activeCategory={activeCategory}
				onCategoryChange={(cat) => setActiveCategory(cat)}
				onSearchChange={(q) => setSearchQuery(q)}
			/>

			{/* Cuadrícula de Productos */}
			<section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 pb-20">
				{status === 'loading' ? (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
						{SKELETON_LAYOUT.map((premium, i) => (
							<MenuCardSkeleton key={i} premium={premium} />
						))}
					</div>
				) : status === 'error' ? (
					<MenuErrorState onRetry={loadProducts} />
				) : filteredProducts.length === 0 ? (
					<div className="py-16 text-center">
						<p className="font-sans text-lg font-semibold text-brown/70">
							{searchQuery.trim() !== ''
								? `No se encontraron productos para "${searchQuery}".`
								: 'No hay productos disponibles por ahora.'}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
						{filteredProducts.map((product) => (
							<MenuCard
								key={product.id}
								product={product}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
