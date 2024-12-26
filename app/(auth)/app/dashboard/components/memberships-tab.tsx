import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MembershipDetails } from "@/components/memberships/membership-details";
import { getStatusBadge, formatPeriod, formatPricePerPeriod } from "../utils";
import { getProductDetails } from "@/app/actions/products";
import type { DashboardSubscription } from "../types";

interface MembershipsTabProps {
  subscriptions: DashboardSubscription[];
}

export function MembershipsTab({ subscriptions }: MembershipsTabProps) {
  const router = useRouter();
  const [selectedSubscription, setSelectedSubscription] = useState<DashboardSubscription | null>(null);
  const [productDetails, setProductDetails] = useState<{[key: string]: any}>({});

  // Fetch product details for each subscription
  useEffect(() => {
    const fetchProductDetails = async () => {
      const details: {[key: string]: any} = {};
      
      for (const subscription of subscriptions) {
        if (subscription.productId) {
          try {
            const productData = await getProductDetails(subscription.productId);
            if (productData) {
              details[subscription.productId] = productData;
            }
          } catch (error) {
            console.error("Error fetching product details:", error);
          }
        }
      }
      
      setProductDetails(details);
    };

    fetchProductDetails();
  }, [subscriptions]);

  // Berechne die verbleibenden Tage für die aktuelle Periode
  const getRemainingDays = (subscription: DashboardSubscription): number => {
    // Wenn die Subscription aktiv ist, zeigen wir immer 30 Tage an
    if (subscription.status === 'active') {
      return 30; // Standard-Monatslänge
    }
    return 0;
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Meine Mitgliedschaften</h2>
        {subscriptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitgliedschaft</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Verbleibende Zeit</TableHead>
                <TableHead>Auto-Verlängerung</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => {
                const product = productDetails[subscription.productId || ''];
                const remainingDays = getRemainingDays(subscription);
                
                // Get period information from the product if it's a subscription product
                const periodText = product?.isSubscription 
                  ? formatPeriod(product.subscription?.length || 1, product.subscription?.period || 'month')
                  : 'Keine Periode';
                
                const priceText = product?.isSubscription && product.subscription?.price
                  ? formatPricePerPeriod(product.subscription.price, product.subscription.period)
                  : subscription.price 
                    ? `${subscription.price} €`
                    : '';

                return (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {subscription.name}
                      {subscription.description && (
                        <p className="text-sm text-gray-500">{subscription.description}</p>
                      )}
                      {priceText && (
                        <p className="text-sm text-gray-500">{priceText}</p>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{periodText}</span>
                      {product?.subscription?.trialLength > 0 && (
                        <p className="text-xs text-gray-500">
                          {formatPeriod(product.subscription.trialLength, product.subscription.period)} Testphase
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{remainingDays} Tage</p>
                        <p className="text-xs text-gray-500">
                          bis zur nächsten Abrechnung
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.autoRenew ? (
                        <Badge className="bg-blue-100 text-blue-800">Aktiv</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inaktiv</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedSubscription(subscription)}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Keine aktiven Mitgliedschaften</p>
            <Button onClick={() => router.push('/products')}>
              Mitgliedschaft entdecken
            </Button>
          </div>
        )}
      </div>

      {/* Membership Details Dialog */}
      {selectedSubscription && (
        <MembershipDetails
          subscription={selectedSubscription}
          productDetails={productDetails[selectedSubscription.productId || '']}
          open={!!selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}
    </Card>
  );
}
