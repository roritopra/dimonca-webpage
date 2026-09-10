export type ProductCategory = 'galletas' | 'cuchareables' | 'brownies' | 'tortas' | 'otros';

export type ProductType = 'single' | 'custom_box';

export interface CategoryInfo {
	id: ProductCategory;
	label: string;
	description: string;
}

export interface BoxConfiguration {
	capacity: number; // Ej: 3, 9 galletas
	allowDuplicates?: boolean;
	includesIceCream?: boolean;
	availableItemCategory: ProductCategory; // Normalmente 'galletas'
}

export interface Product {
	id: string;
	name: string;
	productType: ProductType; // 'single' para normales, 'custom_box' para armar cajas
	category: ProductCategory;
	categoryLabel: string;
	price: number;
	priceFormatted: string;
	shortDescription: string;
	fullDescription: string;
	ingredients?: string[];
	allergens?: string[];
	imageSrc: string;
	imageHoverSrc?: string;
	badge?: string;
	badgeColor?: string;
	rating?: number;
	available: boolean;
	accentColor?: string;
	variant?: 'standard' | 'premium';
	boxConfig?: BoxConfiguration;
	extraPrice?: number;
	extraPriceFormatted?: string;
}


export interface SelectedBoxItem {
	productId: string;
	name: string;
	imageSrc: string;
	quantity: number;
}

export interface CartItem {
	productId: string;
	name: string;
	categoryLabel: string;
	price: number;
	priceFormatted: string;
	imageSrc: string;
	quantity: number;
	shortDescription?: string;
	selectedItems?: string[];
	boxContents?: SelectedBoxItem[];
}