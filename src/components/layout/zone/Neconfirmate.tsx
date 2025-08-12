import React from "react";
import type { Comanda } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { CalendarClock, ImageOff, X, Check } from "lucide-react";

/**
 * Zona: Neconfirmate
 */
export interface NeconfirmateZoneActionsProps {
  order: Comanda;
  movingCommandId: number | null;
  motivesActiveCount?: number; // pentru regula specială de anulare
  onPrecomanda: (id: number) => void;
  onLipsaPoze: (id: number) => void;
  onAnulare: (id: number) => void;
  onConfirmareOpen: (order: Comanda) => void;
}

export const NeconfirmateZoneActions: React.FC<NeconfirmateZoneActionsProps> = ({ order, movingCommandId, motivesActiveCount = 0, onPrecomanda, onLipsaPoze, onAnulare, onConfirmareOpen }) => {
  const busy = movingCommandId === order.ID;
  const allowAnulare = motivesActiveCount >= 3;
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onPrecomanda(order.ID)} title="Precomanda" aria-label="Precomanda" disabled={busy}>
        {busy ? <span>Se procesează...</span> : (<><span>Precomanda</span><CalendarClock className="w-4 h-4 ml-1" /></>)}
      </Button>
      <Button variant="outline" size="sm" onClick={() => onLipsaPoze(order.ID)} title="Lipsa poza" aria-label="Lipsa poza" disabled={busy}>
        {busy ? <span>Se mută...</span> : (<><span>Lipsa poza</span><ImageOff className="w-4 h-4 ml-1" /></>)}
      </Button>
      {allowAnulare && (
        <Button variant="destructive" size="sm" onClick={() => onAnulare(order.ID)} title="Anulează" aria-label="Anulează" disabled={busy}>
          {busy ? <span>Se anulează...</span> : <X className="w-4 h-4" />}
        </Button>
      )}
      <Button variant="default" size="sm" onClick={() => onConfirmareOpen(order)} title="Confirmare" aria-label="Confirmare">
        <Check className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const NeconfirmateZone: React.FC = () => null;
export default NeconfirmateZone;
