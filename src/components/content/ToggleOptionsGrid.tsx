// src/components/content/ToggleOptionsGrid.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Send, FileText, AlertTriangle, Package, Layers } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

interface ToggleOptionsGridProps {
  confirmOrder: Comanda | null;
}

const ToggleOptionsGrid: React.FC<ToggleOptionsGridProps> = ({ confirmOrder }) => {
  // Helper function to check if a value is truthy (1, '1', true, etc.)
  const isTruthy = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    return value === 1 || value === '1' || value === true || String(value || '').trim() === '1';
  };

  // Format date for the date input field (expects YYYY-MM-DD)
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return "";

    try {
      // Try to parse the date
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) return "";

      // Format the date as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  // Dummy handler for onCheckedChange - in a real app, this would update the API
  const handleCheckedChange = (checked: boolean) => {
    console.log('Switch toggled:', checked);
    // In a real implementation, this would update the API
  };

  return (
    <div className="space-y-3">

      <div className="space-y-1">
        <Label htmlFor="shippingDate">Data expedierii</Label>
        <input
            id="shippingDate"
            type="date"
            className="w-full p-2 border border-border rounded-md"
            defaultValue={formatDateForInput(confirmOrder?.expediere)}
        />
      </div>
      {/* Gift order options section */}
      <div className="border border-border rounded-md p-3">
        <div className="mb-2 relative pl-8">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <MessageSquare size={18} />
          </div>
          <h3 className="text-sm font-medium">Opțiuni pentru comenzi cadou</h3>
          {/*<p className="text-xs text-muted-foreground">Aceste opțiuni limitează acțiunile sistemului pentru comenzile cadou</p>*/}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 grid grid-cols-3">
          <div className="flex items-center gap-2">
            <Switch 
              id="noSmsGraphics" 
              checked={isTruthy((confirmOrder as any)?.fara_sms_facturare)}
              onCheckedChange={handleCheckedChange}
            />
            <Label htmlFor="noSmsGraphics" className="text-sm">Fără SMS grafică</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="noSmsAwb" 
              checked={isTruthy((confirmOrder as any)?.fara_sms_livrare)}
              onCheckedChange={handleCheckedChange}
            />
            <Label htmlFor="noSmsAwb" className="text-sm">Fără SMS AWB</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="noInvoice" 
              checked={isTruthy(confirmOrder?.fara_factura_in_colet)}
              onCheckedChange={handleCheckedChange}
            />
            <Label htmlFor="noInvoice" className="text-sm">Fără factură</Label>
          </div>
        </div>
      </div>

      {/* Packaging and verification options section */}
      <div className="border border-border rounded-md p-3">
        <div className="mb-2 relative pl-8">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Package size={18} />
          </div>
          <h3 className="text-sm font-medium">Opțiuni pentru legătorie și împachetare</h3>
          {/*<p className="text-xs text-muted-foreground">Aceste opțiuni afectează procesul de pregătire a comenzii</p>*/}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 grid grid-cols-3">
          <div className="flex items-center gap-2">
            <Switch 
              id="awbManual" 
              checked={isTruthy((confirmOrder as any)?.awb_manual)}
              onCheckedChange={handleCheckedChange}
            />
            <Label htmlFor="awbManual" className="text-sm">AWB Manual</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="differentLichens" 
              checked={isTruthy((confirmOrder as any)?.licheni_diferiti)}
              onCheckedChange={handleCheckedChange}
            />
            <Label htmlFor="differentLichens" className="text-sm">Licheni diferiți</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="differentAnnexes" 
              checked={isTruthy((confirmOrder as any)?.anexe_diferite_comanda)}
              onCheckedChange={handleCheckedChange}
            />
            <Label htmlFor="differentAnnexes" className="text-sm">Anexe diferite</Label>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ToggleOptionsGrid;
