"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TestimonialItem {
  name: string;
  quote: string;
  image: string;
}

interface TestimonialsFormProps {
  testimonials: {
    title: string;
    items: TestimonialItem[];
  };
  onFieldChange: (field: string, value: any) => void;
}

export function TestimonialsForm({ testimonials, onFieldChange }: TestimonialsFormProps) {
  const handleItemChange = (index: number, field: keyof TestimonialItem, value: string) => {
    const newItems = [...(testimonials.items || [])];
    if (!newItems[index]) {
      newItems[index] = { name: "", quote: "", image: "" };
    }
    newItems[index] = { ...newItems[index], [field]: value };
    // Pass the entire items array as the value
    onFieldChange("items", newItems);
  };

  const addTestimonial = () => {
    const newItems = [...(testimonials.items || []), { name: "", quote: "", image: "" }];
    // Pass the entire items array as the value
    onFieldChange("items", newItems);
  };

  const removeTestimonial = (index: number) => {
    const newItems = [...(testimonials.items || [])];
    newItems.splice(index, 1);
    // Pass the entire items array as the value
    onFieldChange("items", newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Testimonials</h3>
        <Button
          type="button"
          variant="outline"
          onClick={addTestimonial}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Add Testimonial
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="testimonials-title">Section Title</Label>
        <Input
          id="testimonials-title"
          value={testimonials.title || ""}
          onChange={(e) => onFieldChange("title", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-4">
        {(testimonials.items || []).map((item, index) => (
          <div key={index} className="grid gap-4 p-4 border rounded bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Testimonial {index + 1}</h4>
              <Button
                type="button"
                variant="outline"
                onClick={() => removeTestimonial(index)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Remove
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`testimonial-${index}-name`}>Name</Label>
              <Input
                id={`testimonial-${index}-name`}
                value={item.name || ""}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`testimonial-${index}-quote`}>Quote</Label>
              <Input
                id={`testimonial-${index}-quote`}
                value={item.quote || ""}
                onChange={(e) => handleItemChange(index, "quote", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`testimonial-${index}-image`}>Image URL</Label>
              <Input
                id={`testimonial-${index}-image`}
                value={item.image || ""}
                onChange={(e) => handleItemChange(index, "image", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
