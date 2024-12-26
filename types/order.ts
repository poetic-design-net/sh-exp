export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

// Base Order interface with optional fields for creation
export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  status: 'completed' | 'processing' | 'on-hold' | 'pending' | 'cancelled' | 'refunded' | 'failed';
  isArchived?: boolean;
  total: number;
  items: OrderItem[];
  customerEmail: string;
  customerName: string;
  createdAt: number;
  updatedAt: number;
  // Optional fields
  currency?: string;
  dateCreated?: number;
  datePaid?: number;
  paymentMethod?: string;
  paymentMethodTitle?: string;
  customerId?: string;
  // WooCommerce references
  wooOrderId?: string;
  wooSubscriptionId?: string;
  // Stripe references
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  sessionId?: string;
  // Optional shipping
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Type for admin pages where all fields are required
export type RequiredOrder = Required<
  Omit<Order, 
    'datePaid' | 
    'wooOrderId' | 
    'wooSubscriptionId' | 
    'stripePaymentIntentId' | 
    'stripeSubscriptionId' | 
    'stripeCustomerId' | 
    'sessionId' | 
    'shippingAddress'
  >
>;

// Type for creating a new order
export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

export interface OrdersResponse {
  orders: Order[];
  total: number;
  totalPages: number;
}

export interface CreateSubscriptionInput {
  userId: string;
  membershipId: string;
  startDate: number;
  autoRenew: boolean;
  paymentGateway: string;
  paymentStatus: string;
  price: number;
  currency: string;
  lastPaymentDate: number;
  stripeSubscriptionId?: string;
}
