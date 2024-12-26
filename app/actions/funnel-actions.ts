"use server";

import type { Funnel } from "@/types/funnel";
import { updateFunnel, createFunnel as createFunnelBase } from "./funnels";
import { cleanFormData } from "@/components/admin/funnels/form-sections/types";

// Validation types
type ValidationResult = {
  isValid: boolean;
  error?: string;
};

// Validation functions
const validateRequiredFields = (data: Partial<Funnel>): ValidationResult => {
  if (!data.name) {
    return { isValid: false, error: "Name ist erforderlich" };
  }
  if (!data.slug) {
    return { isValid: false, error: "URL-Pfad ist erforderlich" };
  }
  if (!data.products?.main) {
    return { isValid: false, error: "Hauptprodukt ist erforderlich" };
  }
  return { isValid: true };
};

const validateCountdown = (data: Partial<Funnel>): ValidationResult => {
  if (data.settings?.countdown) {
    const { startDate, endDate } = data.settings.countdown;
    if (startDate > endDate) {
      return { 
        isValid: false, 
        error: "Das Startdatum muss vor dem Enddatum liegen" 
      };
    }
  }
  return { isValid: true };
};

// Helper function to validate funnel data
const validateFunnelData = (data: Partial<Funnel>): ValidationResult => {
  // Check required fields first
  const requiredFieldsValidation = validateRequiredFields(data);
  if (!requiredFieldsValidation.isValid) {
    return requiredFieldsValidation;
  }

  // Check countdown if present
  const countdownValidation = validateCountdown(data);
  if (!countdownValidation.isValid) {
    return countdownValidation;
  }

  return { isValid: true };
};

// Helper to create a base funnel structure with required fields
const createBaseFunnelData = (data: Partial<Funnel>) => {
  // After validation, we know these fields exist
  if (!data.name || !data.slug || !data.products?.main) {
    throw new Error("Required fields missing after validation");
  }

  return {
    name: data.name,
    slug: data.slug,
    products: {
      main: data.products.main,
      upsells: data.products.upsells || [],
    },
    settings: {
      checkoutStyle: data.settings?.checkoutStyle || 'integrated',
      upsellDiscount: data.settings?.upsellDiscount || 10,
      mainProductDiscount: data.settings?.mainProductDiscount || 0,
      countdown: data.settings?.countdown ? {
        startDate: new Date(data.settings.countdown.startDate),
        endDate: new Date(data.settings.countdown.endDate),
        redirectUrl: data.settings.countdown.redirectUrl || "",
      } : undefined,
    },
    content: {
      testimonials: data.content?.testimonials || [],
      faq: data.content?.faq || [],
      problemSolution: data.content?.problemSolution,
      benefits: data.content?.benefits,
    },
    isActive: data.isActive ?? false,
  } as const;
};

export async function handleFunnelCreate(data: Partial<Funnel>): Promise<{ success: boolean }> {
  try {
    // Validate data
    const validation = validateFunnelData(data);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const funnelData = createBaseFunnelData(data);
    await createFunnelBase(funnelData);
    return { success: true };
  } catch (error) {
    console.error('Error creating funnel:', error);
    if (error instanceof Error) {
      throw new Error(`Fehler beim Erstellen des Funnels: ${error.message}`);
    }
    throw new Error("Ein unerwarteter Fehler ist aufgetreten");
  }
}

export async function updateFunnelData(id: string, data: Partial<Funnel>): Promise<{ success: boolean }> {
  try {
    const cleanData = cleanFormData(data);

    // Validate data
    const validation = validateFunnelData(cleanData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    await updateFunnel(id, cleanData);
    return { success: true };
  } catch (error) {
    console.error('Error updating funnel:', error);
    if (error instanceof Error) {
      throw new Error(`Fehler beim Aktualisieren des Funnels: ${error.message}`);
    }
    throw new Error("Ein unerwarteter Fehler ist aufgetreten");
  }
}
