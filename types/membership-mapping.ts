// Basis-Typen für das Mapping
export type ProductType = 'subscription' | 'one-time' | 'course' | 'retreat' | 'book' | 'donation';
export type ProductCategory = 'entbildung' | 'kryptogold' | 'audioquickies' | 'retreat' | 'book' | 'other';
export type ProductStatus = 'active' | 'inactive' | 'draft';
export type SubscriptionPeriod = 'day' | 'month' | 'year';
export type AccessLevel = 'basic' | 'plus' | 'premium' | 'special';

// WooCommerce Produkt Struktur
export interface WooCommerceProduct {
  id: string;
  name: string;
  type: string;
  status: string;
  price: string;
  meta_data: Array<{
    key: string;
    value: string;
  }>;
}

// Firebase Produkt Struktur
export interface FirebaseProduct {
  id: string;
  wooCommerceId: string;
  name: string;
  type: ProductType;
  category: ProductCategory;
  status: ProductStatus;
  price: string;
  subscriptionPeriod?: SubscriptionPeriod;
  features: string[];
  accessLevel: AccessLevel;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: number;
  updatedAt: number;
}

// Mapping zwischen WooCommerce und Firebase
export interface ProductMapping {
  wooCommerce: WooCommerceProduct;
  firebase: FirebaseProduct;
}

// Helper Funktionen für die Konvertierung
export function normalizeSubscriptionPeriod(period?: string): SubscriptionPeriod | undefined {
  if (!period) return undefined;
  
  switch (period.toLowerCase()) {
    case 'day':
    case 'days':
      return 'day';
    case 'month':
    case 'months':
      return 'month';
    case 'year':
    case 'years':
      return 'year';
    default:
      return undefined;
  }
}

export function normalizeProductType(wooType: string): ProductType {
  switch (wooType) {
    case 'subscription':
      return 'subscription';
    case 'simple':
      return 'one-time';
    default:
      return 'one-time';
  }
}

export function determineCategory(product: WooCommerceProduct): ProductCategory {
  const name = product.name.toLowerCase();
  
  if (name.includes('entbildung')) return 'entbildung';
  if (name.includes('krypto')) return 'kryptogold';
  if (name.includes('audioquick')) return 'audioquickies';
  if (name.includes('retreat')) return 'retreat';
  if (name.includes('buch')) return 'book';
  
  return 'other';
}

export function determineAccessLevel(product: WooCommerceProduct): AccessLevel {
  const name = product.name.toLowerCase();
  
  if (name.includes('premium')) return 'premium';
  if (name.includes('plus')) return 'plus';
  if (name.includes('basic')) return 'basic';
  
  return 'special';
}

// Diese Interfaces und Funktionen können wir dann in einem Script verwenden,
// das die WooCommerce Produkte automatisch mapped
