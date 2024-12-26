import { getProducts } from "@/app/actions/products";
import { FunnelFormWrapper } from "@/components/admin/funnels/funnel-form-wrapper";

export default async function NewFunnelPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-8">Neuen Funnel erstellen</h1>
      <FunnelFormWrapper products={products} />
    </div>
  );
}
