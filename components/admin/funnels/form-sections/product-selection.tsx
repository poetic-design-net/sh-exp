"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import type { Product } from "@/types/product";
import { FormValues } from "./types";

interface ProductSelectionProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  products: Product[];
}

export function ProductSelection({ register, errors, products }: ProductSelectionProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-6">Produkte</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hauptprodukt
          </label>
          <select
            {...register("products.main", { required: "Hauptprodukt wird benötigt" })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="">Produkt auswählen</option>
            {products?.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.price}€)
              </option>
            ))}
          </select>
          {errors.products?.main && (
            <p className="text-sm text-red-600">{errors.products.main.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Zusatzprodukte (Upsells)
          </label>
          <select
            multiple
            {...register("products.upsells")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-1 focus:ring-black min-h-[120px]"
          >
            {products?.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.price}€)
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
