"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatisticsCards } from "./dashboard/components/statistics-cards";
import { MembershipsTab } from "./dashboard/components/memberships-tab";
import { OrdersTab } from "./dashboard/components/orders-tab";
import { ActivityTab } from "./dashboard/components/activity-tab";
import { BenefitsTab } from "./dashboard/components/benefits-tab";
import { calculateDashboardStats } from "./dashboard/utils";
import type { DashboardContentProps } from "./dashboard/types";

export function DashboardContent({ user, subscriptions, orders }: DashboardContentProps) {
  const router = useRouter();
  const stats = calculateDashboardStats(subscriptions, orders);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mein Dashboard</h1>
        <Button onClick={() => router.push('/products')} className="bg-primary text-white">
          Shop
        </Button>
      </div>

      <StatisticsCards user={user} stats={stats} />

      <Tabs defaultValue="memberships" className="space-y-6">
        <TabsList>
          <TabsTrigger value="memberships">Mitgliedschaften</TabsTrigger>
          <TabsTrigger value="orders">Bestellungen</TabsTrigger>
          <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
          <TabsTrigger value="benefits">Vorteile</TabsTrigger>
        </TabsList>

        <TabsContent value="memberships">
          <MembershipsTab subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab orders={orders} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab orders={orders} subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="benefits">
          <BenefitsTab subscriptions={subscriptions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
