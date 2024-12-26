"use client";

import { UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { FormValues } from "./types";

interface TestimonialsProps {
  register: UseFormRegister<FormValues>;
  initialTestimonials?: {
    author: string;
    text: string;
    image?: string;
    rating: number;
  }[];
  onTestimonialsChange: (testimonials: any[]) => void;
}

export function Testimonials({ register, initialTestimonials = [], onTestimonialsChange }: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  const addTestimonial = () => {
    const newTestimonials = [
      ...testimonials,
      { author: "", text: "", rating: 5, image: "" }
    ];
    setTestimonials(newTestimonials);
    onTestimonialsChange(newTestimonials);
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = testimonials.filter((_, i) => i !== index);
    setTestimonials(newTestimonials);
    onTestimonialsChange(newTestimonials);
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = {
      ...newTestimonials[index],
      [field]: value
    };
    setTestimonials(newTestimonials);
    onTestimonialsChange(newTestimonials);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Testimonials</h3>
        <Button type="button" onClick={addTestimonial} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Testimonial hinzufügen
        </Button>
      </div>
      <div className="space-y-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="relative border rounded-lg p-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => removeTestimonial(index)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <Input
                  value={testimonial.author}
                  onChange={(e) => updateTestimonial(index, "author", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Bewertung (1-5)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={testimonial.rating}
                  onChange={(e) => updateTestimonial(index, "rating", parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Text
              </label>
              <Textarea
                value={testimonial.text}
                onChange={(e) => updateTestimonial(index, "text", e.target.value)}
              />
            </div>
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bild URL (optional)
              </label>
              <Input
                value={testimonial.image || ""}
                onChange={(e) => updateTestimonial(index, "image", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
