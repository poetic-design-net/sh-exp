"use client";

import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormValues } from "./types";

interface CountdownSettingsProps {
  register: UseFormRegister<FormValues>;
  watch: UseFormWatch<FormValues>;
}

export function CountdownSettings({ register, watch }: CountdownSettingsProps) {
  const startDate = watch("settings.countdown.startDate");
  const endDate = watch("settings.countdown.endDate");

  console.log('Current countdown values:', { startDate, endDate });

  const validateDate = (value: string | undefined) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-6">Aktionszeitraum</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Startdatum
            </label>
            <Input
              type="datetime-local"
              {...register("settings.countdown.startDate", {
                onChange: (e) => {
                  console.log('Start date changed:', {
                    value: e.target.value,
                    date: e.target.value ? new Date(e.target.value) : null
                  });
                },
                validate: (value) => {
                  console.log('Validating start date:', {
                    value,
                    date: value ? new Date(value) : null,
                    endDate,
                    endDateObj: endDate ? new Date(endDate) : null
                  });

                  if (!validateDate(value)) return "Ungültiges Datum";
                  if (endDate && !value) return "Startdatum ist erforderlich wenn Enddatum gesetzt ist";
                  if (value && endDate && new Date(value) > new Date(endDate)) {
                    return "Startdatum muss vor dem Enddatum liegen";
                  }
                  return true;
                }
              })}
              className="mt-1 block w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enddatum
            </label>
            <Input
              type="datetime-local"
              {...register("settings.countdown.endDate", {
                onChange: (e) => {
                  console.log('End date changed:', {
                    value: e.target.value,
                    date: e.target.value ? new Date(e.target.value) : null
                  });
                },
                validate: (value) => {
                  console.log('Validating end date:', {
                    value,
                    date: value ? new Date(value) : null,
                    startDate,
                    startDateObj: startDate ? new Date(startDate) : null
                  });

                  if (!validateDate(value)) return "Ungültiges Datum";
                  if (startDate && !value) return "Enddatum ist erforderlich wenn Startdatum gesetzt ist";
                  if (value && startDate && new Date(startDate) > new Date(value)) {
                    return "Enddatum muss nach dem Startdatum liegen";
                  }
                  return true;
                }
              })}
              className="mt-1 block w-full"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Weiterleitungs-URL nach Ablauf
          </label>
          <Input
            type="url"
            {...register("settings.countdown.redirectUrl")}
            placeholder="https://..."
            className="mt-1 block w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Nach Ablauf des Aktionszeitraums werden Besucher zu dieser URL weitergeleitet
          </p>
        </div>
      </div>
    </div>
  );
}
