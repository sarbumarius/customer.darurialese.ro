import React from "react";
import type { Comanda } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

/**
 * Zona: Lipsa poze – acțiuni specifice
 */
export interface LipsaPozeZoneActionsProps {
  order: Comanda;
  onFollowUpEmail: (order: Comanda) => void;
  onOpenWhatsApp: (order: Comanda) => void;
}

export const LipsaPozeZoneActions: React.FC<LipsaPozeZoneActionsProps> = ({ order, onFollowUpEmail, onOpenWhatsApp }) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onFollowUpEmail(order)} title="Trimite email Follow up" aria-label="Trimite email Follow up" className="inline-flex items-center gap-1">
        <Mail className="w-4 h-4" />
        <span>Follow up</span>
      </Button>
      <Button variant="secondary" size="sm" onClick={() => onOpenWhatsApp(order)} title="Deschide WhatsApp" aria-label="Deschide WhatsApp">
        WhatsApp
      </Button>
    </div>
  );
};

/**
 * Zona: Precomanda – acțiuni specifice
 */
export interface PrecomandaZoneActionsProps {
  order: Comanda;
  onMarkLipsaPoze: (order: Comanda) => void; // deschide modalul pentru notă WP „Lipsa poze”
  onProcesare: (id: number) => void;
  onAnulare: (id: number) => void;
  movingCommandId: number | null;
}

export const PrecomandaZoneActions: React.FC<PrecomandaZoneActionsProps> = ({ order, onMarkLipsaPoze, onProcesare, onAnulare, movingCommandId }) => {
  const busy = movingCommandId === order.ID;
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onMarkLipsaPoze(order)} title="Lipsa poze" aria-label="Lipsa poze">
        Lipsa poze
      </Button>
      <Button variant="outline" size="sm" onClick={() => onProcesare(order.ID)} title="Procesare" aria-label="Procesare" disabled={busy}>
        {busy ? <span>Se procesează...</span> : <span>Procesare</span>}
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onAnulare(order.ID)} title="Anulează" aria-label="Anulează" disabled={busy}>
        {busy ? <span>Se anulează...</span> : <span>Anulează</span>}
      </Button>
    </div>
  );
};

export const LipsaPozePrecomandaZone: React.FC = () => null;
export default LipsaPozePrecomandaZone;
