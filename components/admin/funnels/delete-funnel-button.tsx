"use client";

import { deleteFunnel } from "@/app/actions/funnels";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteFunnelButtonProps {
  funnelId: string;
  funnelName: string;
}

export function DeleteFunnelButton({ funnelId, funnelName }: DeleteFunnelButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteFunnel(funnelId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting funnel:", error);
      alert("Fehler beim Löschen des Funnels");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-800"
        disabled={isDeleting}
      >
        Löschen
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Funnel löschen bestätigen
            </h3>
            <p className="text-gray-600 mb-6">
              Sind Sie sicher, dass Sie den Funnel &quot;{funnelName}&quot; löschen möchten? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Wird gelöscht..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
