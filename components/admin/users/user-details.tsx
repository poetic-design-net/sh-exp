'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserDetailsProps {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
}

export function UserDetails({ user, open, onClose }: UserDetailsProps) {
  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getRoleBadgeClass(role: string) {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function formatPrice(price?: number, currency: string = 'EUR') {
    if (typeof price === 'undefined') return 'N/A';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  function getDaysRemaining(endDate: number) {
    return Math.floor((endDate - Date.now()) / (1000 * 60 * 60 * 24));
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] h-[800px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Benutzerdetails</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-6 pb-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Grundinformationen</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p>{user.displayName || 'Nicht angegeben'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-Mail</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rolle</p>
                  <Badge className={getRoleBadgeClass(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {user.isActive ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Kontaktinformationen</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vorname</p>
                  <p>{user.firstName || 'Nicht angegeben'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nachname</p>
                  <p>{user.lastName || 'Nicht angegeben'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p>{user.phoneNumber || 'Nicht angegeben'}</p>
                </div>
              </div>
            </Card>

            {/* Active Subscriptions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Aktive Abonnements</h3>
              {user.activeSubscriptions && user.activeSubscriptions.length > 0 ? (
                <div className="space-y-6">
                  {user.activeSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{subscription.name || subscription.membershipId}</h4>
                          {subscription.description && (
                            <p className="text-sm text-gray-500">{subscription.description}</p>
                          )}
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

                      {/* Preis- und Zahlungsinformationen */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium mb-3">Zahlungsinformationen</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Preis</p>
                            <p className="font-medium">{formatPrice(subscription.price, subscription.currency)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Zahlungsmethode</p>
                            <p className="font-medium">{subscription.paymentMethod || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Letzte Zahlung</p>
                            <p className="font-medium">
                              {subscription.lastPaymentDate 
                                ? formatDate(subscription.lastPaymentDate)
                                : 'N/A'}
                            </p>
                          </div>
                          {subscription.paymentStatus && (
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
                          )}
                        </div>
                      </div>

                      {/* Zeitliche Informationen */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Startdatum</p>
                          <p className="font-medium">{formatDate(subscription.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Enddatum</p>
                          <p className="font-medium">{formatDate(subscription.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Verbleibende Tage</p>
                          <p className="font-medium">{getDaysRemaining(subscription.endDate)} Tage</p>
                        </div>
                      </div>

                      {/* Features */}
                      {subscription.features && subscription.features.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Features</h5>
                          <ul className="space-y-1">
                            {subscription.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <span className="mr-2">✓</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* WooCommerce IDs */}
                      {(subscription.wooCommerceMemberId || subscription.wooCommerceSubscriptionId) && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium mb-2">WooCommerce Details</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {subscription.wooCommerceMemberId && (
                              <div>
                                <p className="text-gray-500">Member ID</p>
                                <p>{subscription.wooCommerceMemberId}</p>
                              </div>
                            )}
                            {subscription.wooCommerceSubscriptionId && (
                              <div>
                                <p className="text-gray-500">Subscription ID</p>
                                <p>{subscription.wooCommerceSubscriptionId}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Keine aktiven Abonnements</p>
              )}
            </Card>

            {/* System Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Systeminformationen</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Erstellt am</p>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zuletzt aktualisiert</p>
                  <p>{formatDate(user.updatedAt)}</p>
                </div>
                {user.lastLoginAt && (
                  <div>
                    <p className="text-sm text-gray-500">Letzter Login</p>
                    <p>{formatDate(user.lastLoginAt)}</p>
                  </div>
                )}
                {user.wooCommerceUserId && (
                  <div>
                    <p className="text-sm text-gray-500">WooCommerce ID</p>
                    <p>{user.wooCommerceUserId}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Actions - Fixed at bottom */}
        <div className="border-t p-4 bg-white">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
