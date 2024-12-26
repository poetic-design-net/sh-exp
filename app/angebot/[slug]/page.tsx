import { getFunnelBySlug } from "@/app/actions/funnels";
import { getProductsByIds } from "@/app/actions/products";
import { SimpleFunnel } from "@/components/funnel/simple-funnel";
import { notFound } from "next/navigation";

interface FunnelPageProps {
  params: {
    slug: string;
  };
}

export default async function FunnelPage({ params }: FunnelPageProps) {
  const funnel = await getFunnelBySlug(params.slug);

  if (!funnel || !funnel.isActive) {
    notFound();
  }

  // Get all product IDs (main product and upsells)
  const productIds = [funnel.products.main, ...funnel.products.upsells];
  
  // Fetch all required products
  const products = await getProductsByIds(productIds);

  return (
    <div className="min-h-screen bg-white">
      <SimpleFunnel funnel={funnel} products={products} />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: FunnelPageProps) {
  const funnel = await getFunnelBySlug(params.slug);

  if (!funnel) {
    return {
      title: "Angebot nicht gefunden",
    };
  }

  return {
    title: funnel.name,
    description: `${funnel.name} - Exklusives Angebot`,
  };
}
