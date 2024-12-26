"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto text-center space-y-6">
        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges were made.</p>
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push("/")}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
