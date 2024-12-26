'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  // Log error für besseres Debugging
  console.error('Detaillierter Fehler:', error);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Ups! Da ist etwas schiefgelaufen
          </h2>
          <p className="text-sm text-red-600 mb-4">
            {error.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
          </p>
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            className="bg-white hover:bg-red-50"
          >
            Nochmal versuchen
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundaryProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        // Hier können wir Fehler an einen Logging-Service senden
        console.error('Fehler gefangen von ErrorBoundary:', error);
      }}
      onReset={() => {
        // Optional: Aktionen beim Zurücksetzen des Fehlers
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
