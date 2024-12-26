export interface Funnel {
  id: string;
  name: string;
  slug: string;
  products: {
    main: string; // Product ID
    upsells: string[]; // Product IDs
  };
  settings: {
    checkoutStyle: 'integrated' | 'redirect';
    upsellDiscount: number; // Percentage discount for upsells
    mainProductDiscount: number; // Percentage discount for main product
    showProgress?: boolean; // Whether to show progress in funnel wrapper
    countdown?: {
      startDate: Date;
      endDate: Date;
      redirectUrl?: string; // URL to redirect to when expired
    };
  };
  content: {
    testimonials: {
      author: string;
      text: string;
      image?: string;
      rating: number;
    }[];
    faq: {
      question: string;
      answer: string;
    }[];
    problemSolution?: {
      problems: {
        title: string;
        description: string;
      }[];
      solution: {
        title: string;
        description: string;
      };
    };
    benefits?: {
      title: string;
      description: string;
    }[];
  };
  analytics: {
    conversionRate: number;
    totalSales: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FunnelProgress {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, string>;
  selectedProducts: string[];
}
