import type { Subscription } from "@/types/membership";
import type { Order } from "@/types/order";

// Extend the base Subscription type with additional fields
export interface DashboardSubscription extends Subscription {
  length: number;
  period: 'day' | 'week' | 'month' | 'year';
  price: number;
  trialLength: number;
}

export interface DashboardContentProps {
  user: {
    displayName: string | null;
    email: string | null;
  };
  subscriptions: DashboardSubscription[];
  orders: Order[];
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'subscription';
  title: string;
  description: string;
  date: number;
  status: string;
}
