"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface OnboardingStep {
  title: string;
  content: string;
  image: string;
  learnMoreLink: string;  // Made required since we check for it before rendering
  learnMoreText: string;  // Made required to match with learnMoreLink
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Willkommen bei Stefan Hiene",
    content: "Als erfahrener Coach und Unternehmer begleite ich Menschen auf ihrem Weg zur persönlichen und beruflichen Weiterentwicklung. Meine Mission ist es, dir dabei zu helfen, dein volles Potenzial zu entfalten.",
    image: "/static/images/Stefan-Hiene-Portrait-1.webp",
    learnMoreLink: "/about",
    learnMoreText: "Mehr über mich erfahren"
  },
  {
    title: "Meine Expertise",
    content: "Mit über 10 Jahren Erfahrung in Business Coaching und Persönlichkeitsentwicklung habe ich bereits hunderten von Menschen geholfen, ihre Ziele zu erreichen. Mein Ansatz verbindet bewährte Methoden mit innovativen Strategien.",
    image: "/static/images/Stefan-Hiene-Portrait-1.webp",
    learnMoreLink: "/expertise",
    learnMoreText: "Expertise entdecken"
  },
  {
    title: "Coaching & Kurse",
    content: "In meinen Coachings und Kursen arbeiten wir gezielt an deiner Entwicklung. Von Business-Strategien bis hin zu persönlichem Wachstum - ich biete dir die Tools und das Wissen, die du für deinen Erfolg brauchst.",
    image: "/static/images/Stefan-Hiene-Portrait-1.webp",
    learnMoreLink: "/courses",
    learnMoreText: "Kurse ansehen"
  },
  {
    title: "Community & Netzwerk",
    content: "Werde Teil einer engagierten Community von Gleichgesinnten. In meinem Netzwerk profitierst du nicht nur von meiner Expertise, sondern auch vom Austausch mit anderen motivierten Menschen.",
    image: "/static/images/Stefan-Hiene-Portrait-1.webp",
    learnMoreLink: "/community",
    learnMoreText: "Community beitreten"
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-4xl w-full p-4">
        <Card className="p-8">
          <div className="space-y-8">
            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full border ${
                    index === currentStep ? "bg-foreground" : "bg-background"
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">
                {currentStepData.title}
              </h2>
              
              {/* Image Container */}
              <div className="relative mx-auto" style={{ width: '100%', maxWidth: '600px', height: '400px' }}>
                <Image
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  quality={100}
                />
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {currentStepData.content}
              </p>

              {/* Learn More Button */}
              <div className="pt-4">
                <Link href={currentStepData.learnMoreLink}>
                  <Button variant="outline" size="lg">
                    {currentStepData.learnMoreText}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Zurück
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentStep === onboardingSteps.length - 1}
              >
                Weiter
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
