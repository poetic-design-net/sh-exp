import React from "react";
import { Card } from "@/components/ui/card";
import type { Order } from "@/types/order";
import type { DashboardSubscription } from "../types";
import { createActivityItems, getStatusBadge } from "../utils";

interface ActivityTabProps {
  orders: Order[];
  subscriptions: DashboardSubscription[];
}

export function ActivityTab({ orders, subscriptions }: ActivityTabProps) {
  const activityItems = createActivityItems(orders, subscriptions);

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Aktivitäten</h2>
        <div className="space-y-4">
          {activityItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 border-b pb-4 last:border-b-0">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.date).toLocaleDateString('de-DE')}
                </p>
              </div>
              {getStatusBadge(item.status)}
            </div>
          ))}
          {activityItems.length === 0 && (
            <p className="text-gray-600 text-center py-4">Keine Aktivitäten vorhanden</p>
          )}
        </div>
      </div>
    </Card>
  );
}
