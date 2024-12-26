'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrders, getOrderStats, clearOrdersCache } from "app/actions/orders";
import type { Order } from "types/order";
import { useToast } from "@/components/ui/use-toast";
import { OrderDetails } from "@/components/admin/orders/order-details";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArchiveOrdersButton } from "@/components/admin/orders/archive-orders-button";
import { OrderSearch } from "@/components/admin/orders/order-search";

type SortField = 'createdAt' | 'customerName' | 'total' | 'status';
type SortOrder = 'asc' | 'desc';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  type StatusFilterType = Order['status'] | 'all';
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset to page 1 when switching between active/archived
  useEffect(() => {
    setCurrentPage(1);
  }, [showArchived]);
  const [stats, setStats] = useState<{
    total: number;
    last30Days: number;
    byStatus: {
      completed: number;
      processing: number;
      pending: number;
    };
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [currentPage, sortField, sortOrder, statusFilter, startDate, endDate, showArchived, searchTerm]);

  async function loadOrders() {
    try {
      setIsLoading(true);
      setError(null);
      const filters = {
        ...(statusFilter !== 'all' && { status: statusFilter as Order['status'] }),
        ...(startDate && { startDate: new Date(startDate).getTime() }),
        ...(endDate && { endDate: new Date(endDate).getTime() + 86400000 }), // Add one day to include the end date
        ...(searchTerm && { searchTerm }),
        archived: showArchived
      };
      
      console.log('Loading orders with filters:', filters);
      const result = await getOrders(currentPage, 20, sortField, sortOrder, filters);
      console.log(`Loaded ${result.orders.length} orders`);
      
      setOrders(result.orders);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setError(errorMessage);
      toast({
        title: "Fehler",
        description: "Die Bestellungen konnten nicht geladen werden: " + errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStats() {
    try {
      const orderStats = await getOrderStats();
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  }

  function getStatusBadge(status: Order['status']) {
    const statusMap: Record<string, { label: string; className: string }> = {
      'completed': { label: 'Abgeschlossen', className: 'bg-green-100 text-green-800' },
      'processing': { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-800' },
      'on-hold': { label: 'Wartend', className: 'bg-yellow-100 text-yellow-800' },
      'pending': { label: 'Ausstehend', className: 'bg-orange-100 text-orange-800' },
      'cancelled': { label: 'Storniert', className: 'bg-red-100 text-red-800' },
      'refunded': { label: 'Erstattet', className: 'bg-purple-100 text-purple-800' },
      'failed': { label: 'Fehlgeschlagen', className: 'bg-red-100 text-red-800' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  }

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
    // For WooCommerce migrated orders, use dateCreated
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

  function formatOrderNumber(order: Order) {
    // Keep existing order numbers as they are
    if (order.id.startsWith('cp') || order.id.includes('Udzi') || /^\d{5}$/.test(order.id)) {
      return `#${order.id}`;
    }
    // For new orders with sequential numbers
    if (order.orderNumber) {
      return `#${order.orderNumber.toString().padStart(6, '0')}`;
    }
    return `#${order.id}`;
  }

  function formatPaymentMethod(method?: string, title?: string) {
    if (title) return title;
    if (!method) return '-';
    
    const methodMap: Record<string, string> = {
      'stripe': 'Kreditkarte',
      'paypal': 'PayPal',
      'monero': 'Monero (XMR)'
    };
    return methodMap[method] || method;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Fehler beim Laden der Bestellungen</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => loadOrders()}
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Bestellungen</h2>
          <div className="flex gap-2">
            <Button 
              variant={!showArchived ? "default" : "outline"}
              onClick={async () => {
                await clearOrdersCache(); // Clear cache first
                setShowArchived(false);
                await loadOrders(); // Reload orders after clearing cache
              }}
            >
              Aktiv
            </Button>
            <Button 
              variant={showArchived ? "default" : "outline"}
              onClick={async () => {
                await clearOrdersCache(); // Clear cache first
                setShowArchived(true);
                await loadOrders(); // Reload orders after clearing cache
              }}
            >
              Archiv
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <ArchiveOrdersButton />
          <Button onClick={() => loadOrders()}>Aktualisieren</Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Gesamt Bestellungen</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Letzte 30 Tage</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.last30Days}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Abgeschlossen</span>
                <span className="font-medium">{stats.byStatus.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">In Bearbeitung</span>
                <span className="font-medium">{stats.byStatus.processing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ausstehend</span>
                <span className="font-medium">{stats.byStatus.pending}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Sorting */}
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          <OrderSearch 
            onSearch={(term) => {
              // Only update if term is empty or has 2+ characters
              if (term.length === 0 || term.length >= 2) {
                setSearchTerm(term);
                setCurrentPage(1);
              }
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sortieren nach</Label>
              <Select defaultValue={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sortieren nach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Datum</SelectItem>
                  <SelectItem value="customerName">Kundenname</SelectItem>
                  <SelectItem value="total">Betrag</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sortierreihenfolge</Label>
              <Select defaultValue={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sortierreihenfolge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Aufsteigend</SelectItem>
                  <SelectItem value="desc">Absteigend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status Filter</Label>
              {!showArchived && (
                <Select 
                  defaultValue={statusFilter} 
                  value={statusFilter}
                  onValueChange={(value: StatusFilterType) => setStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="processing">In Bearbeitung</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="on-hold">Wartend</SelectItem>
                    <SelectItem value="cancelled">Storniert</SelectItem>
                    <SelectItem value="refunded">Erstattet</SelectItem>
                    <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Datum</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Datum</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bestell-Nr.</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Zahlungsart</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {formatOrderNumber(order)}
                  </TableCell>
                  <TableCell>{getOrderDate(order)}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{formatPrice(order.total, order.currency)}</TableCell>
                  <TableCell>
                    <div>
                      <p>{formatPaymentMethod(order.paymentMethod, order.paymentMethodTitle)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.stripePaymentIntentId && (
                      <div className="space-y-1">
                        <p className="text-sm">PI: {order.stripePaymentIntentId.slice(-8)}</p>
                        {order.stripeSubscriptionId && (
                          <p className="text-sm">Sub: {order.stripeSubscriptionId.slice(-8)}</p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Seite {currentPage} von {totalPages}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Zurück
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
              >
                Weiter
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
