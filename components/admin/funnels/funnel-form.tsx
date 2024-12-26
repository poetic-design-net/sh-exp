"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { Funnel } from "@/types/funnel";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { BasicInformation } from "./form-sections/basic-information";
import { ProductSelection } from "./form-sections/product-selection";
import { DiscountSettings } from "./form-sections/discount-settings";
import { CountdownSettings } from "./form-sections/countdown-settings";
import { Testimonials } from "./form-sections/testimonials";
import { FAQ } from "./form-sections/faq";
import { FormValues, convertFormToFunnelData } from "./form-sections/types";
import { useTransition, useState, useEffect } from "react";
import { Alert } from "@/components/ui/alert";

interface FunnelFormProps {
  initialData?: Partial<Funnel>;
  onSubmit: (data: Partial<Funnel>) => Promise<{ success: boolean }>;
  products: Product[];
}

export function FunnelForm({ initialData, onSubmit, products }: FunnelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState(initialData?.content?.testimonials || []);
  const [faq, setFAQ] = useState(initialData?.content?.faq || []);

  // Format date for datetime-local input
  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return undefined;
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().slice(0, 16);
  };

  const defaultValues = {
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    products: {
      main: initialData?.products?.main || "",
      upsells: initialData?.products?.upsells || [],
    },
    settings: {
      checkoutStyle: initialData?.settings?.checkoutStyle || "integrated",
      upsellDiscount: initialData?.settings?.upsellDiscount || 10,
      mainProductDiscount: initialData?.settings?.mainProductDiscount || 0,
      countdown: initialData?.settings?.countdown ? {
        startDate: formatDateForInput(initialData.settings.countdown.startDate),
        endDate: formatDateForInput(initialData.settings.countdown.endDate),
        redirectUrl: initialData.settings.countdown.redirectUrl,
      } : undefined,
    },
    isActive: initialData?.isActive ?? false,
  };

  console.log('Form default values:', defaultValues);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues,
  });

  const handleFormSubmit = async (data: FormValues) => {
    setError(null);
    console.log('Form submission data:', data);

    // Create a copy of the data to avoid mutating the form values
    const submissionData = { ...data };

    // Handle countdown settings
    if (submissionData.settings?.countdown) {
      const { startDate, endDate } = submissionData.settings.countdown;
      
      // Only include countdown if both dates are provided
      if (startDate && endDate) {
        // Parse the dates and create new Date objects
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          setError("Ungültiges Datum");
          return;
        }

        console.log('Parsed dates:', { parsedStartDate, parsedEndDate });

        submissionData.settings.countdown = {
          startDate: parsedStartDate.toISOString(),
          endDate: parsedEndDate.toISOString(),
          redirectUrl: submissionData.settings.countdown.redirectUrl || "",
        };
      } else {
        delete submissionData.settings.countdown;
      }
    }

    console.log('Processed submission data:', submissionData);

    const formattedData = {
      ...convertFormToFunnelData(submissionData),
      content: {
        testimonials,
        faq,
        ...(initialData?.content?.problemSolution && {
          problemSolution: initialData.content.problemSolution
        }),
        ...(initialData?.content?.benefits && {
          benefits: initialData.content.benefits
        }),
      },
    };

    console.log('Final formatted data:', formattedData);

    startTransition(async () => {
      try {
        const result = await onSubmit(formattedData);
        if (result.success) {
          router.push("/admin/funnels");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="mx-auto space-y-8 pb-12">
      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}
      
      <BasicInformation register={register} errors={errors} />
      <ProductSelection register={register} errors={errors} products={products} />
      <DiscountSettings register={register} />
      <CountdownSettings register={register} watch={watch} />
      <Testimonials
        register={register}
        initialTestimonials={testimonials}
        onTestimonialsChange={setTestimonials}
      />
      <FAQ
        register={register}
        initialFAQ={faq}
        onFAQChange={setFAQ}
      />

      {/* Active Status */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label className="text-sm text-gray-700">
            Funnel aktivieren
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="px-6 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          disabled={isPending}
        >
          {isPending ? "Wird gespeichert..." : (initialData ? "Änderungen speichern" : "Funnel erstellen")}
        </Button>
      </div>
    </form>
  );
}
