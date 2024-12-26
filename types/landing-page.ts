export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  order: number;
  isExternal?: boolean;
  target?: '_blank' | '_self';
}

export interface NavigationConfig {
  desktopItems: NavigationItem[];
  mobileItems: NavigationItem[];
  settings: {
    mobileBreakpoint: number;
    showSocialLinks: boolean;
    enableSearch: boolean;
  };
}

export interface LandingPageComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  order: number;
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  components: LandingPageComponent[];
  navigation: NavigationConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
  };
}

export type ComponentType = 
  | "hero"
  | "features"
  | "testimonials"
  | "pricing"
  | "cta"
  | "faq"
  | "contact"
  | "imageGallery"
  | "textBlock"
  | "videoSection"
  | "navigation"
  | "mobileMenu"
  | "intro"
  | "register"
  | "footer";

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  description: string;
  defaultProps: Record<string, any>;
  schema: {
    properties: Record<string, {
      type: string;
      title: string;
      description?: string;
      default?: any;
      enum?: string[];
    }>;
    required: string[];
  };
}

// Form types for the admin interface
export interface NavigationItemFormData {
  label: string;
  href: string;
  icon?: string;
  order: number;
  isExternal: boolean;
  target: '_blank' | '_self';
}

// Base interface für alle Komponenten-Props
export interface BaseComponentProps {
  id?: string;
}

export interface FAQFormData extends BaseComponentProps {
  title: string;
  subtitle: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  ctaText: string;
  ctaLink: string;
  registerTitle: string;
  registerCtaText: string;
  registerCtaLink: string;
  backgroundImage?: string;
}

export interface FooterFormData extends BaseComponentProps {
  name: {
    bold: string;
    normal: string;
  };
  quote: string;
  quickLinks: {
    privacyPolicy: string;
    termsConditions: string;
    faqs: string;
    contact: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  contact: {
    phone: string;
    address: string;
  };
}
