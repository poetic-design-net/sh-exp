import { getFunnels } from "@/app/actions/funnels";
import { getProducts } from "@/app/actions/products";
import { FunnelFormWrapper } from "@/components/admin/funnels/funnel-form-wrapper";
import { redirect } from "next/navigation";
import type { Funnel } from "@/types/funnel";

interface EditFunnelPageProps {
  params: {
    id: string;
  };
}

export default async function EditFunnelPage({ params }: EditFunnelPageProps) {
  const funnels = await getFunnels();
  const funnel = funnels.find(f => f.id === params.id);
  const products = await getProducts();

  if (!funnel) {
    redirect("/admin/funnels");
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-8">Funnel bearbeiten</h1>
      <FunnelFormWrapper 
        initialData={funnel} 
        products={products}
      />
    </div>
  );
}
