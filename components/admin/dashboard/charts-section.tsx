"use client";

import dynamic from "next/dynamic";

const RevenueChart = dynamic(
  () => import("@/components/admin/dashboard/revenue-chart"),
  { ssr: false }
);

const PopularProductsChart = dynamic(
  () => import("@/components/admin/dashboard/popular-products-chart"),
  { ssr: false }
);

interface ChartsProps {
  revenueData: Array<{
    date: string;
    revenue: number;
  }>;
  popularProducts: Array<{
    name: string;
    sales: number;
  }>;
}

export function ChartsSection({ revenueData, popularProducts }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="min-h-[400px]">
        <RevenueChart data={revenueData} />
      </div>
      <div className="min-h-[400px]">
        <PopularProductsChart data={popularProducts} />
      </div>
    </div>
  );
}
