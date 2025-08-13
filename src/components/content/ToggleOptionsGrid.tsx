// src/components/content/ToggleOptionsGrid.tsx
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Send, FileText, AlertTriangle, Package, Layers } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

interface ToggleOptionsGridProps {
  confirmOrder: Comanda | null;
}

const ToggleOptionsGrid: React.FC<ToggleOptionsGridProps> = ({ confirmOrder }) => {
  // State to track toggle values and shipping date
  const [toggleValues, setToggleValues] = useState({
    noSmsGraphics: false,
    noSmsAwb: false,
    noInvoice: false,
    awbManual: false,
    differentLichens: false,
    differentAnnexes: false
  });
  const [shippingDate, setShippingDate] = useState<string>("");

  // Update toggle values and shipping date when confirmOrder changes
  useEffect(() => {
    if (confirmOrder) {
      setToggleValues({
        noSmsGraphics: isTruthy((confirmOrder as any)?.fara_sms_facturare),
        noSmsAwb: isTruthy((confirmOrder as any)?.fara_sms_livrare),
        noInvoice: isTruthy(confirmOrder?.fara_factura_in_colet),
        awbManual: isTruthy((confirmOrder as any)?.awb_manual),
        differentLichens: isTruthy((confirmOrder as any)?.licheni_diferiti),
        differentAnnexes: isTruthy((confirmOrder as any)?.anexe_diferite_comanda)
      });

      // Set shipping date from order if available
      if (confirmOrder.expediere) {
        setShippingDate(formatDateForInput(confirmOrder.expediere));
      } else {
        setShippingDate("");
      }
    }
  }, [confirmOrder]);

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

  // Map toggle IDs to their corresponding API endpoints
  const getToggleEndpoint = (toggleId: string): string | null => {
    const endpoints: Record<string, string> = {
      'noSmsGraphics': 'toggleFaraSmsGrafica',
      'noSmsAwb': 'toggleAwb',
      'noInvoice': 'toggleFaraFactura',
      'awbManual': 'toggleAwbManual',
      'differentLichens': 'toggleLicheniDiferiti',
      'differentAnnexes': 'toggleAnexeDiferite'
    };

    return endpoints[toggleId] || null;
  };

  // Handler for onCheckedChange - calls the appropriate API endpoint and updates local state
  const handleCheckedChange = async (checked: boolean, toggleId: string) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    const endpoint = getToggleEndpoint(toggleId);
    if (!endpoint) {
      console.error(`No endpoint found for toggle ID: ${toggleId}`);
      return;
    }

    try {
      // Update local state immediately for responsive UI
      setToggleValues(prev => ({
        ...prev,
        [toggleId]: checked
      }));

      const response = await fetch(`https://crm.actium.ro/api/${endpoint}/${confirmOrder.ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log(`Toggle ${toggleId} updated successfully`);
    } catch (error) {
      console.error(`Error updating toggle ${toggleId}:`, error);
      // Revert the local state if API call fails
      setToggleValues(prev => ({
        ...prev,
        [toggleId]: !checked
      }));
    }
  };

  // Handler for shipping date change - calls the API endpoint and updates local state
  const handleShippingDateChange = async (event: React.FocusEvent<HTMLInputElement>) => {
    const newDate = event.target.value;

    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    try {
      // Update local state immediately for responsive UI
      setShippingDate(newDate);

      const response = await fetch(`https://crm.actium.ro/api/modificare-expediere/${confirmOrder.ID}/${newDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log(`Shipping date updated successfully to ${newDate}`);
    } catch (error) {
      console.error(`Error updating shipping date:`, error);
      // Revert the local state if API call fails
      if (confirmOrder?.expediere) {
        setShippingDate(formatDateForInput(confirmOrder.expediere));
      } else {
        setShippingDate("");
      }
    }
  };


  return (
    <div className="space-y-3">

      <div className="space-y-1">
        <Label htmlFor="shippingDate">Data expedierii</Label>
        <input
            id="shippingDate"
            type="date"
            className="w-full p-2 border border-border rounded-md"
            value={shippingDate}
            onBlur={handleShippingDateChange}
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
              checked={toggleValues.noSmsGraphics}
              onCheckedChange={(checked) => handleCheckedChange(checked, "noSmsGraphics")}
            />
            <Label htmlFor="noSmsGraphics" className="text-sm">Fără SMS grafică</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="noSmsAwb" 
              checked={toggleValues.noSmsAwb}
              onCheckedChange={(checked) => handleCheckedChange(checked, "noSmsAwb")}
            />
            <Label htmlFor="noSmsAwb" className="text-sm">Fără SMS AWB</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="noInvoice" 
              checked={toggleValues.noInvoice}
              onCheckedChange={(checked) => handleCheckedChange(checked, "noInvoice")}
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
              checked={toggleValues.awbManual}
              onCheckedChange={(checked) => handleCheckedChange(checked, "awbManual")}
            />
            <Label htmlFor="awbManual" className="text-sm">AWB Manual</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="differentLichens" 
              checked={toggleValues.differentLichens}
              onCheckedChange={(checked) => handleCheckedChange(checked, "differentLichens")}
            />
            <Label htmlFor="differentLichens" className="text-sm">Licheni diferiți</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              id="differentAnnexes" 
              checked={toggleValues.differentAnnexes}
              onCheckedChange={(checked) => handleCheckedChange(checked, "differentAnnexes")}
            />
            <Label htmlFor="differentAnnexes" className="text-sm">Anexe diferite</Label>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ToggleOptionsGrid;
