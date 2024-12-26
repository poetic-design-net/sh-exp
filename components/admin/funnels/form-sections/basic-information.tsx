"use client";

import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormValues } from "./types";

interface BasicInformationProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

export function BasicInformation({ register, errors }: BasicInformationProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-6">Grundeinstellungen</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            {...register("name", { required: "Name wird benötigt" })}
            placeholder="Funnel Name"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            URL-Pfad
          </label>
          <Input
            {...register("slug", { required: "URL-Pfad wird benötigt" })}
            placeholder="funnel-name"
          />
          {errors.slug && (
            <p className="text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
