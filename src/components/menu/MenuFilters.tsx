import React, { useEffect, useState } from 'react';

interface MenuFiltersProps {
	activeCategory?: string;
	onCategoryChange?: (category: string) => void;
	onSearchChange?: (query: string) => void;
}

const CATEGORIES = [
	{ id: 'todas', label: 'Todos' },
	{ id: 'galletas', label: 'Galletas' },
	{ id: 'cuchareables', label: 'Cuchareables' },
	{ id: 'brownies', label: 'Brownies' },
	{ id: 'tortas', label: 'Tortas' },
	{ id: 'otros', label: 'Otros productos' },
];

export default function MenuFilters({
	activeCategory = 'todas',
	onCategoryChange,
	onSearchChange,
}: MenuFiltersProps) {
	const [searchVal, setSearchVal] = useState<string>('');

	function handleCategoryClick(id: string) {
		onCategoryChange?.(id);
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const val = e.target.value;
		setSearchVal(val);
		onSearchChange?.(val);
	}

	return (
		<section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-2 pb-6">
			{/* 1. Barra de Búsqueda */}
			<div className="relative w-full">
				<div className="flex items-center w-full bg-white rounded-xl sm:rounded-2xl border border-brown/25 px-4 sm:px-5 py-2.5 sm:py-3 shadow-[0_2px_8px_rgba(58,32,14,0.04)] focus-within:border-pink focus-within:ring-2 focus-within:ring-pink/20 transition-all">
					<input
						type="text"
						value={searchVal}
						onChange={handleInputChange}
						placeholder="Buscar"
						className="w-full bg-transparent font-sans text-sm sm:text-base text-brown placeholder:text-brown/45 outline-none"
					/>
					<div className="shrink-0 pl-3 flex items-center justify-center text-brown/50">
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 stroke-current stroke-[1.8]"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* 2. Píldoras / Tabs de Categorías */}
			<div className="mt-4 sm:mt-5 flex items-center justify-start gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
				{CATEGORIES.map((cat) => {
					const isActive = activeCategory === cat.id;

					return (
						<button
							key={cat.id}
							type="button"
							onClick={() => handleCategoryClick(cat.id)}
							className={`shrink-0 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 font-sans text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
								isActive
									? 'bg-[#ffeef3] text-pink border border-pink font-bold shadow-xs'
									: 'bg-transparent text-brown/80 border border-brown/30 hover:border-brown/60 hover:text-brown'
							}`}
						>
							{cat.label}
						</button>
					);
				})}
			</div>
		</section>
	);
}