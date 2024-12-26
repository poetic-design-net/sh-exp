import { Suspense } from "react";
import { PageHeader } from "@/components/admin/shared/page-header";
import { getProducts } from "@/services/products-server";
import { getUsers } from "@/services/users-server";
import { getMemberships } from "@/services/memberships-client";
import { getOrders } from "@/services/orders";
import { DashboardContent, DashboardSkeleton } from "./dashboard-content";

async function getData() {
  const [products, users, memberships, orders] = await Promise.all([
    getProducts(1, 1000), // Get up to 1000 products
    getUsers(),
    getMemberships(1, 1000), // Get up to 1000 memberships
    getOrders(),
  ]);

  return {
    products: products.products, // Extract products array from paginated response
    users,
    memberships: memberships.memberships, // Extract memberships array from paginated response
    orders
  };
}

export default async function AdminDashboard() {
  const data = await getData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Übersicht über Ihre Website-Statistiken"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent 
          products={data.products}
          users={data.users}
          memberships={data.memberships}
          orders={data.orders}
        />
      </Suspense>
    </div>
  );
}
