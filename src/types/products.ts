export type ProductCategory = 'galletas' | 'cuchareables' | 'brownies' | 'tortas' | 'otros';

export interface CategoryInfo {
	id: ProductCategory;
	label: string;
	description: string;
}

export interface Product {
	id: string;
	name: string;
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
}


export interface CartItem {
	productId: string;
	name: string;
	categoryLabel: string;
	price: number;
	priceFormatted: string;
	imageSrc: string;
	quantity: number;
}
