import React from "react";
import type { Comanda } from "@/types/dashboard";

/**
 * Zona: Gresite – momentan fără acțiuni specifice suplimentare (se pot adăuga ulterior)
 */
export interface GresiteZoneActionsProps {
  order: Comanda;
}

export const GresiteZoneActions: React.FC<GresiteZoneActionsProps> = () => {
  return null;
};

export const GresiteZone: React.FC = () => null;
export default GresiteZone;
