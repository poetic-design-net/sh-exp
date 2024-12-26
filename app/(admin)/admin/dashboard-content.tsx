'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsSection } from "@/components/admin/dashboard/stats-section";
import { ChartsSection } from "@/components/admin/dashboard/charts-section";
import type { Order, OrderItem } from "@/types/order";

interface Product {
  id: string;
  name: string;
  isActive: boolean;
}

interface User {
  id: string;
  isActive: boolean;
}

interface Membership {
  id: string;
  isActive: boolean;
}

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Loading placeholder
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-[100px] mt-4" />
            <Skeleton className="h-8 w-[120px] mt-2" />
            <Skeleton className="h-4 w-[100px] mt-2" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <Skeleton className="h-[300px]" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-[300px]" />
        </Card>
      </div>
    </div>
  );
}

interface DashboardContentProps {
  products: Product[];
  users: User[];
  memberships: Membership[];
  orders: Order[];
}

export function DashboardContent({ products, users, memberships, orders }: DashboardContentProps) {
  // Calculate stats and trends
  const activeProducts = products.filter(p => p.isActive).length;
  const activeUsers = users.filter(u => u.isActive).length;
  const activeMemberships = memberships.filter(m => m.isActive).length;
  
  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Prepare revenue data (last 7 days)
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    
    const dayOrders = orders.filter(order => 
      order.createdAt >= startOfDay && order.createdAt <= endOfDay
    );
    
    return {
      date: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
    };
  }).reverse();

  // Prepare popular products data
  const popularProducts = products
    .map(product => ({
      name: product.name,
      sales: orders.filter(order => 
        order.items.some((item: OrderItem) => item.productId === product.id)
      ).length,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const stats = [
    {
      title: "Aktive Produkte",
      value: activeProducts,
      iconName: "shopping-cart" as const,
      trend: "up" as const,
      trendValue: `${((activeProducts / products.length) * 100).toFixed(1)}% von Gesamt`,
    },
    {
      title: "Aktive Benutzer",
      value: activeUsers,
      iconName: "users" as const,
      trend: "up" as const,
      trendValue: `${((activeUsers / users.length) * 100).toFixed(1)}% von Gesamt`,
    },
    {
      title: "Aktive Mitgliedschaften",
      value: activeMemberships,
      iconName: "credit-card" as const,
      trend: "up" as const,
      trendValue: `${((activeMemberships / memberships.length) * 100).toFixed(1)}% von Gesamt`,
    },
    {
      title: "Gesamtumsatz",
      value: formatCurrency(totalRevenue),
      iconName: "dollar-sign" as const,
      trend: "up" as const,
      trendValue: "Basierend auf allen Bestellungen",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Schnellzugriff</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a 
            href="/admin/products/add" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Produkt hinzufügen
          </a>
          <a 
            href="/admin/users" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Benutzer verwalten
          </a>
          <a 
            href="/admin/orders" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Bestellungen ansehen
          </a>
          <a 
            href="/admin/memberships" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Mitgliedschaften verwalten
          </a>
        </div>
      </Card>
      <StatsSection stats={stats} />
      <ChartsSection 
        revenueData={revenueData}
        popularProducts={popularProducts}
      />
    </div>
  );
}
