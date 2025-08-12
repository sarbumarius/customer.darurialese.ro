import React from "react";
import type { Comanda } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { CalendarClock, ImageOff, X, Check, Cog } from "lucide-react";

/**
 * Zona: In asteptare
 */
export interface InAsteptareZoneActionsProps {
  order: Comanda;
  movingCommandId: number | null;
  onPrecomanda: (id: number) => void;
  onLipsaPoze: (id: number) => void;
  onProcesare: (id: number) => void;
  onAnulare: (id: number) => void;
  onConfirmareOpen: (order: Comanda) => void;
}

export const InAsteptareZoneActions: React.FC<InAsteptareZoneActionsProps> = ({ order, movingCommandId, onPrecomanda, onLipsaPoze, onProcesare, onAnulare, onConfirmareOpen }) => {
  const busy = movingCommandId === order.ID;
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onPrecomanda(order.ID)} title="Precomanda" aria-label="Precomanda" disabled={busy}>
        {busy ? <span>Se procesează...</span> : (<><span>Precomanda</span><CalendarClock className="w-4 h-4 ml-1" /></>)}
      </Button>
      <Button variant="outline" size="sm" onClick={() => onLipsaPoze(order.ID)} title="Lipsa poza" aria-label="Lipsa poza" disabled={busy}>
        {busy ? <span>Se mută...</span> : (<><span>Lipsa poza</span><ImageOff className="w-4 h-4 ml-1" /></>)}
      </Button>
      <Button variant="outline" size="sm" onClick={() => onProcesare(order.ID)} title="Procesare" aria-label="Procesare" disabled={busy}>
        {busy ? <span>Se procesează...</span> : (<><span>Procesare</span><Cog className="w-4 h-4 ml-1" /></>)}
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onAnulare(order.ID)} title="Anulează" aria-label="Anulează" disabled={busy}>
        {busy ? <span>Se anulează...</span> : <X className="w-4 h-4" />}
      </Button>
      <Button variant="default" size="sm" onClick={() => onConfirmareOpen(order)} title="Confirmare" aria-label="Confirmare">
        <Check className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const InAsteptareZone: React.FC = () => null;
export default InAsteptareZone;
