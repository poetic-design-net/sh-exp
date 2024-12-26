import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Global cache configuration
const CACHE_TAGS = {
  products: 'products',
  orders: 'orders',
  memberships: 'memberships',
  users: 'users',
};

const DEFAULT_REVALIDATE_SECONDS = 300; // 5 minutes

// Cache wrapper for server actions and data fetching
export function createCachedFunction<T>(
  fn: (...args: any[]) => Promise<T>,
  options: {
    tags?: string[];
    revalidateSeconds?: number;
  } = {}
) {
  return unstable_cache(
    fn,
    undefined,
    {
      tags: options.tags || [],
      revalidate: options.revalidateSeconds || DEFAULT_REVALIDATE_SECONDS,
    }
  );
}

// React cache for memoizing expensive computations
export const memoizedComputation = cache(async (key: string, computation: () => Promise<any>) => {
  return await computation();
});

// Helper to generate cache keys
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  return `${prefix}:${Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join(':')}`;
}

// Export cache tags for consistent usage
export { CACHE_TAGS };

// Helper to invalidate cache by tags
export async function invalidateCache(tags: string[]) {
  try {
    await Promise.all(
      tags.map(async (tag) => {
        await fetch(`/api/revalidate?tag=${tag}`, {
          method: 'POST',
        });
      })
    );
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}
