"use client";

import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MediaField } from "@/components/admin/shared/media-field";
import { getAllMedia } from "@/app/actions/media";
import type { MediaItem } from "@/services/media-library";
import { RegisterComponentProps } from "./component-props";

interface EventFormProps {
  title: string;
  eventData: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  onChange: (field: string, value: string) => void;
}

const EventForm: React.FC<EventFormProps> = ({ title, eventData, onChange }) => (
  <div className="space-y-4">
    <h3 className="font-medium">{title}</h3>
    <div className="space-y-2">
      <Label htmlFor="eventTitle">Title</Label>
      <Input
        id="eventTitle"
        value={eventData?.title || ""}
        onChange={(e) => onChange("title", e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="eventDescription">Description</Label>
      <RichTextEditor
        value={eventData?.description || ""}
        onChange={(value) => onChange("description", value)}
        minHeight={200}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="eventButtonText">Button Text</Label>
      <Input
        id="eventButtonText"
        value={eventData?.buttonText || ""}
        onChange={(e) => onChange("buttonText", e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="eventButtonLink">Button Link</Label>
      <Input
        id="eventButtonLink"
        value={eventData?.buttonLink || ""}
        onChange={(e) => onChange("buttonLink", e.target.value)}
      />
    </div>
  </div>
);

interface RegisterTabProps {
  registerProps?: RegisterComponentProps;
  onFieldChange: (path: string, value: any) => void;
}

export function RegisterTab({ registerProps, onFieldChange }: RegisterTabProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      const items = await getAllMedia();
      setMediaItems(items);
    };
    loadMedia();
  }, []);

  const handleEventChange = (field: string, value: string) => {
    onFieldChange(`register.event.${field}`, value);
  };

  const handleTestimonialChange = (index: number, field: string, value: string) => {
    const newItems = [...(registerProps?.testimonials?.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onFieldChange("register.testimonials.items", newItems);
  };

  const handleWaitingListChange = (field: string, value: string) => {
    onFieldChange(`register.waitingList.${field}`, value);
  };

  const handleActiveCampaignChange = (value: string) => {
    onFieldChange("register.waitingList.activeCampaign", { listId: value });
  };

  const handleCheckboxChange = (index: number, field: string, value: string) => {
    const newCheckboxes = [...(registerProps?.waitingList?.checkboxes || [])];
    newCheckboxes[index] = {
      ...newCheckboxes[index],
      [field]: value,
    };
    onFieldChange("register.waitingList.checkboxes", newCheckboxes);
  };

  const defaultEventData = {
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  };

  return (
    <div className="grid gap-8">
      {/* Event Section */}
      <EventForm
        title="Event"
        eventData={registerProps?.event || defaultEventData}
        onChange={handleEventChange}
      />

      {/* Testimonials Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Testimonials</h3>
        <div className="space-y-2">
          <Label htmlFor="testimonialsTitle">Title</Label>
          <Input
            id="testimonialsTitle"
            value={registerProps?.testimonials?.title || ""}
            onChange={(e) => onFieldChange("register.testimonials.title", e.target.value)}
          />
        </div>
        {(registerProps?.testimonials?.items || []).map((item, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor={`testimonialName${index}`}>Name</Label>
              <Input
                id={`testimonialName${index}`}
                value={item?.name || ""}
                onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`testimonialQuote${index}`}>Quote</Label>
              <Input
                id={`testimonialQuote${index}`}
                value={item?.quote || ""}
                onChange={(e) => handleTestimonialChange(index, "quote", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`testimonialImage${index}`}>Image</Label>
              <MediaField
                value={item?.image || ""}
                onChange={(value) => handleTestimonialChange(index, "image", value)}
                items={mediaItems}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Waiting List Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Waiting List</h3>
        <div className="space-y-2">
          <Label htmlFor="waitingListTitle">Title</Label>
          <Input
            id="waitingListTitle"
            value={registerProps?.waitingList?.title || ""}
            onChange={(e) => handleWaitingListChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="waitingListDescription">Description</Label>
          <RichTextEditor
            value={registerProps?.waitingList?.description || ""}
            onChange={(value) => handleWaitingListChange("description", value)}
            minHeight={150}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="waitingListButtonText">Button Text</Label>
          <Input
            id="waitingListButtonText"
            value={registerProps?.waitingList?.buttonText || ""}
            onChange={(e) => handleWaitingListChange("buttonText", e.target.value)}
          />
        </div>
        {/* ActiveCampaign List ID Field */}
        <div className="space-y-2">
          <Label htmlFor="activeCampaignListId">ActiveCampaign List ID</Label>
          <Input
            id="activeCampaignListId"
            value={registerProps?.waitingList?.activeCampaign?.listId || ""}
            onChange={(e) => handleActiveCampaignChange(e.target.value)}
            placeholder="z.B. 1"
          />
        </div>
        {(registerProps?.waitingList?.checkboxes || []).map((checkbox, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor={`checkboxLabel${index}`}>Label</Label>
              <Input
                id={`checkboxLabel${index}`}
                value={checkbox?.label || ""}
                onChange={(e) => handleCheckboxChange(index, "label", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
