import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardSubscription } from "../types";
import { formatPeriod, formatPricePerPeriod } from "../utils";

interface BenefitsTabProps {
  subscriptions: DashboardSubscription[];
}

export function BenefitsTab({ subscriptions }: BenefitsTabProps) {
  const router = useRouter();
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Meine Vorteile</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {activeSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="p-4">
              <h3 className="font-medium mb-2">{subscription.name}</h3>
              {subscription.features && subscription.features.length > 0 ? (
                <ul className="space-y-2">
                  {subscription.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Keine Vorteile verfügbar</p>
              )}
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Vorteile einlösen
                </Button>
                {subscription.period && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {formatPeriod(subscription.length || 1, subscription.period)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {subscription.price > 0 
                        ? formatPricePerPeriod(subscription.price, subscription.period)
                        : 'Kostenlos'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {!activeSubscriptions.length && (
            <div className="md:col-span-2 text-center py-8">
              <p className="text-gray-600 mb-4">Keine aktiven Vorteile</p>
              <Button onClick={() => router.push('/products')}>
                Vorteile entdecken
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
