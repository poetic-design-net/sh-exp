import { Category } from "@/types/category";

export interface ProductSubscription {
  length: number;
  period: string;
  price: number;
  trialLength: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  onSale?: boolean;
  
  // Categories
  categoryIds?: string[];
  categories?: Category[];
  
  // Stock
  stock: number;
  stockStatus?: string;
  stockQuantity?: number;
  
  // Images and Downloads
  images: string[];
  avifImages?: string[];  // AVIF-optimierte Bildversionen
  downloadable?: boolean;
  downloadLimit?: number;
  downloadExpiry?: number;
  downloads?: any[];
  virtual?: boolean;
  
  // Status and Visibility
  isActive: boolean;
  featured?: boolean;
  status?: string;
  catalogVisibility?: string;
  
  // Subscription
  isSubscription?: boolean;
  subscription?: ProductSubscription;
  membershipPlanIds?: string[];
  
  // WooCommerce
  wooCommerceId?: string;
  sku?: string;
  type?: string;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  dateCreated?: number;
  dateModified?: number;
}

export type CreateProductInput = Omit<Product, "id" | "createdAt" | "updatedAt" | "categories">;
export type UpdateProductInput = Partial<CreateProductInput>;
