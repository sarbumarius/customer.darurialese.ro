import React from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

export interface BacklinesZoneActionsProps {
  order: Comanda;
  phone?: string | null;
  onAddMention: (order: Comanda) => void;
}

/**
 * Actions for the Backlines zone.
 * Extracted from Content.tsx to keep zone-specific actions isolated.
 */
export const BacklinesZoneActions: React.FC<BacklinesZoneActionsProps> = ({ order, phone, onAddMention }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => phone && (window.location.href = `tel:${phone}`)}
        title="Contactează client"
        aria-label="Contactează client"
      >Suna
        <PhoneCall className="w-4 h-4" />
      </Button>
      {/*<Button*/}
      {/*  variant="outline"*/}
      {/*  size="sm"*/}
      {/*  onClick={() => onAddMention(order)}*/}
      {/*  title="Adaugă mențiune"*/}
      {/*  aria-label="Adaugă mențiune"*/}
      {/*>*/}
      {/*  <MessageSquare className="w-4 h-4" />*/}
      {/*</Button>*/}
    </div>
  );
};

export default BacklinesZoneActions;
