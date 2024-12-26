'use client';

import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ModalForgotPassword } from "@/components/auth/modal-forgot-password";
import { useRouter, usePathname } from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Bitte gebe eine gültige E-Mail-Adresse ein"),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
});

interface SignInFormProps {
  onShowSignUp: () => void;
}

export const SignInForm: FC<SignInFormProps> = ({ onShowSignUp }) => {
  const { auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isResetOpen, setIsResetOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async ({ email, password }: z.infer<typeof formSchema>) => {
    if (!auth) {
      toast({
        title: "Fehler",
        description: "Authentifizierung nicht verfügbar",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Always force a token refresh to ensure we have the latest claims
      const idToken = await userCredential.user.getIdToken(true);
      console.log(
        process.env.NODE_ENV === 'development' 
          ? '🔧 Development mode: Got fresh emulator token' 
          : '✅ Production mode: Got fresh token'
      );
      
      toast({
        title: "Erfolgreich!",
        description: "Du wurdest erfolgreich angemeldet.",
      });
      
      // If we're on the login page, redirect to /app
      if (pathname === '/login') {
        router.replace('/app');
      } else {
        // Otherwise refresh the current page to update auth state
        router.refresh();
      }
      
    } catch (error) {
      let errorMessage = 'Ein Fehler ist aufgetreten';
      
      if (error instanceof Error) {
        switch (true) {
          case error.message.includes('auth/wrong-password'):
            errorMessage = 'Falsches Passwort';
            break;
          case error.message.includes('auth/user-not-found'):
            errorMessage = 'Benutzer nicht gefunden';
            break;
          case error.message.includes('auth/invalid-email'):
            errorMessage = 'Ungültige E-Mail-Adresse';
            break;
          case error.message.includes('auth/too-many-requests'):
            errorMessage = 'Zu viele Anmeldeversuche. Bitte versuche es später erneut.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      toast({ 
        title: "Anmeldefehler", 
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail-Adresse</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="ihre@email.de" 
                    autoComplete="email"
                    {...field} 
                  />
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
                  <Input 
                    type="password" 
                    placeholder="Ihr Passwort" 
                    autoComplete="current-password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Wird angemeldet..." : "Anmelden"}
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm">
        Passwort vergessen?{" "}
        <Button variant="link" onClick={() => setIsResetOpen(true)}>
          Zurücksetzen
        </Button>
      </p>
      <p className="text-sm">
        Noch kein Mitglied?{" "}
        <Button variant="link" onClick={onShowSignUp}>
          Jetzt registrieren
        </Button>
      </p>
      <ModalForgotPassword isOpen={isResetOpen} setIsOpen={setIsResetOpen} />
    </>
  );
}
