"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMembership } from "@/services/memberships-client";

export function MembershipForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);

  const addFeature = () => setFeatures([...features, ""]);
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      duration: parseInt(formData.get("duration") as string),
      features: features.filter(f => f.trim() !== ""),
      isActive: true,
      productIds: [], // This will be managed through product settings
    };

    try {
      await createMembership(data);
      router.push("/admin/memberships");
      router.refresh();
    } catch (error) {
      console.error("Error creating membership:", error);
      setError(error instanceof Error ? error.message : "Failed to create membership");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            name="name"
            required
            className="mt-1"
            placeholder="Premium Membership"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (days)
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            required
            min="1"
            className="mt-1"
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          required
          className="mt-1"
          placeholder="Access to premium content..."
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Features
        </label>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Access to exclusive content"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeFeature(index)}
                className="shrink-0"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addFeature}
          className="mt-2"
        >
          Add Feature
        </Button>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/memberships")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Membership"}
        </Button>
      </div>
    </form>
  );
}
