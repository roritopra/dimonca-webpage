import React, { useState, useMemo } from 'react';
import MenuCard from './MenuCard';
import MenuFilters from './MenuFilters';
import { PRODUCTS } from '../../data/products';
import type { Product } from '../../types/products';

interface MenuCatalogProps {
	initialProducts?: Product[];
}

export default function MenuCatalog({ initialProducts = PRODUCTS }: MenuCatalogProps) {
	const [activeCategory, setActiveCategory] = useState<string>('galletas');
	const [searchQuery, setSearchQuery] = useState<string>('');

	// Filtrado reactivo en cliente (por pestaña y por búsqueda simultáneamente)
	const filteredProducts = useMemo(() => {
		return initialProducts.filter((product) => {
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
	}, [initialProducts, activeCategory, searchQuery]);

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
				{filteredProducts.length === 0 ? (
					<div className="py-16 text-center">
						<p className="font-sans text-lg font-semibold text-brown/70">
							No se encontraron productos para "{searchQuery}".
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