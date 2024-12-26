"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPayment } from "@/services/checkout-client";
import { PaymentMethod } from "@/services/payment-processors/types";
import { useCart } from "@/contexts/cart-context";
import { toast } from "@/components/ui/use-toast";

interface VerificationError {
  message: string;
  details?: string;
}

export function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<VerificationError | null>(null);
  const verificationAttempted = useRef(false);
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  const retryCount = useRef(0);

  useEffect(() => {
    const sessionId = searchParams?.get("session_id");
    const userId = searchParams?.get("userId");
    const productId = searchParams?.get("productId");
    const paymentMethod = (searchParams?.get("payment_method") || "stripe") as PaymentMethod;

    console.log('Checkout success parameters:', {
      sessionId,
      userId,
      productId,
      paymentMethod
    });

    if (!sessionId || !userId) {
      setStatus("error");
      setError({
        message: !sessionId ? "Ungültige Checkout-Session" : "Benutzer-ID fehlt",
        details: !sessionId ? "Session ID fehlt in der URL" : "Keine Benutzer-ID in der URL gefunden"
      });
      return;
    }

    if (!productId) {
      console.warn('No product ID in URL, will try to get it from verification');
    }

    const verifyCheckout = async () => {
      if (verificationAttempted.current) {
        console.log('Verification already attempted, skipping...');
        return;
      }

      const attemptVerification = async (): Promise<boolean> => {
        try {
          return await verifyPayment(sessionId, paymentMethod, userId);
        } catch (error) {
          console.error("Payment verification attempt failed:", error);
          return false;
        }
      };

      const runVerification = async () => {
        try {
          verificationAttempted.current = true;
          let isSuccess = await attemptVerification();

          while (!isSuccess && retryCount.current < maxRetries) {
            console.log(`Retrying verification (attempt ${retryCount.current + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount.current)));
            retryCount.current++;
            isSuccess = await attemptVerification();
          }

          if (isSuccess) {
            clearCart();
            setStatus("success");
            toast({
              title: "Erfolg",
              description: "Ihre Zahlung wurde erfolgreich verarbeitet.",
              duration: 5000
            });

            setTimeout(() => {
              router.push("/app?tab=orders");
            }, 2000);
          } else {
            throw new Error("Zahlungsverifizierung fehlgeschlagen nach mehreren Versuchen");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
          setStatus("error");
          setError({
            message: "Fehler bei der Zahlungsverifizierung",
            details: errorMessage
          });
          toast({
            variant: "destructive",
            title: "Fehler",
            description: errorMessage,
            duration: 10000
          });
        }
      };

      runVerification();
    };

    verifyCheckout();

    return () => {
      verificationAttempted.current = false;
      retryCount.current = 0;
    };
  }, [searchParams]);

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto text-center space-y-8">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h1 className="text-2xl font-bold">Zahlung wird überprüft...</h1>
            <p>Bitte warten Sie, während wir Ihre Zahlung bestätigen.</p>
            {retryCount.current > 0 && (
              <p className="text-sm text-gray-600">
                Überprüfung läuft... Versuch {retryCount.current}/{maxRetries}
              </p>
            )}
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600">Zahlung erfolgreich!</h1>
            <p>Vielen Dank für Ihren Einkauf. Ihre Bestellung wurde erfolgreich aufgenommen.</p>
            <p className="text-sm text-gray-600">Sie werden in Kürze zu Ihren Bestellungen weitergeleitet...</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/app?tab=orders")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Zu meinen Bestellungen
              </button>
              <button
                onClick={() => router.push("/products")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Zurück zum Shop
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600">Zahlungsfehler</h1>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="font-semibold">{error?.message}</p>
              {error?.details && (
                <p className="mt-2 text-sm text-red-600">{error.details}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/checkout")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Zurück zum Checkout
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
