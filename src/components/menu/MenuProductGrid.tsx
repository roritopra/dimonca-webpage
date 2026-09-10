import React from 'react';
import MenuCard, { type ProductItem } from './MenuCard';

import carameloSaladoImg from '../../assets/images/menu/home/galleta-item-banner-3.png';
import rocheImg from '../../assets/images/menu/home/galleta-item-banner-4.png';
import klimImg from '../../assets/images/menu/home/galleta-item-banner-5.png';
import maracuyaImg from '../../assets/images/menu/home/galleta-banner-1.png';
import habibiImg from '../../assets/images/menu/home/galleta-item-banner-1.png';
import crookieImg from '../../assets/images/home/navbar/crookie.png';
import redVelvetImg from '../../assets/images/menu/home/galleta-item-banner-2.png';
import pistachoImg from '../../assets/images/menu/home/galleta-item-banner-6.png';
import cajaImg from '../../assets/images/home/combos/caja.png';

const MOCK_PRODUCTS: ProductItem[] = [
	// Fila 1
	{
		id: 'galleta-caramelo-salado',
		name: 'Galleta Caramelo Salado',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: carameloSaladoImg.src,
		variant: 'standard',
	},
	{
		id: 'galleta-roche',
		name: 'Galleta Roché',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: rocheImg.src,
		variant: 'standard',
	},
	{
		id: 'combo-arma-tu-caja-x3',
		name: 'Arma tu caja x3',
		price: 39000,
		priceFormatted: '$ 39.000',
		imageSrc: cajaImg.src,
		variant: 'premium',
	},
	{
		id: 'galleta-klim',
		name: 'Galleta Klim',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: klimImg.src,
		variant: 'standard',
	},
	{
		id: 'galleta-maracuya',
		name: 'Galleta Maracuyá',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: maracuyaImg.src,
		variant: 'standard',
	},

	// Fila 2
	{
		id: 'combo-arma-tu-caja-x9',
		name: 'Arma tu caja x9',
		price: 39000,
		priceFormatted: '$ 39.000',
		imageSrc: cajaImg.src,
		variant: 'premium',
	},
	{
		id: 'galleta-habibi',
		name: 'Galleta Habibi',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: habibiImg.src,
		variant: 'standard',
	},
	{
		id: 'crookie',
		name: 'Crookie',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: crookieImg.src,
		variant: 'standard',
	},
	{
		id: 'combo-arma-tu-caja-x3-helado',
		name: 'Arma tu caja x3 + Helado',
		price: 39000,
		priceFormatted: '$ 39.000',
		imageSrc: cajaImg.src,
		variant: 'premium',
	},

	// Fila 3
	{
		id: 'galleta-red-velvet',
		name: 'Galleta Red Velvet',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: redVelvetImg.src,
		variant: 'standard',
	},
	{
		id: 'galleta-pistacho',
		name: 'Galleta Pistacho',
		price: 11000,
		priceFormatted: '$11.000',
		imageSrc: pistachoImg.src,
		variant: 'standard',
	},
];

export default function MenuProductGrid() {
	return (
		<section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 pb-20">
			{/* Grid adaptable de 6 columnas en desktop para encajar perfectamente estándar (1 col) y premium (2 cols) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
				{MOCK_PRODUCTS.map((product) => (
					<MenuCard key={product.id} product={product} />
				))}
			</div>
		</section>
	);
}