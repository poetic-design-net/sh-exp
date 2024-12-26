import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface StatisticsCardsProps {
  user: {
    displayName: string | null;
    email: string | null;
  };
  stats: {
    activeMemberships: number;
    totalMemberships: number;
    autoRenewingMemberships: number;
    completedOrders: number;
    totalOrdersAmount: number;
  };
}

export function StatisticsCards({ user, stats }: StatisticsCardsProps) {
  const router = useRouter();

  return (
    <div className="grid gap-6 md:grid-cols-4 mb-8">
      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Aktive Mitgliedschaften</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{stats.activeMemberships}</p>
          <p className="ml-2 text-sm text-gray-500">von {stats.totalMemberships}</p>
        </div>
        <Progress 
          value={(stats.activeMemberships / Math.max(stats.totalMemberships, 1)) * 100} 
          className="mt-3" 
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Bestellungen</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{stats.completedOrders}</p>
          <p className="ml-2 text-sm text-gray-500">abgeschlossen</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">{formatPrice(stats.totalOrdersAmount)}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Auto-Verlängerung</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{stats.autoRenewingMemberships}</p>
          <p className="ml-2 text-sm text-gray-500">aktiv</p>
        </div>
        <Progress 
          value={(stats.autoRenewingMemberships / Math.max(stats.activeMemberships, 1)) * 100} 
          className="mt-3" 
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Profil</h3>
        <div className="mt-2">
          <p className="font-medium">{user?.displayName || 'Benutzer'}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <Button 
          variant="outline" 
          className="mt-3 w-full" 
          onClick={() => router.push('/profile')}
        >
          Profil bearbeiten
        </Button>
      </Card>
    </div>
  );
}
