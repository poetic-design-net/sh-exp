'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order } from "@/types/order";
import { updateOrderStatus, toggleOrderArchive, deleteOrder, refundOrder } from "@/app/actions/orders";
import { useToast } from "@/components/ui/use-toast";

interface OrderDetailsProps {
  order: Order;
  open: boolean;
  onClose: () => void;
}

export function OrderDetails({ order, open, onClose }: OrderDetailsProps) {
  const { toast } = useToast();

  function formatDate(timestamp: number | undefined) {
    if (!timestamp) return '-';
    
    try {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  }

  function getOrderDate(order: Order) {
    // For WooCommerce orders, use dateCreated
    if (order.wooOrderId && order.dateCreated) {
      return formatDate(order.dateCreated);
    }
    // For new orders, use createdAt
    return formatDate(order.createdAt);
  }

  function formatPrice(price: number, currency?: string) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(price);
  }

  function getStatusLabel(status: Order['status']) {
    const statusMap: Record<string, string> = {
      'completed': 'Abgeschlossen',
      'processing': 'In Bearbeitung',
      'on-hold': 'Wartend',
      'pending': 'Ausstehend',
      'cancelled': 'Storniert',
      'refunded': 'Erstattet',
      'failed': 'Fehlgeschlagen'
    };
    return statusMap[status] || status;
  }

  function getPaymentMethodLabel(method?: string, title?: string) {
    if (title) return title;
    if (!method) return '-';
    
    const methodMap: Record<string, string> = {
      'stripe': 'Kreditkarte',
      'paypal': 'PayPal',
      'monero': 'Monero (XMR)'
    };
    return methodMap[method] || method;
  }

  function getPaymentStatus() {
    if (order.status === 'completed' || order.datePaid) {
      return `Bezahlt${order.datePaid ? ' am ' + formatDate(order.datePaid) : ''}`;
    }
    if (order.status === 'pending') {
      return 'Zahlung ausstehend';
    }
    if (order.status === 'failed') {
      return 'Zahlung fehlgeschlagen';
    }
    return 'Nicht bezahlt';
  }

  async function handleStatusUpdate(newStatus: Order['status']) {
    try {
      await updateOrderStatus(order.id, newStatus);
      toast({
        title: "Status aktualisiert",
        description: "Der Bestellstatus wurde erfolgreich aktualisiert."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  }

  async function handleRefund() {
    if (!confirm('Möchten Sie diese Bestellung wirklich zurückerstatten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      await refundOrder(order.id);
      toast({
        title: "Bestellung erstattet",
        description: "Die Bestellung wurde erfolgreich erstattet."
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Die Bestellung konnte nicht erstattet werden.",
        variant: "destructive"
      });
    }
  }

  async function handleArchiveToggle() {
    try {
      await toggleOrderArchive(order.id);
      toast({
        title: order.isArchived ? "Aus Archiv entfernt" : "Archiviert",
        description: order.isArchived 
          ? "Die Bestellung wurde aus dem Archiv entfernt." 
          : "Die Bestellung wurde archiviert."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Bestellung konnte nicht archiviert/entarchiviert werden.",
        variant: "destructive"
      });
    }
  }

  async function handleDelete() {
    if (!order.isArchived) {
      toast({
        title: "Fehler",
        description: "Nur archivierte Bestellungen können gelöscht werden.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Möchten Sie diese Bestellung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      await deleteOrder(order.id);
      toast({
        title: "Bestellung gelöscht",
        description: "Die Bestellung wurde erfolgreich gelöscht."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Bestellung konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Bestellung #{order.orderNumber || order.wooOrderId}
              {order.isArchived && (
                <Badge variant="secondary" className="ml-2">
                  Archiviert
                </Badge>
              )}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bestellstatus und Datum */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Bestelldatum</p>
              <p className="font-medium">{getOrderDate(order)}</p>
            </div>
            <Badge 
              className={
                order.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'pending'
                  ? 'bg-orange-100 text-orange-800'
                  : order.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : order.status === 'refunded'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          {/* Kundeninformationen */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Kundeninformationen</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p>{order.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500">E-Mail</p>
                <p>{order.customerEmail}</p>
              </div>
            </div>
          </Card>

          {/* Bestellpositionen */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Bestellpositionen</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead className="text-right">Menge</TableHead>
                  <TableHead className="text-right">Gesamt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.total, order.currency)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="text-right font-medium">Gesamtbetrag</TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(order.total, order.currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          {/* Zahlungsinformationen */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Zahlungsinformationen</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Zahlungsmethode</p>
                <p>{getPaymentMethodLabel(order.paymentMethod, order.paymentMethodTitle)}</p>
              </div>
              <div>
                <p className="text-gray-500">Zahlungsstatus</p>
                <p>{getPaymentStatus()}</p>
              </div>
              {order.stripeSubscriptionId && (
                <div>
                  <p className="text-gray-500">Abonnement</p>
                  <p>Aktiv (Stripe: {order.stripeSubscriptionId})</p>
                </div>
              )}
              {order.wooSubscriptionId && (
                <div>
                  <p className="text-gray-500">WooCommerce Abonnement</p>
                  <p>#{order.wooSubscriptionId}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Stripe Informationen */}
          {(order.stripePaymentIntentId || order.stripeSubscriptionId || order.stripeCustomerId) && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Stripe Informationen</h3>
              <div className="space-y-2 text-sm">
                {order.stripePaymentIntentId && (
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-gray-500">Payment Intent</p>
                    <p>{order.stripePaymentIntentId}</p>
                  </div>
                )}
                {order.stripeSubscriptionId && (
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-gray-500">Subscription</p>
                    <p>{order.stripeSubscriptionId}</p>
                  </div>
                )}
                {order.stripeCustomerId && (
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-gray-500">Customer</p>
                    <p>{order.stripeCustomerId}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Status Actions */}
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              {order.status !== 'completed' && (
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusUpdate('completed')}
                >
                  Als abgeschlossen markieren
                </Button>
              )}
              {order.status === 'pending' && (
                <Button 
                  variant="outline"
                  onClick={() => handleStatusUpdate('processing')}
                >
                  Als in Bearbeitung markieren
                </Button>
              )}
              {(order.status === 'completed' || order.status === 'processing') && (
                <Button
                  variant="outline"
                  onClick={handleRefund}
                >
                  Rückerstattung
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleArchiveToggle}
              >
                {order.isArchived ? 'Aus Archiv entfernen' : 'Archivieren'}
              </Button>
              {order.isArchived && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Löschen
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
