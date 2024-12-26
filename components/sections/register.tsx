import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import TestimonialSliderWrapper from './testimonial-slider-wrapper';
import Link from 'next/link';

interface RegisterProps {
  id?: string;
  event: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  testimonials: {
    title: string;
    items: {
      name: string;
      quote: string;
      image: string;
    }[];
  };
  waitingList: {
    title: string;
    description: string;
    buttonText: string;
    checkboxes: {
      id: string;
      label: string;
    }[];
    activeCampaign?: {
      listId: string;
    };
  };
}

const Register: React.FC<RegisterProps> = ({
  id = "events",
  event,
  testimonials,
  waitingList,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    checkboxes: {} as Record<string, boolean>,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        checkboxes: {
          ...prev.checkboxes,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    setError(null);
    setSuccess(false);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.email || !formData.firstName || !formData.lastName) {
        throw new Error('Bitte füllen Sie alle Pflichtfelder aus');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      }

      const response = await fetch('/api/active-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          listId: waitingList.activeCampaign?.listId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ein Fehler ist aufgetreten');
      }

      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', checkboxes: {} });
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id={id} className="w-full bg-cyan-300">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 py-24 flex flex-col justify-start items-center gap-12 xl:gap-20">
        {/* Event Section */}
        <div className="w-full flex flex-col justify-start items-start gap-12">
          <div className="w-full flex flex-col justify-start items-center gap-5">
            <h2 className="w-full text-cyan-950 text-3xl xl:text-4xl font-bold capitalize leading-10">
              {event.title}
            </h2>
            <div 
              className="w-full text-cyan-950 text-base xl:text-2xl leading-tight xl:leading-relaxed [&>p]:mb-8 [&>p:last-child]:mb-0 [&>p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
          <Link 
            href={event.buttonLink} 
            className="px-4 py-2 rounded-3xl border border-cyan-950 hover:bg-cyan-950/10 transition-colors"
          >
            <span className="text-cyan-950 text-xl font-bold leading-normal">
              {event.buttonText}
            </span>
          </Link>
        </div>

        {/* Horizontal Line */}
        <div id="testimonials" className="w-full h-px bg-cyan-950" />

        {/* Testimonials Section */}
        <TestimonialSliderWrapper 
          title={testimonials.title}
          items={testimonials.items}
        />

        {/* Horizontal Line */}
        <div id="register" className="w-full h-px bg-cyan-950" />

        {/* Waiting List Form */}
        <div className="w-full flex flex-col justify-start items-start gap-12">
          <div className="w-full flex flex-col justify-start items-start gap-5">
            <h2 className="text-cyan-950 text-3xl xl:text-4xl font-bold leading-10">
              {waitingList.title}
            </h2>
            <div 
              className="text-cyan-950 text-base xl:text-2xl leading-tight xl:leading-relaxed max-w-96 [&>p]:mb-8 [&>p:last-child]:mb-0 [&>p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: waitingList.description }}
            />
          </div>

          {/* Form Fields */}
          <div className="w-full flex flex-col xl:flex-row justify-start items-start gap-6">
            <div className="w-full xl:w-[20%] flex flex-col xl:flex-row gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Vorname"
                className={`w-full px-6 py-5 rounded-3xl border ${
                  error && !formData.firstName ? 'border-red-500' : 'border-cyan-950'
                } bg-transparent text-xl placeholder:text-cyan-950/30`}
                disabled={isSubmitting}
              />
            </div>
            <div className="w-full xl:w-[20%] flex flex-col xl:flex-row gap-4">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Nachname"
                className={`w-full px-6 py-5 rounded-3xl border ${
                  error && !formData.lastName ? 'border-red-500' : 'border-cyan-950'
                } bg-transparent text-xl placeholder:text-cyan-950/30`}
                disabled={isSubmitting}
              />
            </div>
            <div className="w-full xl:w-[30%] flex flex-col xl:flex-row gap-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-Mail Adresse"
                className={`w-full px-6 py-5 rounded-3xl border ${
                  error && !validateEmail(formData.email) ? 'border-red-500' : 'border-cyan-950'
                } bg-transparent text-xl placeholder:text-cyan-950/30`}
                disabled={isSubmitting}
              />
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full xl:w-auto p-1 bg-cyan-950 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <div className="p-4 bg-cyan-300 rounded-full">
                <ArrowUpRight className="w-6 h-6 text-cyan-950" />
              </div>
              <span className="flex-1 text-center px-6 py-4 text-white text-xl font-bold leading-normal" style={{ paddingRight: isMobile ? 'calc(2rem + 32px)' : '1.5rem' }}>
                {isSubmitting ? 'Wird gesendet...' : waitingList.buttonText}
              </span>
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="w-auto text-red-600 text-sm bg-red-100 px-4 py-2 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="w-auto text-green-600 text-sm bg-green-100 px-4 py-2 rounded-md">
              Vielen Dank für Deine Anmeldung! Du erhälst in Kürze eine Bestätigung per E-Mail.
            </div>
          )}

          {/* Checkboxes */}
          <div className="w-full flex flex-col gap-4">
            {waitingList.checkboxes.map((checkbox) => (
              <label key={checkbox.id} className="flex items-start gap-4 cursor-pointer">
                <input 
                  type="checkbox"
                  name={checkbox.id}
                  checked={formData.checkboxes[checkbox.id] || false}
                  onChange={handleInputChange}
                  className="w-6 h-6" 
                  disabled={isSubmitting}
                />
                <span className="text-cyan-950 text-sm xl:text-base leading-normal">
                  {checkbox.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
