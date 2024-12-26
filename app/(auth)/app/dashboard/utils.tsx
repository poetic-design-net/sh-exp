import React, { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/order";
import type { DashboardSubscription } from "./types";

type PeriodType = 'day' | 'week' | 'month' | 'year';

export const getStatusBadge = (status: string): ReactNode => {
  switch (status) {
    case 'active':
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Aktiv</Badge>;
    case 'cancelled':
      return <Badge className="bg-yellow-100 text-yellow-800">Gekündigt</Badge>;
    case 'expired':
    case 'failed':
      return <Badge className="bg-red-100 text-red-800">Abgelaufen</Badge>;
    case 'pending':
      return <Badge className="bg-blue-100 text-blue-800">Ausstehend</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
};

export const getDaysRemaining = (endDate: number): number => {
  return Math.floor((endDate - Date.now()) / (1000 * 60 * 60 * 24));
};

export const formatPeriod = (length: number, period: PeriodType): string => {
  const periodMap: Record<PeriodType, { singular: string; plural: string }> = {
    'day': { singular: 'Tag', plural: 'Tage' },
    'week': { singular: 'Woche', plural: 'Wochen' },
    'month': { singular: 'Monat', plural: 'Monate' },
    'year': { singular: 'Jahr', plural: 'Jahre' }
  };

  // If length is 0 or not provided, assume 1
  const actualLength = length || 1;
  
  const periodKey = period.toLowerCase() as PeriodType;
  const periodForms = periodMap[periodKey];
  
  if (!periodForms) return `${actualLength} ${period}`;
  
  return `${actualLength} ${actualLength === 1 ? periodForms.singular : periodForms.plural}`;
};

export const formatPricePerPeriod = (price: number, period: PeriodType): string => {
  const periodMap: Record<PeriodType, string> = {
    'day': '/Tag',
    'week': '/Woche',
    'month': '/Monat',
    'year': '/Jahr'
  };

  const periodSuffix = periodMap[period.toLowerCase() as PeriodType] || `/${period}`;
  return `${price.toFixed(2).replace('.', ',')} €${periodSuffix}`;
};

export const calculateDashboardStats = (subscriptions: DashboardSubscription[], orders: Order[]) => {
  const activeMemberships = subscriptions.filter(s => s.status === 'active').length;
  const totalMemberships = subscriptions.length;
  const autoRenewingMemberships = subscriptions.filter(s => s.autoRenew && s.status === 'active').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalOrdersAmount = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);

  return {
    activeMemberships,
    totalMemberships,
    autoRenewingMemberships,
    completedOrders,
    totalOrdersAmount
  };
};

export const createActivityItems = (orders: Order[], subscriptions: DashboardSubscription[]) => {
  return [...orders.map(order => ({
    id: order.id,
    type: 'order' as const,
    title: 'Neue Bestellung',
    description: order.items.map(i => i.productName).join(', '),
    date: order.createdAt,
    status: order.status
  })),
  ...subscriptions.map(sub => ({
    id: sub.id,
    type: 'subscription' as const,
    title: sub.name || 'Mitgliedschaft',
    description: `Aktiviert am: ${new Date(sub.startDate).toLocaleDateString('de-DE')}`,
    date: sub.startDate,
    status: sub.status
  }))].sort((a, b) => b.date - a.date);
};
