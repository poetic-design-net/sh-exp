export interface Settings {
  general: {
    siteName: string;
    tagline?: string;
    footerText?: string;
    cookieNotice?: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
    contactFormEmail?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    defaultMetaImage?: string;
    keywords?: string;
    robots?: string;
    googleSiteVerification?: string;
  };
  branding: {
    logo?: string;
    favicon?: string;
  };
}
