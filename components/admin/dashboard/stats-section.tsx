"use client";

import { Card } from "@/components/ui/card";
import {
  ShoppingCart,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type IconName = "shopping-cart" | "users" | "credit-card" | "dollar-sign";

interface StatProps {
  title: string;
  value: string | number;
  iconName: IconName;
  trend: "up" | "down";
  trendValue: string;
}

const IconMap = {
  "shopping-cart": ShoppingCart,
  "users": Users,
  "credit-card": CreditCard,
  "dollar-sign": DollarSign,
};

function StatCard({ 
  title, 
  value, 
  iconName, 
  trend, 
  trendValue 
}: StatProps) {
  const Icon = IconMap[iconName];

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          {trend === "up" ? (
            <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
          )}
          {trendValue}
        </div>
      </div>
    </Card>
  );
}

interface StatsSectionProps {
  stats: Array<StatProps>;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          iconName={stat.iconName}
          trend={stat.trend}
          trendValue={stat.trendValue}
        />
      ))}
    </div>
  );
}
