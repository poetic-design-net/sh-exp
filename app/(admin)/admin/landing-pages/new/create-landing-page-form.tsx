"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createLandingPage } from "@/app/actions/landing-pages";
import type { LandingPage, LandingPageComponent } from "@/types/landing-page";

const defaultComponents: LandingPageComponent[] = [
  {
    id: `hero-${Date.now()}`,
    type: "hero",
    props: {
      title: "",
      subtitle: "",
      buttonText: "",
      buttonLink: "",
    },
    order: 0,
  },
  {
    id: `intro-${Date.now()}`,
    type: "intro",
    props: {
      title: "",
      description: "",
      features: [],
    },
    order: 1,
  },
  {
    id: `register-${Date.now()}`,
    type: "register",
    props: {
      event: {
        title: "",
        description: "",
        buttonText: "",
        buttonLink: "",
      },
      testimonials: {
        title: "",
        items: [
          {
            name: "",
            quote: "",
            image: "",
          },
          {
            name: "",
            quote: "",
            image: "",
          },
          {
            name: "",
            quote: "",
            image: "",
          }
        ],
      },
      waitingList: {
        title: "",
        description: "",
        buttonText: "",
        checkboxes: [],
      },
    },
    order: 2,
  },
  {
    id: `faq-${Date.now()}`,
    type: "faq",
    props: {
      title: "",
      subtitle: "",
      faqs: [],
      ctaText: "",
      ctaLink: "",
      registerTitle: "",
      registerCtaText: "",
      registerCtaLink: "",
    },
    order: 3,
  },
  {
    id: `footer-${Date.now()}`,
    type: "footer",
    props: {
      name: {
        bold: "",
        normal: "",
      },
      quote: "",
      quickLinks: {
        privacyPolicy: "",
        termsConditions: "",
        faqs: "",
        contact: "",
      },
      socials: {
        facebook: "",
        instagram: "",
        linkedin: "",
        youtube: "",
      },
      contact: {
        phone: "",
        address: "",
      },
    },
    order: 4,
  },
];

export function CreateLandingPageForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;

    try {
      const newPage: Omit<LandingPage, "id" | "createdAt" | "updatedAt"> = {
        title,
        slug,
        description,
        components: defaultComponents,
        navigation: {
          desktopItems: [],
          mobileItems: [],
          settings: {
            mobileBreakpoint: 768,
            showSocialLinks: false,
            enableSearch: false,
          },
        },
        isActive: false,
        metadata: {
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || description,
        },
      };

      const createdPage = await createLandingPage(newPage);
      
      toast({
        title: "Success",
        description: "Landing page created successfully",
      });

      router.push(`/admin/landing-pages/${createdPage.id}/edit`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create landing page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Enter page title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                required
                placeholder="enter-page-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter page description"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">SEO Settings</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  placeholder="Enter SEO title (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Input
                  id="seoDescription"
                  name="seoDescription"
                  placeholder="Enter SEO description (optional)"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/landing-pages")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Page"}
          </Button>
        </div>
      </form>
    </div>
  );
}
