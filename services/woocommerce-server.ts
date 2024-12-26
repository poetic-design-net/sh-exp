import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { User, CreateUserInput } from "@/types/user";
import { Subscription } from "@/types/membership";

// WooCommerce API Client
let api: WooCommerceRestApi;

export function initWooCommerceApi() {
  api = new WooCommerceRestApi({
    url: process.env.WOOCOMMERCE_URL!,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY!,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET!,
    version: "wc/v3"
  });
}

// Typen für WooCommerce Daten
interface WooCommerceUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface WooCommerceSubscription {
  id: number;
  status: string;
  billing_period: string;
  billing_interval: string;
  start_date: string;
  next_payment_date: string;
  product_id: number;
}

// Hole User von WooCommerce
export async function getWooCommerceUser(userId: number): Promise<WooCommerceUser> {
  if (!api) initWooCommerceApi();
  
  const response = await api.get(`customers/${userId}`);
  return response.data;
}

// Hole alle User von WooCommerce
export async function getAllWooCommerceUsers(): Promise<WooCommerceUser[]> {
  if (!api) initWooCommerceApi();
  
  const response = await api.get("customers", {
    per_page: 100 // Anpassen nach Bedarf
  });
  return response.data;
}

// Hole Mitgliedschaften eines Users
export async function getUserSubscriptions(userId: number): Promise<WooCommerceSubscription[]> {
  if (!api) initWooCommerceApi();
  
  const response = await api.get("subscriptions", {
    customer: userId,
    status: "active"
  });
  return response.data;
}

// Konvertiere WooCommerce User zu Firebase User Format
export function convertWooCommerceUser(wooUser: WooCommerceUser): CreateUserInput {
  return {
    email: wooUser.email,
    displayName: `${wooUser.first_name} ${wooUser.last_name}`.trim() || wooUser.username,
    firstName: wooUser.first_name,
    lastName: wooUser.last_name,
    password: generateTempPassword(), // Temporäres Passwort
    wooCommerceUserId: wooUser.id.toString()
  };
}

// Konvertiere WooCommerce Subscription zu Firebase Subscription Format
export function convertWooCommerceSubscription(
  wooSubscription: WooCommerceSubscription,
  userId: string,
  membershipId: string
): Omit<Subscription, "id" | "createdAt" | "updatedAt"> {
  return {
    userId,
    membershipId,
    productId: wooSubscription.product_id.toString(),
    orderId: wooSubscription.id.toString(),
    status: wooSubscription.status === "active" ? "active" : "cancelled",
    startDate: new Date(wooSubscription.start_date).getTime(),
    endDate: new Date(wooSubscription.next_payment_date).getTime(),
    autoRenew: true
  };
}

// Hilfsfunktion für temporäres Passwort
function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + "!";
}
