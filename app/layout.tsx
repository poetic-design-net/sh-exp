import type { Metadata } from "next";
import { Toaster } from "components/ui/toaster";
import { ThemeProvider } from "components/theme-provider";
import { LayoutWrapper } from "components/layout/layout-wrapper";
import { MyFirebaseProvider } from "components/firebase-providers";
import { CartProvider } from "contexts/cart-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { ErrorBoundaryProvider } from "components/providers/error-boundary";
import { cn } from "lib/utils";
import { ReactNode } from "react";
import { db } from "@/lib/firebase-admin";
import type { Settings } from "@/types/settings";
import "./globals.css";

async function getSettings(): Promise<Settings> {
  const settingsRef = db.collection("settings").doc("website");
  const doc = await settingsRef.get();
  
  if (!doc.exists) {
    return {
      general: {
        siteName: "Stefan Hiene",
        tagline: "Personal Development & Coaching",
        footerText: "",
        cookieNotice: "",
      },
      seo: {
        siteTitle: "Stefan Hiene | Personal Development & Coaching",
        siteDescription: "Entdecke dein volles Potenzial mit Stefan Hiene. Exklusive Kurse, Produkte und Mitgliedschaften für deine persönliche und berufliche Entwicklung.",
        defaultMetaImage: "/static/assets/logo.webp",
        keywords: "Stefan Hiene, Coaching, Personal Development, Professional Development, Mindfulness, Transformation",
        robots: "noindex, nofollow",
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
        logo: "/static/assets/logo.webp",
        favicon: "/static/assets/logo.webp",
      },
    };
  }

  return doc.data() as Settings;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: settings.seo.siteTitle,
    description: settings.seo.siteDescription,
    keywords: settings.seo.keywords?.split(",").map(k => k.trim()),
    robots: {
      index: settings.seo.robots?.includes("index") ?? false,
      follow: settings.seo.robots?.includes("follow") ?? false,
    },
    icons: {
      icon: [
        {
          url: settings.branding.favicon || "/static/assets/logo.webp",
          type: "image/webp",
        }
      ],
      apple: [
        {
          url: settings.branding.favicon || "/static/assets/logo.webp",
          type: "image/webp",
        }
      ]
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSettings();
  const favicon = settings.branding.favicon || "/static/assets/logo.webp";

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/webp" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />
      </head>
      <body className={cn("min-h-screen bg-background text-foreground antialiased")} suppressHydrationWarning>
        <QueryProvider>
          <ErrorBoundaryProvider>
            <MyFirebaseProvider>
              <CartProvider>
                <ThemeProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                  <Toaster />
                </ThemeProvider>
              </CartProvider>
            </MyFirebaseProvider>
          </ErrorBoundaryProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
