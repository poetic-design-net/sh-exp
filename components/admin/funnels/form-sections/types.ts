export interface FormValues {
  name: string;
  slug: string;
  products: {
    main: string;
    upsells: string[];
  };
  settings: {
    checkoutStyle: 'integrated' | 'redirect';
    upsellDiscount: number;
    mainProductDiscount: number;
    countdown?: {
      startDate: string;  // ISO string for form input
      endDate: string;    // ISO string for form input
      redirectUrl?: string;
    };
  };
  content?: {
    testimonials?: {
      author: string;
      text: string;
      image?: string;
      rating: number;
    }[];
    faq?: {
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
  isActive: boolean;
}

interface FunnelSettings {
  checkoutStyle: 'integrated' | 'redirect';
  upsellDiscount: number;
  mainProductDiscount: number;
  countdown?: {
    startDate: Date;
    endDate: Date;
    redirectUrl?: string;
  };
}

type FunnelDataType = Omit<FormValues, 'settings'> & {
  settings: FunnelSettings;
};

function isValidDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

function isDateObject(value: any): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}

// Helper function to convert form values to Funnel type
export function convertFormToFunnelData(data: FormValues): FunnelDataType {
  console.log('Converting form data:', JSON.stringify(data, null, 2));
  
  const { settings, ...rest } = data;
  const { countdown, ...restSettings } = settings;
  
  // Handle countdown settings
  let convertedSettings: FunnelSettings = {
    ...restSettings,
  };

  // Only add countdown if both dates are provided and valid
  if (countdown?.startDate && countdown.endDate) {
    console.log('Processing countdown dates:', {
      startDate: countdown.startDate,
      endDate: countdown.endDate
    });

    if (isValidDate(countdown.startDate) && isValidDate(countdown.endDate)) {
      const startDate = new Date(countdown.startDate);
      const endDate = new Date(countdown.endDate);

      console.log('Converted dates:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      convertedSettings.countdown = {
        startDate,
        endDate,
        redirectUrl: countdown.redirectUrl || "",
      };
    } else {
      console.warn('Invalid dates provided:', {
        startDate: countdown.startDate,
        endDate: countdown.endDate
      });
    }
  }

  const result = {
    ...rest,
    settings: convertedSettings,
  };

  console.log('Converted data:', JSON.stringify(result, null, 2));
  return result;
}

// Helper function to clean undefined values
export function cleanFormData<T extends Record<string, any>>(data: T): T {
  if (!data) return data;

  const result: Record<string, any> = {};
  
  for (const key in data) {
    const value = data[key];
    
    // Skip null/undefined values
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Special handling for Date objects
      if (isDateObject(value)) {
        if (!isNaN(value.getTime())) {
          result[key] = value;
        }
      } else {
        const cleaned = cleanFormData(value);
        // Only include non-empty objects
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      }
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
}
