"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventFormProps {
  title: string;
  eventData: {
    title: string;
    description: string;
    buttonText: string;
  };
  onChange: (field: string, value: string) => void;
  fieldPrefix: string;
}

export function EventForm({ title, eventData, onChange, fieldPrefix }: EventFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">{title}</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}-title`}>Title</Label>
          <Input
            id={`${fieldPrefix}-title`}
            value={eventData.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Event title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}-description`}>Description</Label>
          <Input
            id={`${fieldPrefix}-description`}
            value={eventData.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Event description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}-button`}>Button Text</Label>
          <Input
            id={`${fieldPrefix}-button`}
            value={eventData.buttonText}
            onChange={(e) => onChange("buttonText", e.target.value)}
            placeholder="Button text"
          />
        </div>
      </div>
    </div>
  );
}
