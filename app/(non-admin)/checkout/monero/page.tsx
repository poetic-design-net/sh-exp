import { Suspense } from "react";
import { MoneroContent } from "./monero-content";

function LoadingFallback() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}

export default function MoneroCheckoutPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MoneroContent />
    </Suspense>
  );
}
