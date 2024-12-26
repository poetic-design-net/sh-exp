export interface Membership {
  id: string;
  name: string;
  description: string;
  duration: number; // Duration in days
  features: string[];
  isActive: boolean;
  maxMembers?: number;
  // Link to associated products
  productIds: string[]; // Products that grant this membership
  createdAt: number;
  updatedAt: number;
}

// When a user buys a product that grants membership
export interface Subscription {
  id: string;
  userId: string;
  membershipId: string;
  productId?: string;
  orderId?: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: number;
  endDate: number;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: number;
  nextPaymentDate?: number;
  // Payment information
  price?: number;
  currency?: string;
  paymentGateway?: string;
  paymentStatus?: 'paid' | 'pending' | 'failed';
  // WooCommerce specific fields
  wooCommerceMemberId?: string;
  wooCommercePlanId?: string;
  wooCommerceOrderId?: string;
  wooCommerceProductId?: string;
  wooCommerceSubscriptionId?: string;
  // Additional fields for display
  name?: string;
  description?: string;
  features?: string[];
  // Product subscription details
  subscriptionPeriod?: 'day' | 'week' | 'month' | 'year';
  subscriptionLength?: number;
  subscriptionPrice?: number;
  trialLength?: number;
  productType?: string;
  createdAt: number;
  updatedAt: number;
}

export type CreateMembershipInput = Omit<Membership, "id" | "createdAt" | "updatedAt">;
export type UpdateMembershipInput = Partial<CreateMembershipInput>;

export type CreateSubscriptionInput = Omit<Subscription, "id" | "createdAt" | "updatedAt" | "status" | "endDate">;
export type UpdateSubscriptionInput = Partial<Omit<Subscription, "id" | "createdAt" | "updatedAt">>;
