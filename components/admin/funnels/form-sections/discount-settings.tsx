"use client";

import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormValues } from "./types";

interface DiscountSettingsProps {
  register: UseFormRegister<FormValues>;
}

export function DiscountSettings({ register }: DiscountSettingsProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-6">Einstellungen</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Checkout-Art
          </label>
          <select
            {...register("settings.checkoutStyle")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="integrated">Integriert</option>
            <option value="redirect">Weiterleitung</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hauptprodukt Rabatt (%)
          </label>
          <Input
            type="number"
            {...register("settings.mainProductDiscount")}
            min="0"
            max="100"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upsell Rabatt (%)
          </label>
          <Input
            type="number"
            {...register("settings.upsellDiscount")}
            min="0"
            max="100"
          />
        </div>
      </div>
    </div>
  );
}
