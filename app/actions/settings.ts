"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase-admin";
import type { Settings } from "@/types/settings";

export async function getSettings(): Promise<Settings> {
  try {
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
  } catch (error) {
    console.error("[GET_SETTINGS]", error);
    throw new Error("Fehler beim Laden der Einstellungen");
  }
}

export async function updateSettings(settings: Settings) {
  try {
    const settingsRef = db.collection("settings").doc("website");
    await settingsRef.set(settings, { merge: true });
    
    revalidatePath("/");  // Revalidate all pages since settings affect the entire site
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_SETTINGS]", error);
    return { error: "Fehler beim Aktualisieren der Einstellungen" };
  }
}
