'use server';

import { getOrders } from './orders';

export async function searchOrders(searchTerm: string) {
  try {
    // Remove any filters to search across all orders
    const result = await getOrders(1, 50, 'createdAt', 'desc', { 
      searchTerm,
      // Don't filter by archive status for search
      archived: undefined
    });
    
    // Log for debugging
    console.log('Search results:', result.orders.length);
    
    return result.orders;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
