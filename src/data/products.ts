import type { CategoryInfo, Product } from '../types/products';

// Importación de imágenes oficiales
import product1 from '../assets/images/menu/products/product-1.png';
import product2 from '../assets/images/menu/products/product-2.png';
import product3 from '../assets/images/menu/products/product-3.png';
import product4 from '../assets/images/menu/products/product-4.png';
import product5 from '../assets/images/menu/products/product-5.png';
import product6 from '../assets/images/menu/products/product-6.png';
import product7 from '../assets/images/menu/products/product-7.png';
import product8 from '../assets/images/menu/products/product-8.png';

// Especiales / Premiums
import productSpecial1 from '../assets/images/menu/products/product-special-1.png';
import productSpecial2 from '../assets/images/menu/products/product-special-2.png';
import productSpecial3 from '../assets/images/menu/products/product-special-3.png';

export const CATEGORIES: CategoryInfo[] = [
	{
		id: 'galletas',
		label: 'Galletas',
		description: 'Galletas artesanales recién horneadas con centros cremosos y suaves.',
	},
	{
		id: 'cuchareables',
		label: 'Cuchareables',
		description: 'Postres por capas diseñados para disfrutar directo con cuchara.',
	},
	{
		id: 'brownies',
		label: 'Brownies',
		description: 'Brownies fudgy con textura densa y chocolates seleccionados.',
	},
	{
		id: 'tortas',
		label: 'Tortas',
		description: 'Tortas artesanales y mini cakes esponjosos con rellenos exquisitos.',
	},
	{
		id: 'otros',
		label: 'Otros productos',
		description: 'Novedades de repostería, combinaciones crujientes y temporadas.',
	},
];

export const PRODUCTS: Product[] = [
	// Fila 1
	{
		id: 'galleta-caramelo-salado',
		name: 'Galleta Caramelo Salado',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Galleta con centro fundente y topping de toffee y caramelo salado artesanal.',
		fullDescription: 'Masa suave de mantequilla horneada al punto perfecto, con un generoso baño de caramelo salado casero y cristales de sal marina que realzan su sabor dulce e intenso.',
		ingredients: ['Mantequilla pura', 'Caramelo toffee artesanal', 'Sal marina en escamas', 'Vainilla natural'],
		allergens: ['Gluten', 'Lácteos', 'Huevo'],
		imageSrc: product1.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'galleta-roche',
		name: 'Galleta Roché',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Galleta premium inspirada en el bombón italiano con avellanas y nutella.',
		fullDescription: 'Crocante en su corteza con avellanas tostadas picadas y líneas de chocolate semiamargo derretido, rellena con cremosa pasta de avellanas.',
		ingredients: ['Avellanas tostadas', 'Crema de cacao y avellanas', 'Chocolate de leche', 'Mantequilla fresca'],
		allergens: ['Frutos secos (avellanas)', 'Gluten', 'Lácteos', 'Huevo'],
		imageSrc: product2.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'combo-arma-tu-caja-x3',
		name: 'Arma tu caja x3',
		productType: 'custom_box',
		category: 'galletas',
		categoryLabel: 'Combos',
		price: 39000,
		priceFormatted: '$ 39.000',
		shortDescription: 'Caja especial de 3 galletas a tu elección con empaque de regalo.',
		fullDescription: 'Selecciona tus 3 sabores favoritos de nuestra vitrina y llévalos en la clásica caja rosa de Dimonca diseñada para compartir o regalar.',
		imageSrc: productSpecial1.src,
		available: true,
		variant: 'premium',
		boxConfig: {
			capacity: 3,
			allowDuplicates: true,
			includesIceCream: false,
			availableItemCategory: 'galletas',
		},
	},
	{
		id: 'galleta-klim',
		name: 'Galleta Klim',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Masa suave con abundante leche en polvo y corazón untuoso.',
		fullDescription: 'Un homenaje a uno de los sabores más queridos: masa enriquecida con leche en polvo, centro cremoso y una lluvia fina de leche Klim en el exterior.',
		ingredients: ['Leche en polvo Klim', 'Mantequilla artesanal', 'Chocolate blanco', 'Harina seleccionada'],
		allergens: ['Lácteos', 'Gluten', 'Huevo'],
		imageSrc: product3.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'galleta-maracuya',
		name: 'Galleta Maracuyá',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Cremoso centro de reducción de maracuyá ácido con chocolate blanco.',
		fullDescription: 'El contraste perfecto entre la dulzura de la masa horneada y la acidez vibrante del curd de maracuyá natural con semillas crujientes.',
		ingredients: ['Pulpa natural de maracuyá', 'Mantequilla', 'Chocolate blanco belga', 'Vainilla'],
		allergens: ['Lácteos', 'Gluten', 'Huevo'],
		imageSrc: product4.src,
		available: true,
		variant: 'standard',
	},

	// Fila 2
	{
		id: 'combo-arma-tu-caja-x9',
		name: 'Arma tu caja x9',
		productType: 'custom_box',
		category: 'galletas',
		categoryLabel: 'Combos',
		price: 39000,
		priceFormatted: '$ 39.000',
		shortDescription: 'Nuestra caja más grande y completa para celebraciones especiales.',
		fullDescription: 'La experiencia Dimonca definitiva: 9 de nuestras mejores galletas recién salidas del horno en nuestra caja coleccionable de fiesta.',
		imageSrc: productSpecial2.src,
		available: true,
		variant: 'premium',
		boxConfig: {
			capacity: 9,
			allowDuplicates: true,
			includesIceCream: false,
			availableItemCategory: 'galletas',
		},
	},
	{
		id: 'galleta-habibi',
		name: 'Galleta Habibi',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Masa de chocolate brownie con pistachos y centro cremoso estilo Dubai.',
		fullDescription: 'Inspirada en el sabor del medio oriente: masa densa de cacao oscuro cargada de pistachos tostados y relleno volcánico de auténtica crema de pistacho.',
		ingredients: ['Cacao oscuro', 'Pistachos tostados', 'Crema de pistacho 100%', 'Mantequilla'],
		allergens: ['Frutos secos (pistacho)', 'Lácteos', 'Gluten', 'Huevo'],
		imageSrc: product5.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'crookie',
		name: 'Crookie',
		productType: 'single',
		category: 'otros',
		categoryLabel: 'Otros productos',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Croissant hojaldrado relleno y cubierto con masa de galleta horneada.',
		fullDescription: 'Mantequilloso croissant francés combinado con nuestra masa de galleta con chispas de chocolate derretidas. Crujiente por fuera y suave en el interior.',
		ingredients: ['Croissant hojaldrado', 'Masa de galleta artesanal', 'Mantequilla francesa', 'Chips de chocolate'],
		allergens: ['Gluten', 'Lácteos', 'Huevo'],
		imageSrc: product6.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'combo-arma-tu-caja-x3-helado',
		name: 'Arma tu caja x3 + Helado',
		productType: 'custom_box',
		category: 'galletas',
		categoryLabel: 'Combos',
		price: 39000,
		priceFormatted: '$ 39.000',
		shortDescription: '3 galletas calientitas acompañadas de tarros de helado artesanal.',
		fullDescription: 'La combinación soñada: combina tus galletas favoritas con nuestros cremosos helados de autor para una experiencia de temperatura irresistible.',
		imageSrc: productSpecial3.src,
		available: true,
		variant: 'premium',
		boxConfig: {
			capacity: 3,
			allowDuplicates: true,
			includesIceCream: true,
			availableItemCategory: 'galletas',
		},
	},

	// Fila 3
	{
		id: 'galleta-red-velvet',
		name: 'Galleta Red Velvet',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Galleta de red velvet con relleno cremoso de queso y chocolate blanco.',
		fullDescription: 'Sutil sabor a cacao fino con el toque aterciopelado característico, relleno de crema de queso horneada y decorado con hilos de chocolate blanco.',
		ingredients: ['Cacao fino', 'Queso crema especial', 'Chocolate blanco', 'Mantequilla fresca'],
		allergens: ['Lácteos', 'Gluten', 'Huevo'],
		imageSrc: product7.src,
		available: true,
		variant: 'standard',
	},
	{
		id: 'galleta-pistacho',
		name: 'Galleta Pistacho',
		productType: 'single',
		category: 'galletas',
		categoryLabel: 'Galletas',
		price: 11000,
		priceFormatted: '$11.000',
		shortDescription: 'Masa verde de pistachos reales con chocolate blanco y tropezones crocantes.',
		fullDescription: 'Masa elaborada a base de pasta pura de pistachos, con un balance aromático excepcional y tropezones crujientes en cada mordisco.',
		ingredients: ['Pasta pura de pistacho', 'Pistachos enteros tostados', 'Mantequilla pura', 'Chocolate blanco'],
		allergens: ['Frutos secos (pistacho)', 'Lácteos', 'Gluten', 'Huevo'],
		imageSrc: product8.src,
		available: true,
		variant: 'standard',
	},
];

export async function getProducts(options?: { category?: string; query?: string; type?: 'single' | 'custom_box' }): Promise<Product[]> {
	let result = [...PRODUCTS];

	if (options?.type) {
		result = result.filter((p) => p.productType === options.type);
	}

	if (options?.category && options.category !== 'todas') {
		result = result.filter((p) => p.category === options.category);
	}

	if (options?.query && options.query.trim() !== '') {
		const q = options.query.toLowerCase().trim();
		result = result.filter((p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
	}

	return result;
}

export function getProductById(id: string): Product | undefined {
	return PRODUCTS.find((p) => p.id === id);
}

// Helper para obtener todas las galletas disponibles para armar las cajas
export function getAvailableCookies(): Product[] {
	return PRODUCTS.filter((p) => p.productType === 'single' && p.category === 'galletas');
}