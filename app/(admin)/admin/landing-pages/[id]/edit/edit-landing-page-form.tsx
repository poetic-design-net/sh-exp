'use client';

import { FC, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateLandingPage } from "@/services/landing-pages";
import { BasicInfoTab } from "./components/basic-info-tab";
import { HeroTab } from "./components/hero-tab";
import { IntroTab } from "./components/intro-tab";
import { RegisterTab } from "./components/register-tab";
import { NavigationTab } from "./components/navigation-tab";
import { FAQTab } from "./components/faq-tab";
import { FooterTab } from "./components/footer-tab";
import type { LandingPage, NavigationItem, FooterFormData, FAQFormData } from "@/types/landing-page";
import type { RegisterComponentProps } from "./components/component-props";

// Define tab names here for easy customization
const TAB_NAMES = {
  basic: "Start",
  hero: "Hero",
  intro: "Intro ",
  register: "Registrierungs / Testimonials",
  faq: "FAQ ",
  footer: "Footer",
  navigation: "Navigation"
} as const;

type TabKey = keyof typeof TAB_NAMES;

interface EditLandingPageFormProps {
  initialData: LandingPage;
}

const defaultFAQData: FAQFormData = {
  title: "",
  subtitle: "",
  faqs: [],
  ctaText: "",
  ctaLink: "",
  registerTitle: "",
  registerCtaText: "",
  registerCtaLink: "",
  backgroundImage: ""
};

const defaultRegisterData: RegisterComponentProps = {
  event: {
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  },
  testimonials: {
    title: "",
    items: [],
  },
  waitingList: {
    title: "",
    description: "",
    buttonText: "",
    checkboxes: [],
  },
};

export const EditLandingPageForm: FC<EditLandingPageFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [landingPage, setLandingPage] = useState<LandingPage>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDirty) {
      return;
    }

    try {
      await updateLandingPage(landingPage.id, landingPage);
      toast({
        title: "Success",
        description: "Landing page updated successfully",
      });
      setIsDirty(false);
      router.push("/admin/landing-pages");
      router.refresh();
    } catch (error) {
      console.error("Error updating landing page:", error);
      toast({
        title: "Error",
        description: "Failed to update landing page",
        variant: "destructive",
      });
    }
  };

  const handleChange = useCallback((field: string, value: any) => {
    setIsDirty(true);
    
    // Handle component updates (hero, intro, register, faq)
    if (field.includes('.')) {
      const [componentType, ...rest] = field.split('.');
      const component = landingPage.components.find(c => c.type === componentType);
      
      if (component) {
        const newProps = { ...component.props };
        let current = newProps;
        
        // Navigate to the correct nested level
        for (let i = 0; i < rest.length - 1; i++) {
          const key = rest[i];
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }
        
        // Update the value at the final level
        const lastKey = rest[rest.length - 1];
        current[lastKey] = value;
        
        // Update the component in the components array
        const newComponents = landingPage.components.map(c => {
          if (c.type === componentType) {
            return { ...c, props: newProps };
          }
          return c;
        });
        
        setLandingPage(prevState => ({
          ...prevState,
          components: newComponents
        }));
      }
    } else if (field.startsWith('navigation.')) {
      setLandingPage(prevState => ({
        ...prevState,
        navigation: {
          ...prevState.navigation,
          [field.split('.')[1]]: value
        }
      }));
    } else {
      setLandingPage(prevState => ({
        ...prevState,
        [field]: value,
      }));
    }
  }, [landingPage]);

  const handleNavigationItemChange = (index: number, field: keyof NavigationItem, value: any) => {
    setIsDirty(true);
    const items = [...landingPage.navigation.desktopItems];
    items[index] = {
      ...items[index],
      [field]: value
    };

    setLandingPage(prevState => ({
      ...prevState,
      navigation: {
        ...prevState.navigation,
        desktopItems: items,
        mobileItems: items
      }
    }));
  };

  const addNavigationItem = () => {
    setIsDirty(true);
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'New Item',
      href: '#',
      order: landingPage.navigation.desktopItems.length,
      isExternal: false,
      target: '_self'
    };

    setLandingPage(prevState => ({
      ...prevState,
      navigation: {
        ...prevState.navigation,
        desktopItems: [...prevState.navigation.desktopItems, newItem],
        mobileItems: [...prevState.navigation.desktopItems, newItem]
      }
    }));
  };

  const removeNavigationItem = (index: number) => {
    setIsDirty(true);
    setLandingPage(prevState => {
      const items = [...prevState.navigation.desktopItems];
      items.splice(index, 1);
      return {
        ...prevState,
        navigation: {
          ...prevState.navigation,
          desktopItems: items,
          mobileItems: items
        }
      };
    });
  };

  const registerComponent = landingPage.components.find(c => c.type === 'register');
  const heroComponent = landingPage.components.find(c => c.type === 'hero');
  const introComponent = landingPage.components.find(c => c.type === 'intro');
  const faqComponent = landingPage.components.find(c => c.type === 'faq');
  const footerComponent = landingPage.components.find(c => c.type === 'footer');

  // Cast the FAQ component props to FAQFormData or use default
  const faqProps = faqComponent?.props as FAQFormData | undefined;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Edit Landing Page</h1>
        <Button variant="outline" onClick={() => router.push("/admin/landing-pages")}>
          Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="w-full justify-start">
            {(Object.keys(TAB_NAMES) as TabKey[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {TAB_NAMES[key]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab
              landingPage={landingPage}
              onFieldChange={handleChange}
            />
          </TabsContent>

          <TabsContent value="hero">
            <HeroTab
              heroProps={heroComponent?.props || {}}
              onFieldChange={handleChange}
            />
          </TabsContent>

          <TabsContent value="intro">
            <IntroTab
              introProps={introComponent?.props || {}}
              onFieldChange={handleChange}
            />
          </TabsContent>

          <TabsContent value="register">
            <RegisterTab
              registerProps={registerComponent?.props as RegisterComponentProps || defaultRegisterData}
              onFieldChange={handleChange}
            />
          </TabsContent>

          <TabsContent value="faq">
            <FAQTab
              initialData={faqProps || defaultFAQData}
              onSubmit={(data) => {
                setIsDirty(true);
                const newComponents = landingPage.components.map(c => {
                  if (c.type === 'faq') {
                    return { ...c, props: data };
                  }
                  return c;
                });
                setLandingPage(prevState => ({
                  ...prevState,
                  components: newComponents
                }));
              }}
            />
          </TabsContent>

          <TabsContent value="footer">
            <FooterTab
              initialData={footerComponent?.props as FooterFormData}
              onSubmit={(data: FooterFormData) => {
                setIsDirty(true);
                const newComponents = landingPage.components.map(c => {
                  if (c.type === 'footer') {
                    return { ...c, props: data };
                  }
                  return c;
                });
                setLandingPage(prevState => ({
                  ...prevState,
                  components: newComponents
                }));
              }}
            />
          </TabsContent>

          <TabsContent value="navigation">
            <NavigationTab
              navigation={landingPage.navigation}
              onNavigationItemChange={handleNavigationItemChange}
              onAddItem={addNavigationItem}
              onRemoveItem={removeNavigationItem}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button type="submit" disabled={!isDirty}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};
