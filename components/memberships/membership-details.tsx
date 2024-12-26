'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import type { Subscription } from "@/types/membership";
import { updateSubscription } from "@/services/memberships-client";
import { toast } from "@/components/ui/use-toast";

interface MembershipDetailsProps {
  subscription: Subscription;
  productDetails?: {
    isSubscription?: boolean;
    subscription?: {
      period?: 'day' | 'week' | 'month' | 'year';
      length?: number;
      price?: number;
      trialLength?: number;
    };
  };
  open: boolean;
  onClose: () => void;
}

export function MembershipDetails({ subscription, productDetails, open, onClose }: MembershipDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Berechne das nächste Abrechnungsdatum (30 Tage vom aktuellen Datum)
  const getNextBillingDate = () => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 30);
    return nextDate;
  };

  const nextBillingDate = getNextBillingDate();

  // Formatiere WooCommerce IDs für die Anzeige
  const formatWooId = (id: string) => id.replace('wc_', '');

  // Formatiere Preis
  const formatPrice = (price?: number, currency: string = 'EUR') => {
    if (typeof price === 'undefined') return 'N/A';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // Formatiere Periode
  const formatPeriod = (length: number = 1, period?: string) => {
    if (!period) return 'N/A';
    const periods: { [key: string]: string } = {
      day: length === 1 ? 'Tag' : 'Tage',
      week: length === 1 ? 'Woche' : 'Wochen',
      month: length === 1 ? 'Monat' : 'Monate',
      year: length === 1 ? 'Jahr' : 'Jahre'
    };
    return `${length} ${periods[period] || period}`;
  };

  // Toggle Auto-Renewal
  const handleAutoRenewalToggle = async () => {
    try {
      setIsUpdating(true);
      await updateSubscription(subscription.id, {
        autoRenew: !subscription.autoRenew
      });
      toast({
        title: "Erfolg",
        description: subscription.autoRenew 
          ? "Automatische Verlängerung wurde deaktiviert" 
          : "Automatische Verlängerung wurde aktiviert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellung konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mitgliedschaftsdetails</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hauptinformationen */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{subscription.name}</h3>
                <p className="text-sm text-gray-500">{subscription.description}</p>
              </div>
              <Badge 
                className={
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {subscription.status === 'active' ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>

            {/* Subscription Details vom Produkt */}
            {productDetails?.isSubscription && productDetails?.subscription && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3">Abo-Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Abrechnungsperiode</p>
                    <p className="font-medium">
                      {formatPeriod(productDetails.subscription?.length, productDetails.subscription?.period)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Preis pro Periode</p>
                    <p className="font-medium">
                      {formatPrice(productDetails.subscription?.price)}
                    </p>
                  </div>
                  {productDetails.subscription?.trialLength && productDetails.subscription.trialLength > 0 && (
                    <div>
                      <p className="text-gray-500">Testphase</p>
                      <p className="font-medium">
                        {formatPeriod(productDetails.subscription?.trialLength, productDetails.subscription?.period)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preis- und Zahlungsinformationen */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Zahlungsinformationen</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Preis</p>
                  <p className="font-medium">{formatPrice(subscription.price, subscription.currency)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Zahlungsmethode</p>
                  <p className="font-medium">{subscription.paymentGateway || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Letzte Zahlung</p>
                  <p className="font-medium">
                    {subscription.lastPaymentDate 
                      ? new Date(subscription.lastPaymentDate).toLocaleDateString('de-DE')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Zahlungsstatus</p>
                  <Badge className={
                    subscription.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : subscription.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {subscription.paymentStatus === 'paid' ? 'Bezahlt' 
                      : subscription.paymentStatus === 'pending' ? 'Ausstehend' 
                      : 'Fehlgeschlagen'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Zeitliche Informationen */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Startdatum</p>
                <p className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString('de-DE')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verbleibende Zeit</p>
                <p className="font-medium">
                  {subscription.status === 'active' ? '30 Tage' : '0 Tage'}
                </p>
              </div>
            </div>

            {/* Automatische Verlängerung */}
            {subscription.status === 'active' && (
              <div className="flex items-center justify-between py-4 border-t">
                <div>
                  <p className="font-medium">Automatische Verlängerung</p>
                  <p className="text-sm text-gray-500">
                    Nächste Abrechnung: {nextBillingDate.toLocaleDateString('de-DE')}
                  </p>
                </div>
                <Switch
                  checked={subscription.autoRenew ?? true}
                  onCheckedChange={handleAutoRenewalToggle}
                  disabled={isUpdating}
                />
              </div>
            )}
          </Card>

          {/* Features */}
          {subscription.features && subscription.features.length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Enthaltene Features</h4>
              <ul className="space-y-2">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* WooCommerce Details */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Informationen</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {subscription.wooCommerceMemberId && (
                <div>
                  <p className="text-gray-500">Member ID</p>
                  <p>{formatWooId(subscription.wooCommerceMemberId)}</p>
                </div>
              )}
              {subscription.wooCommercePlanId && (
                <div>
                  <p className="text-gray-500">Plan ID</p>
                  <p>{formatWooId(subscription.wooCommercePlanId)}</p>
                </div>
              )}
              {subscription.wooCommerceOrderId && (
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p>{formatWooId(subscription.wooCommerceOrderId)}</p>
                </div>
              )}
              {subscription.wooCommerceProductId && (
                <div>
                  <p className="text-gray-500">Product ID</p>
                  <p>{formatWooId(subscription.wooCommerceProductId)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Aktionen */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Schließen
            </Button>
            {subscription.status === 'active' && (
              <Button variant="destructive">
                Mitgliedschaft kündigen
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
