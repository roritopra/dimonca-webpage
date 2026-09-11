import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Product, SelectedBoxItem } from '../../types/products';
import { addToCart, formatCurrency } from '../../stores/cartStore';

import closedBoxImg from '../../assets/images/menu/box-page/closed-box.png';
import openedBoxImg from '../../assets/images/menu/box-page/opened-box.png';
import coverBoxImg from '../../assets/images/menu/box-page/cover-box.png';

interface BoxBuilderProps {
	boxProduct: Product;
	availableCookies: Product[];
}

export default function BoxBuilder({ boxProduct, availableCookies }: BoxBuilderProps) {
	const maxCapacity = boxProduct.boxConfig?.capacity || 3;
	const basePrice = boxProduct.price;

	// Estado: mapa de id de galleta -> cantidad seleccionada
	const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});

	// Total de galletas actualmente elegidas
	const totalSelectedCookies = useMemo(() => {
		return Object.values(selectedCounts).reduce((sum, count) => sum + count, 0);
	}, [selectedCounts]);

	// Lista plana de galletas elegidas para posicionarlas dentro de la caja
	const chosenCookiesList = useMemo(() => {
		const list: Product[] = [];
		for (const cookie of availableCookies) {
			const count = selectedCounts[cookie.id] || 0;
			for (let i = 0; i < count; i++) {
				list.push(cookie);
			}
		}
		return list;
	}, [availableCookies, selectedCounts]);

	// Precio total: base + adiciones de galletas especiales
	const totalPrice = useMemo(() => {
		let total = basePrice;
		for (const cookie of availableCookies) {
			const count = selectedCounts[cookie.id] || 0;
			if (count > 0 && cookie.extraPrice) {
				total += cookie.extraPrice * count;
			}
		}
		return total;
	}, [basePrice, availableCookies, selectedCounts]);

	function handleDecrease(cookieId: string) {
		setSelectedCounts((prev) => {
			const current = prev[cookieId] || 0;
			if (current <= 0) return prev;
			const next = { ...prev };
			if (current === 1) {
				delete next[cookieId];
			} else {
				next[cookieId] = current - 1;
			}
			return next;
		});
	}

	function handleIncrease(cookieId: string) {
		if (totalSelectedCookies >= maxCapacity) {
			alert(`Solo puedes elegir un máximo de ${maxCapacity} galletas para esta caja.`);
			return;
		}

		setSelectedCounts((prev) => ({
			...prev,
			[cookieId]: (prev[cookieId] || 0) + 1,
		}));
	}

	function handleAddToCart() {
		if (totalSelectedCookies !== maxCapacity) {
			alert(`Por favor elige las ${maxCapacity} galletas para completar tu caja (llevas ${totalSelectedCookies}/${maxCapacity}).`);
			return;
		}

		// Construir lista de galletas para el carrito
		const boxContents: SelectedBoxItem[] = [];
		const selectedNames: string[] = [];

		for (const cookie of availableCookies) {
			const count = selectedCounts[cookie.id];
			if (count && count > 0) {
				boxContents.push({
					productId: cookie.id,
					name: cookie.name,
					imageSrc: cookie.imageSrc,
					quantity: count,
				});
				for (let i = 0; i < count; i++) {
					selectedNames.push(cookie.name);
				}
			}
		}

		// Añadir al store persistente del carrito con las galletas dinámicamente seleccionadas
		addToCart(
			{
				id: `${boxProduct.id}-${Date.now()}`,
				name: boxProduct.name,
				productType: 'custom_box',
				category: boxProduct.category,
				categoryLabel: boxProduct.categoryLabel,
				price: totalPrice,
				priceFormatted: formatCurrency(totalPrice),
				shortDescription: `${boxProduct.name}: ${selectedNames.join(', ')}`,
				fullDescription: boxProduct.fullDescription,
				imageSrc: boxProduct.imageSrc,
				available: true,
			},
			1,
			selectedNames
		);
	}

	const isBoxOpen = totalSelectedCookies > 0;

	return (
		<div className="w-full flex flex-col xl:flex-row items-stretch min-h-[620px] bg-[#f7f3ea] border-b border-brown/15">
			
			{/* ========================================================= */}
			{/* COLUMNA IZQUIERDA: CAJA PROTAGONISTA SOBRE PATRÓN DE PUNTOS */}
			{/* ========================================================= */}
			<div
				className="w-full xl:w-1/2 relative flex items-center justify-center p-6 sm:p-8 lg:p-10 xl:p-8 border-b xl:border-b-0 xl:border-r border-brown/15 min-h-[360px] sm:min-h-[420px] xl:min-h-[520px] select-none overflow-hidden"
				style={{
					backgroundImage: 'radial-gradient(circle, rgba(58, 32, 14, 0.22) 1.8px, transparent 1.8px)',
					backgroundSize: '20px 20px',
					backgroundColor: '#f7f2e8',
				}}
			>
				<div className="relative w-full max-w-[420px] sm:max-w-[480px] xl:max-w-[500px] aspect-[538/387] flex items-center justify-center">
					{/* 1. Caja Cerrada (visible cuando no hay galletas seleccionadas) */}
					<div
						className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-300 ease-out ${
							!isBoxOpen
								? 'opacity-100 scale-100 pointer-events-auto'
								: 'opacity-0 scale-98 pointer-events-none'
						}`}
					>
						<img
							src={closedBoxImg.src}
							width={closedBoxImg.width}
							height={closedBoxImg.height}
							alt="Caja cerrada de Dimonca"
							className="w-full h-full object-contain drop-shadow-[0_20px_32px_rgba(58,32,14,0.18)] block"
							loading="eager"
							decoding="sync"
						/>
					</div>

					{/* 2. Caja Abierta (visible cuando hay al menos 1 galleta seleccionada) */}
					<div
						className={`absolute inset-0 w-full h-full transition-all duration-300 ease-out ${
							isBoxOpen
								? 'opacity-100 scale-100 pointer-events-auto'
								: 'opacity-0 scale-98 pointer-events-none'
						}`}
					>
						{/* Capa 1: Fondo de la Caja Abierta (Z-Index 10) */}
						<img
							src={openedBoxImg.src}
							width={openedBoxImg.width}
							height={openedBoxImg.height}
							alt="Caja abierta de Dimonca"
							className="absolute inset-0 w-full h-full object-contain z-10 drop-shadow-[0_20px_32px_rgba(58,32,14,0.18)] pointer-events-none block"
							loading="eager"
							decoding="sync"
						/>

						{/* Capa 2: Galletas Seleccionadas - contenidas arriba de la base de la caja con overflow-hidden abajo */}
						<div className="absolute inset-x-0 bottom-[2%] top-[6%] z-20 overflow-hidden pointer-events-none px-[3%] flex items-end justify-center">
							<div className="relative w-full h-[70%] flex items-end justify-center">
								{chosenCookiesList.map((cookie, idx) => {
									const isNineBox = maxCapacity > 3;

									if (isNineBox) {
										// Distribución de 2 filas para la caja de 9:
										// Primeras 5 galletas (idx 0..4): Fila delantera (abajo, z-Index mayor 25)
										// Siguientes 4 galletas (idx 5..8): Fila trasera (arriba/medio, detrás de la primera fila z-Index 21)
										const isBackRow = idx >= 5;
										const rowIndex = isBackRow ? idx - 5 : idx;
										const rowTotal = isBackRow ? Math.min(4, chosenCookiesList.length - 5) : Math.min(5, chosenCookiesList.length);

										const step = 23;
										const translateX = rowTotal === 1 ? 0 : (rowIndex - (rowTotal - 1) / 2) * step;
										const rotation = (idx % 2 === 0 ? 1 : -1) * ((rowIndex + 1) * 2.5);

										// Fila trasera está elevada aproximadamente a la mitad (unos píxeles más abajo para quedar en la mitad justa) y con z-Index menor
										const bottomPos = isBackRow ? 33 : 10;
										const zIndex = isBackRow ? 21 : 25;
										const cookieWidth = 34;

										return (
											<div
												key={`cookie-slot-${idx}-${cookie.id}`}
												className="absolute aspect-square flex items-center justify-center transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6"
												style={{
													bottom: `${bottomPos}%`,
													width: `${cookieWidth}%`,
													zIndex,
													transform: `translateX(${translateX}%) rotate(${rotation}deg)`,
												}}
											>
												<img
													src={cookie.imageSrc}
													alt={cookie.name}
													className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(58,32,14,0.3)]"
												/>
											</div>
										);
									}

									// Caja normal (ej: x3): Fila única centrada
									const total = chosenCookiesList.length;
									const step = 44;
									const translateX = total === 1 ? 0 : (idx - (total - 1) / 2) * step;
									const rotation = (idx % 2 === 0 ? 1 : -1) * ((idx + 1) * 3);
									const yOffset = idx % 2 === 0 ? 0 : 3;

									return (
										<div
											key={`cookie-slot-${idx}-${cookie.id}`}
											className="absolute bottom-[10%] w-[34%] aspect-square flex items-center justify-center transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6 z-25"
											style={{
												transform: `translateX(${translateX}%) translateY(-${yOffset}%) rotate(${rotation}deg)`,
											}}
										>
											<img
												src={cookie.imageSrc}
												alt={cookie.name}
												className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(58,32,14,0.3)]"
											/>
										</div>
									);
								})}
							</div>
						</div>

						{/* Capa 3: Cobertura frontal inferior de la caja (Z-Index 30) */}
						<img
							src={coverBoxImg.src}
							alt=""
							aria-hidden="true"
							className="absolute bottom-0 left-0 w-full h-[25.09%] object-contain z-30 pointer-events-none"
						/>
					</div>
				</div>
			</div>

			{/* ========================================================= */}
			{/* COLUMNA DERECHA: SELECCIÓN DE GALLETAS + FOOTER CON TOTAL  */}
			{/* ========================================================= */}
			<div className="w-full xl:w-1/2 flex flex-col justify-between bg-[#f7f3ea] relative">
				
				{/* Encabezado con Botón Cerrar (X) */}
				<div className="px-6 lg:px-10 pt-8 pb-4">
					<div className="flex items-start justify-between">
						<div>
							<h1 className="font-sans text-3xl lg:text-4xl font-black text-pink tracking-tight">
								{boxProduct.name.toLowerCase().includes('x3') ? 'Caja X3 galletas' : boxProduct.name}
							</h1>
							<p className="font-sans text-xl lg:text-2xl font-black text-brown mt-1">
								{boxProduct.priceFormatted}
							</p>
							<p className="text-xs lg:text-sm text-brown/70 mt-1 leading-relaxed">
								Caja con {maxCapacity} galletas. Escoge tus {maxCapacity} sabores favoritos.
							</p>
						</div>

						{/* Botón X de volver al menú */}
						<a
							href="/menu"
							className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brown/60 hover:text-pink shadow-xs border border-brown/10 transition-colors"
							aria-label="Cerrar y volver al menú"
						>
							<span className="text-base font-bold leading-none">✕</span>
						</a>
					</div>

					<div className="mt-4 flex items-center justify-between border-b border-brown/10 pb-3">
						<p className="font-sans text-sm font-extrabold text-brown">
							Elije máximo {maxCapacity}:
						</p>
						<span className="font-sans text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink/15 text-pink">
							{totalSelectedCookies} / {maxCapacity} elegidas
						</span>
					</div>
				</div>

				{/* Lista de Galletas con Scroll Estilizado (.cart-scrollbar) */}
				<div className="flex-1 overflow-y-auto max-h-[380px] xl:max-h-[420px] px-4 sm:px-6 lg:px-10 py-2 pb-24 sm:pb-2 cart-scrollbar">
					<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
						{availableCookies.map((cookie) => {
							const count = selectedCounts[cookie.id] || 0;
							const hasExtra = !!cookie.extraPrice;

							return (
								<div
									key={cookie.id}
									className="flex flex-col sm:flex-row items-center justify-between bg-white sm:bg-transparent rounded-3xl sm:rounded-none p-3.5 sm:p-0 shadow-[0_4px_16px_rgba(58,32,14,0.05)] sm:shadow-none border border-brown/5 sm:border-0 min-h-[220px] sm:min-h-0 sm:gap-2.5 transition-all"
								>
									{/* Imagen de la Galleta */}
									<div className="relative h-24 w-24 sm:h-28 sm:w-28 xl:h-28 xl:w-28 shrink-0 flex items-center justify-center my-1 sm:my-0">
										<img
											src={cookie.imageSrc}
											alt={cookie.name}
											className="h-full w-full object-contain transition-transform duration-200 hover:scale-105"
										/>
									</div>

									{/* Info + Contador (Centrado vertical en mobile, flex-between pegado abajo) */}
									<div className="flex flex-col flex-1 w-full sm:w-auto items-center sm:items-start justify-between sm:justify-start min-w-0 mt-2 sm:mt-0 text-center sm:text-left">
										<div className="flex flex-col items-center sm:items-start">
											<span className="font-sans text-sm sm:text-xs xl:text-sm font-extrabold text-brown leading-tight truncate max-w-full">
												{cookie.name.replace('Galleta ', '')}
											</span>
											{hasExtra && (
												<span className="text-[12px] sm:text-[11px] font-bold text-pink leading-tight mt-0.5">
													{cookie.extraPriceFormatted || `(+ $${cookie.extraPrice})`}
												</span>
											)}
										</div>

										{/* Selector de cantidad (- 0 +) (Siempre pegado abajo en móvil) */}
										<div className="mt-3 sm:mt-1.5 flex items-center justify-center sm:justify-start w-full">
											<div className="inline-flex items-center gap-3 sm:gap-1.5">
												<button
													type="button"
													onClick={() => handleDecrease(cookie.id)}
													disabled={count <= 0}
													className="flex h-7 w-7 sm:h-5 sm:w-5 xl:h-6 xl:w-6 items-center justify-center rounded-full bg-pink text-white text-sm sm:text-xs font-bold hover:opacity-90 active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-transform shadow-xs sm:shadow-none"
													aria-label={`Disminuir ${cookie.name}`}
												>
													−
												</button>
												<span className="min-w-5 sm:min-w-4 text-center font-sans text-sm sm:text-xs xl:text-sm font-extrabold text-pink">
													{count}
												</span>
												<button
													type="button"
													onClick={() => handleIncrease(cookie.id)}
													disabled={totalSelectedCookies >= maxCapacity}
													className="flex h-7 w-7 sm:h-5 sm:w-5 xl:h-6 xl:w-6 items-center justify-center rounded-full bg-pink text-white text-sm sm:text-xs font-bold hover:opacity-90 active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-transform shadow-xs sm:shadow-none"
													aria-label={`Aumentar ${cookie.name}`}
												>
													+
												</button>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* 1. Footer Desktop (visible solo desde sm: >=640px) */}
				<div className="hidden sm:block border-t border-brown/15 bg-[#f5efe3] px-6 lg:px-10 py-5">
					<div className="flex items-center gap-2 mb-4">
						<span className="font-sans text-lg font-black text-brown">Total:</span>
						<span className="font-sans text-xl font-medium text-brown">
							{formatCurrency(totalPrice)}
						</span>
					</div>

					<div className="flex items-center gap-3">
						{/* Botón Añadir al carrito */}
						<button
							type="button"
							onClick={handleAddToCart}
							className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-pink bg-transparent py-2.5 px-5 font-sans text-sm lg:text-base font-bold text-pink hover:bg-pink/10 active:scale-98 transition-all cursor-pointer"
						>
							<span>Añadir al carrito</span>
							<svg className="h-5 w-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</button>
					</div>
				</div>

			</div>

			{/* 2. Footer Flotante Móvil (< 640px) que acompaña siempre en el bottom al hacer scroll, animado con motion */}
			<AnimatePresence>
				{totalSelectedCookies > 0 && (
					<motion.div
						key="mobile-box-footer"
						initial={{ y: '100%', opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: '100%', opacity: 0 }}
						transition={{
							type: 'spring',
							damping: 25,
							stiffness: 280,
							mass: 0.8,
						}}
						className="fixed bottom-0 inset-x-0 z-[999] sm:hidden bg-[#f5efe3]/95 backdrop-blur-md border-t border-brown/20 px-5 py-3.5 shadow-[0_-8px_24px_rgba(58,32,14,0.12)]"
					>
						<div className="flex items-center justify-between gap-4 max-w-md mx-auto">
							<div className="flex flex-col">
								<span className="text-[11px] font-bold text-brown/60 uppercase tracking-wider">
									Total ({totalSelectedCookies}/{maxCapacity})
								</span>
								<span className="font-sans text-lg font-black text-brown leading-tight">
									{formatCurrency(totalPrice)}
								</span>
							</div>

							{/* Solo botón Añadir al carrito en mobile */}
							<button
								type="button"
								onClick={handleAddToCart}
								className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink py-3 px-5 font-sans text-sm font-bold text-white shadow-md shadow-pink/25 active:scale-95 transition-transform cursor-pointer"
							>
								<span>Añadir al carrito</span>
								<svg className="h-4 w-4 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}