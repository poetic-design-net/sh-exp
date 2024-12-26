import dynamic from 'next/dynamic';

// Dynamically import the cart content with no SSR
const CartContent = dynamic(() => import('@/app/(non-admin)/cart/cart-content'), { 
  ssr: false,
  loading: () => (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Warenkorb</h1>
      <div className="text-center py-12">
        <p>Laden...</p>
      </div>
    </div>
  )
});

// Generate empty static params to allow dynamic paths
export function generateStaticParams() {
  return [];
}

// Prevent static optimization for cart functionality
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamicParams = true;

export default function CartPage() {
  return <CartContent />;
}
