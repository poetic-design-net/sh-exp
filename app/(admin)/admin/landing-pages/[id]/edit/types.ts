export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

export interface LandingPageComponent {
  type: 'hero' | 'intro' | 'register';
  props: Record<string, any>;
}

export interface LandingPageData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  navigation: {
    desktopItems: NavigationItem[];
    mobileItems: NavigationItem[];
  };
  components: LandingPageComponent[];
}
