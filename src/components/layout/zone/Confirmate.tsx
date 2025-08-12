import React from "react";
import type { Comanda } from "@/types/dashboard";

/**
 * Zona: Confirmate – momentan fără acțiuni specifice (se pot adăuga ulterior)
 */
export interface ConfirmateZoneActionsProps {
  order: Comanda;
}

export const ConfirmateZoneActions: React.FC<ConfirmateZoneActionsProps> = () => null;

export const ConfirmateZone: React.FC = () => null;
export default ConfirmateZone;
