import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus, Trash, Image } from "lucide-react";
import { MediaField } from "@/components/admin/shared/media-field";
import { getAllMedia } from "@/app/actions/media";
import type { MediaItem } from "@/services/media-library";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQFormData {
  title: string;
  subtitle: string;
  faqs: FAQItem[];
  ctaText: string;
  ctaLink: string;
  registerTitle: string;
  registerCtaText: string;
  registerCtaLink: string;
  backgroundImage?: string;
}

interface FAQTabProps {
  initialData: FAQFormData;
  onSubmit: (data: FAQFormData) => void;
}

export function FAQTab({ initialData, onSubmit }: FAQTabProps) {
  const { register, handleSubmit, watch, setValue } = useForm<FAQFormData>({
    defaultValues: initialData
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = watch("faqs") || [];
  const backgroundImage = watch("backgroundImage");

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const addFAQ = () => {
    setValue("faqs", [...faqs, { question: "", answer: "" }]);
  };

  const removeFAQ = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setValue("faqs", newFaqs);
  };

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      const items = await getAllMedia();
      setMediaItems(items);
    };
    loadMedia();
  }, []);

  return (
    <div className="space-y-8" onChange={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register("title")} placeholder="FAQs" />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input {...register("subtitle")} placeholder="Common questions about our service" />
          </div>
        </div>

        <Separator />


        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>FAQ Items</Label>
            <Button type="button" onClick={addFAQ} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="flex items-center text-sm font-medium"
                  >
                    {expandedIndex === index ? (
                      <ChevronUp className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    FAQ Item {index + 1}
                  </button>
                  <Button
                    type="button"
                    onClick={() => removeFAQ(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                {expandedIndex === index && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        {...register(`faqs.${index}.question`)}
                        placeholder="Enter question"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Input
                        {...register(`faqs.${index}.answer`)}
                        placeholder="Enter answer"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CTA Text</Label>
            <Input {...register("ctaText")} placeholder="See All FAQs" />
          </div>
          <div className="space-y-2">
            <Label>CTA Link</Label>
            <Input {...register("ctaLink")} placeholder="/faqs" />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label>Registration Section</Label>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hintergrundbild</Label>
              <MediaField
                value={watch("backgroundImage") || ""}
                onChange={(value) => setValue("backgroundImage", value)}
                items={mediaItems}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register("registerTitle")} placeholder="Ready to Start?" />
            </div>
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input {...register("registerCtaText")} placeholder="Register Now" />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input {...register("registerCtaLink")} placeholder="/register" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
