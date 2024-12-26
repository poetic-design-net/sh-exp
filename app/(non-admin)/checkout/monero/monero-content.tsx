"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export function MoneroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const amount = searchParams?.get("amount") || "0";
  const address = searchParams?.get("address") || "";
  const paymentId = searchParams?.get("paymentId") || "";
  const productName = searchParams?.get("productName") || "";
  const eurAmount = searchParams?.get("eurAmount") || "0";

  const moneroUri = `monero:${address}?tx_amount=${amount}&tx_payment_id=${paymentId}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      const response = await fetch(`/api/checkout?sessionId=${paymentId}&paymentMethod=monero`);
      const verification = await response.json();

      if (verification.success) {
        router.push(`/checkout/success?session_id=${paymentId}&payment_method=monero`);
      } else {
        alert("Payment not yet received. Please try again after sending the payment.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Error verifying payment. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Monero Payment</h1>
          <p className="text-gray-600">
            {productName} - {parseFloat(eurAmount).toFixed(2)} EUR
            ({parseFloat(amount).toFixed(12)} XMR)
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Monero Address</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={address}
                readOnly
                className="flex-1 p-2 border rounded bg-white"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(address)}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Amount (XMR)</label>
            <input
              type="text"
              value={amount}
              readOnly
              className="w-full p-2 border rounded bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Payment ID</label>
            <input
              type="text"
              value={paymentId}
              readOnly
              className="w-full p-2 border rounded bg-white"
            />
          </div>

          <div className="flex justify-center">
            <QRCodeSVG value={moneroUri} size={200} />
          </div>

          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => window.open(`monero://${address}?tx_amount=${amount}&tx_payment_id=${paymentId}`)}
            >
              Open in Monero Wallet
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleVerifyPayment}
            >
              I've Sent the Payment
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Please send exactly {amount} XMR to the address above.</p>
          <p>Include the payment ID to ensure your payment is properly tracked.</p>
        </div>
      </div>
    </div>
  );
}
