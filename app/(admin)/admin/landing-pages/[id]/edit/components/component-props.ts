// Component-specific prop types that match the expected shapes
export interface HeroComponentProps {
  titleBold: string;
  titleNormal: string;
  subtitle: string;
  topBannerText: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

export interface IntroComponentProps {
  title: string;
  stats: {
    value: string;
    description: string;
  };
  features: Array<{
    title: string;
    backTitle: string;
    backSubtitle: string;
    backDescription: string;
    bgImage?: string;
  }>;
  programOverview?: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
  };
}

export interface RegisterComponentProps {
  event: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  testimonials: {
    title: string;
    items: Array<{
      name: string;
      quote: string;
      image: string;
    }>;
  };
  waitingList: {
    title: string;
    description: string;
    buttonText: string;
    checkboxes: Array<{
      id: string;
      label: string;
    }>;
    activeCampaign?: {
      listId: string;
    };
  };
}

export interface FAQComponentProps {
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
}

export interface FooterComponentProps {
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

// Default values for new components
export const defaultHeroProps: HeroComponentProps = {
  titleBold: "",
  titleNormal: "",
  subtitle: "",
  topBannerText: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  backgroundImage: ""
};

export const defaultIntroProps: IntroComponentProps = {
  title: "",
  stats: {
    value: "",
    description: ""
  },
  features: [],
  programOverview: {
    title: "Program Overview",
    subtitle: "Exclusive Offers For You",
    description: "With the INTENSIVE TRAINING you get direct contact with Stefan Hiene and his radical truth and lived wisdom.",
    buttonText: "Check Event List"
  }
};

export const defaultRegisterProps: RegisterComponentProps = {
  event: {
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  },
  testimonials: {
    title: "",
    items: []
  },
  waitingList: {
    title: "",
    description: "",
    buttonText: "",
    checkboxes: [],
    activeCampaign: {
      listId: ""
    }
  }
};

export const defaultFAQProps: FAQComponentProps = {
  title: "FAQs",
  subtitle: "The commonly asked questions regarding our Intensive Training.",
  faqs: [
    {
      question: "What does intensive training involve?",
      answer: "The intensive training includes four live retreats with Stefan in Arco on the northern shore of Lake Garda."
    }
  ],
  ctaText: "See All FAQs",
  ctaLink: "/faqs",
  registerTitle: "Ready to Start Your Transformation?",
  registerCtaText: "Register Now",
  registerCtaLink: "/register"
};

export const defaultFooterProps: FooterComponentProps = {
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
};
