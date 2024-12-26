"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentMethod } from "@/services/payment-processors/types";
import { createCheckoutSession } from "@/services/checkout-client";
import { toast } from "@/components/ui/use-toast";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatPrice } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const registrationSchema = z.object({
  firstName: z.string().min(1, "Bitte gebe deinen Vornamen ein"),
  lastName: z.string().min(1, "Bitte gebe deinen Nachnamen ein"),
  email: z.string().email("Bitte gebe eine gültige E-Mail-Adresse ein"),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
  newsletter: z.boolean().optional(),
});

interface CheckoutFormProps {
  productId?: string;
}

export function CheckoutForm({ productId }: CheckoutFormProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { cart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("stripe");

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      newsletter: false,
    },
  });

  const handleRegistration = async (data: z.infer<typeof registrationSchema>) => {
    try {
      setIsLoading(true);
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      toast({
        title: "Account erstellt",
        description: "Dein Account wurde erfolgreich erstellt. Du kannst nun mit der Bestellung fortfahren."
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast({
          variant: "destructive",
          title: "E-Mail bereits registriert",
          description: "Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Fehler bei der Registrierung",
          description: "Bitte versuche es später erneut."
        });
      }
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!productId && cart.items.length === 0) {
        toast({
          variant: "destructive",
          title: "Warenkorb ist leer",
          description: "Bitte füge Produkte zum Warenkorb hinzu."
        });
        return;
      }

      setIsLoading(true);

      if (!user?.uid) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Bitte erstelle zuerst einen Account."
        });
        return;
      }

      const session = await createCheckoutSession({
        productId: productId || cart.items[0]?.productId,
        paymentMethod: selectedPaymentMethod,
        userId: user.uid
      });

      if (!session?.checkoutUrl) {
        throw new Error("Keine Checkout-URL erhalten");
      }

      window.location.href = session.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Checkout fehlgeschlagen",
        description: error instanceof Error ? error.message : "Bitte versuche es später erneut."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Registration Form for non-authenticated users */}
      {!user && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h2 className="font-semibold">Account erstellen</h2>
          <p className="text-sm text-gray-600">
            Bitte erstelle einen Account, um mit der Bestellung fortzufahren.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegistration)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Newsletter abonnieren</FormLabel>
                      <FormDescription>
                        Erhalte Updates zu neuen Produkten und Angeboten
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Wird erstellt..." : "Account erstellen"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Order Summary */}
      {cart.items.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h2 className="font-semibold">Bestellübersicht</h2>
          <div className="divide-y">
            {cart.items.map((item) => (
              <div key={item.productId} className="py-4 flex justify-between">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">Menge: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-between font-bold">
            <span>Gesamtsumme</span>
            <span>{formatPrice(cart.total || 0)}</span>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h2 className="font-semibold">Zahlungsmethode</h2>
        <div className="grid gap-4">
          <div
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedPaymentMethod === "stripe"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPaymentMethod("stripe")}
          >
            <div className="font-medium">Kreditkarte</div>
            <div className="text-sm text-gray-500">Bezahle sicher mit deiner Kreditkarte</div>
          </div>
          
          <div
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedPaymentMethod === "sepa_debit"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPaymentMethod("sepa_debit")}
          >
            <div className="font-medium">SEPA-Lastschrift</div>
            <div className="text-sm text-gray-500">Bezahle sicher mit SEPA-Lastschrift</div>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedPaymentMethod === "paypal"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPaymentMethod("paypal")}
          >
            <div className="font-medium">PayPal</div>
            <div className="text-sm text-gray-500">Bezahle einfach und sicher mit PayPal</div>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedPaymentMethod === "monero"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPaymentMethod("monero")}
          >
            <div className="font-medium">Monero (XMR)</div>
            <div className="text-sm text-gray-500">Bezahle anonym mit Monero</div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={isLoading || isAuthLoading || (!productId && cart.items.length === 0) || !user}
        className="w-full"
      >
        {isLoading || isAuthLoading ? "Wird bearbeitet..." : "Jetzt bezahlen"}
      </Button>
    </div>
  );
}
