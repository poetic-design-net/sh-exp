"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Settings } from "@/types/settings";

const settingsFormSchema = z.object({
  general: z.object({
    siteName: z.string().min(1, "Website-Name wird benötigt"),
    tagline: z.string().optional(),
    footerText: z.string().optional(),
    cookieNotice: z.string().optional(),
  }),
  contact: z.object({
    email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
    phone: z.string().optional(),
    address: z.string().optional(),
    contactFormEmail: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein").optional(),
  }),
  social: z.object({
    facebook: z.string().url("Bitte geben Sie eine gültige URL ein").optional(),
    instagram: z.string().url("Bitte geben Sie eine gültige URL ein").optional(),
    youtube: z.string().url("Bitte geben Sie eine gültige URL ein").optional(),
    telegram: z.string().url("Bitte geben Sie eine gültige URL ein").optional(),
  }),
  seo: z.object({
    siteTitle: z.string().min(1, "Website-Titel wird benötigt"),
    siteDescription: z.string().min(1, "Website-Beschreibung wird benötigt"),
    defaultMetaImage: z.string().url("Bitte geben Sie eine gültige URL ein").optional(),
    keywords: z.string().optional(),
    robots: z.string().optional(),
    googleSiteVerification: z.string().optional(),
  }),
  branding: z.object({
    logo: z.string().url("Bitte geben Sie eine gültige URL ein").optional(),
    favicon: z.string().url("Bitte geben Sie eine gültige URL ein").optional(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface Props {
  initialSettings?: Partial<Settings>;
}

export function SettingsForm({ initialSettings = {} }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      general: {
        siteName: initialSettings.general?.siteName ?? "",
        tagline: initialSettings.general?.tagline ?? "",
        footerText: initialSettings.general?.footerText ?? "",
        cookieNotice: initialSettings.general?.cookieNotice ?? "",
      },
      contact: {
        email: initialSettings.contact?.email ?? "",
        phone: initialSettings.contact?.phone ?? "",
        address: initialSettings.contact?.address ?? "",
        contactFormEmail: initialSettings.contact?.contactFormEmail ?? "",
      },
      social: {
        facebook: initialSettings.social?.facebook ?? "",
        instagram: initialSettings.social?.instagram ?? "",
        youtube: initialSettings.social?.youtube ?? "",
        telegram: initialSettings.social?.telegram ?? "",
      },
      seo: {
        siteTitle: initialSettings.seo?.siteTitle ?? "",
        siteDescription: initialSettings.seo?.siteDescription ?? "",
        defaultMetaImage: initialSettings.seo?.defaultMetaImage ?? "",
        keywords: initialSettings.seo?.keywords ?? "",
        robots: initialSettings.seo?.robots ?? "",
        googleSiteVerification: initialSettings.seo?.googleSiteVerification ?? "",
      },
      branding: {
        logo: initialSettings.branding?.logo ?? "",
        favicon: initialSettings.branding?.favicon ?? "",
      },
    },
  });

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true);
    try {
      const result = await updateSettings(data);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Einstellungen aktualisiert",
        description: "Ihre Einstellungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="contact">Kontakt</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Allgemeine Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="general.siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website-Name</FormLabel>
                      <FormDescription>
                        Der Name Ihrer Website, der überall angezeigt wird.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} placeholder="Meine Website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slogan</FormLabel>
                      <FormDescription>
                        Ein kurzer Slogan oder Untertitel für Ihre Website.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} placeholder="Ihr Slogan hier" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer-Text</FormLabel>
                      <FormDescription>
                        Text, der im Footer Ihrer Website erscheint.
                      </FormDescription>
                      <FormControl>
                        <Textarea {...field} placeholder="© 2024 Ihre Website. Alle Rechte vorbehalten." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.cookieNotice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cookie-Hinweis</FormLabel>
                      <FormDescription>
                        Der Text für den Cookie-Hinweis auf Ihrer Website.
                      </FormDescription>
                      <FormControl>
                        <Textarea {...field} placeholder="Diese Website verwendet Cookies..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontakt-E-Mail</FormLabel>
                      <FormDescription>
                        Hauptkontakt-E-Mail-Adresse für Ihre Website.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} type="email" placeholder="kontakt@ihre-domain.de" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.contactFormEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontaktformular-E-Mail</FormLabel>
                      <FormDescription>
                        E-Mail-Adresse für Kontaktformular-Nachrichten (optional).
                      </FormDescription>
                      <FormControl>
                        <Input {...field} type="email" placeholder="formular@ihre-domain.de" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonnummer</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+49 123 456789" />
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
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Straße, PLZ, Stadt" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="social.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://facebook.com/ihre-seite" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://instagram.com/ihr-profil" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://youtube.com/ihr-kanal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://t.me/ihr-kanal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seo.siteTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website-Titel</FormLabel>
                      <FormDescription>
                        Der Haupttitel Ihrer Website für Suchmaschinen und Browser-Tabs.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} placeholder="Meine Website - Slogan" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo.siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta-Beschreibung</FormLabel>
                      <FormDescription>
                        Die Meta-Beschreibung für Suchergebnisse.
                      </FormDescription>
                      <FormControl>
                        <Textarea {...field} placeholder="Eine kurze Beschreibung Ihrer Website..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo.keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta-Keywords</FormLabel>
                      <FormDescription>
                        Kommagetrennte Liste von Schlüsselwörtern.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} placeholder="keyword1, keyword2, keyword3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo.robots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Robots Meta Tag</FormLabel>
                      <FormDescription>
                        Anweisungen für Suchmaschinen-Crawler.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} placeholder="index, follow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo.defaultMetaImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Meta-Bild</FormLabel>
                      <FormDescription>
                        Das Standardbild für Social Media Shares.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://ihre-domain.de/bild.jpg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo.googleSiteVerification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Site Verification</FormLabel>
                      <FormDescription>
                        Der Verifizierungscode für Google Search Console.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} placeholder="google-site-verification=..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="branding.logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormDescription>
                        Die URL zu Ihrem Website-Logo.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://ihre-domain.de/logo.png" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branding.favicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon URL</FormLabel>
                      <FormDescription>
                        Die URL zu Ihrem Website-Favicon.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://ihre-domain.de/favicon.ico" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Wird gespeichert..." : "Einstellungen speichern"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
