import React from "react";
import type { Comanda } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Layers, AlertTriangle, X, Send } from "lucide-react";

/**
 * Zona: Aprobare / Aprobare client
 */
export interface AprobareZoneActionsProps {
  order: Comanda;
  movingCommandId: number | null;
  onRetrimitereGrafica: (id: number) => void;
  onProductie: (id: number) => void;
  onGraficaGresita: (id: number) => void;
  onAnulare: (id: number) => void;
}

export const AprobareZoneActions: React.FC<AprobareZoneActionsProps> = ({ order, movingCommandId, onRetrimitereGrafica, onProductie, onGraficaGresita, onAnulare }) => {
  const busy = movingCommandId === order.ID;
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onRetrimitereGrafica(order.ID)} title="Retrimitere grafica" aria-label="Retrimitere grafica" disabled={busy}>
        {busy ? <span>Se retrimite...</span> : (<><span>Retrimitere grafica</span><Send className="w-4 h-4 ml-1" /></>)}
      </Button>
      <Button variant="outline" size="sm" onClick={() => onProductie(order.ID)} title="Productie" aria-label="Productie" disabled={busy}>
        {busy ? <span>Se procesează...</span> : (<><span>Productie</span><Layers className="w-4 h-4 ml-1" /></>)}
      </Button>
      <Button variant="outline" size="sm" onClick={() => onGraficaGresita(order.ID)} title="Grafica gresita" aria-label="Grafica gresita" disabled={busy}>
        {busy ? <span>Se mută...</span> : (<><span>Grafica gresita</span><AlertTriangle className="w-4 h-4 ml-1" /></>)}
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onAnulare(order.ID)} title="Anulează" aria-label="Anulează" disabled={busy}>
        {busy ? <span>Se anulează...</span> : <X className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export const AprobareZone: React.FC = () => null;
export default AprobareZone;
