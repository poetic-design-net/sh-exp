"use client";

import { Button } from "components/ui/button";
import { archiveCompletedOrders } from "app/actions/archive-orders";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function ArchiveOrdersButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleArchive = async () => {
    try {
      setIsLoading(true);
      const result = await archiveCompletedOrders();
      toast({
        title: "Erfolg",
        description: result.message
      });
    } catch (error) {
      console.error('Error archiving orders:', error);
      toast({
        title: "Fehler",
        description: 'Fehler beim Archivieren der Bestellungen',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleArchive} 
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? "Archiviere..." : "Abgeschlossene Bestellungen archivieren"}
    </Button>
  );
}
