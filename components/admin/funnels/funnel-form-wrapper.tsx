'use client';

import { useRouter } from "next/navigation";
import { FunnelForm } from "./funnel-form";
import { handleFunnelCreate, updateFunnelData } from "@/app/actions/funnel-actions";
import type { Funnel } from "@/types/funnel";
import type { Product } from "@/types/product";

interface FunnelFormWrapperProps {
  initialData?: Funnel;
  products: Product[];
}

export function FunnelFormWrapper({ initialData, products }: FunnelFormWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Funnel>): Promise<{ success: boolean }> => {
    try {
      let result;
      
      if (initialData?.id) {
        // Update existing funnel
        result = await updateFunnelData(initialData.id, data);
      } else {
        // Create new funnel
        result = await handleFunnelCreate(data);
      }

      if (result.success) {
        router.push("/admin/funnels");
        router.refresh();
      }
      return result;
    } catch (err) {
      console.error("Error submitting funnel:", err);
      throw err;
    }
  };

  return (
    <FunnelForm
      initialData={initialData}
      onSubmit={handleSubmit}
      products={products}
    />
  );
}
