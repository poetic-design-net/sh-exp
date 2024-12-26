import { ReactNode } from "react";
import { Toaster } from "components/ui/toaster";

export default function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <main className="flex-grow">
        {children}
      </main>
      <Toaster />
    </>
  );
}
