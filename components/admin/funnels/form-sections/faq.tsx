"use client";

import { UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { FormValues } from "./types";

interface FAQProps {
  register: UseFormRegister<FormValues>;
  initialFAQ?: {
    question: string;
    answer: string;
  }[];
  onFAQChange: (faq: any[]) => void;
}

export function FAQ({ register, initialFAQ = [], onFAQChange }: FAQProps) {
  const [faq, setFAQ] = useState(initialFAQ);

  const addFAQ = () => {
    const newFAQ = [...faq, { question: "", answer: "" }];
    setFAQ(newFAQ);
    onFAQChange(newFAQ);
  };

  const removeFAQ = (index: number) => {
    const newFAQ = faq.filter((_, i) => i !== index);
    setFAQ(newFAQ);
    onFAQChange(newFAQ);
  };

  const updateFAQ = (index: number, field: string, value: string) => {
    const newFAQ = [...faq];
    newFAQ[index] = {
      ...newFAQ[index],
      [field]: value
    };
    setFAQ(newFAQ);
    onFAQChange(newFAQ);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">FAQ</h3>
        <Button type="button" onClick={addFAQ} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Frage hinzufügen
        </Button>
      </div>
      <div className="space-y-6">
        {faq.map((item, index) => (
          <div key={index} className="relative border rounded-lg p-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => removeFAQ(index)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Frage
                </label>
                <Input
                  value={item.question}
                  onChange={(e) => updateFAQ(index, "question", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Antwort
                </label>
                <Textarea
                  value={item.answer}
                  onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
