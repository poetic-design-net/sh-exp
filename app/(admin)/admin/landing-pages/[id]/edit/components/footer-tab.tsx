"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FooterFormData } from "@/types/landing-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FooterTabProps {
  initialData?: FooterFormData;
  onSubmit: (data: FooterFormData) => void;
}

export function FooterTab({ initialData, onSubmit }: FooterTabProps) {
  const form = useForm<FooterFormData>({
    defaultValues: initialData || {
      name: {
        bold: "Stefan",
        normal: "Hiene"
      },
      quote: "The most important education in your life is the de-education of imagination.",
      quickLinks: {
        privacyPolicy: "Privacy Policy",
        termsConditions: "Terms & Conditions",
        faqs: "FAQs",
        contact: "Contact"
      },
      socials: {
        facebook: "Facebook",
        instagram: "Instagram",
        linkedin: "LinkedIn",
        youtube: "YouTube"
      },
      contact: {
        phone: "+1 234 56789",
        address: "Wacholderweg 52a\n26133 Oldenburg\nGermany"
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="quicklinks">Quick Links</TabsTrigger>
            <TabsTrigger value="socials">Social Links</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div className="text-xl font-semibold">Name</div>
              <FormField
                control={form.control}
                name="name.bold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bold Part</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name.normal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Normal Part</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="quicklinks" className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="quickLinks.privacyPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Policy Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quickLinks.termsConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quickLinks.faqs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FAQs Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quickLinks.contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="socials" className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="socials.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}

export default FooterTab;
