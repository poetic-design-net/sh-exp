import { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { db } from "@/lib/firebase-admin";
import type { Settings } from "@/types/settings";

export const metadata: Metadata = {
  title: "Einstellungen | Admin",
  description: "Verwalten Sie Ihre Anwendungseinstellungen",
};

async function getSettings(): Promise<Settings> {
  const settingsRef = db.collection("settings").doc("website");
  const doc = await settingsRef.get();
  
  if (!doc.exists) {
    return {
      general: {
        siteName: "",
        tagline: "",
        footerText: "",
        cookieNotice: "",
      },
      seo: {
        siteTitle: "",
        siteDescription: "",
        defaultMetaImage: "",
        keywords: "",
        robots: "",
        googleSiteVerification: "",
      },
      contact: {
        email: "",
        phone: "",
        address: "",
        contactFormEmail: "",
      },
      social: {
        facebook: "",
        instagram: "",
        youtube: "",
        telegram: "",
      },
      branding: {
        logo: "",
        favicon: "",
      },
    };
  }

  return doc.data() as Settings;
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-gray-600">Verwalten Sie hier Ihre Systemkonfigurationen und Einstellungen.</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
