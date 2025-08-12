// src/components/content/ToggleOptionsGrid.tsx
import React from "react";
import { Label } from "@/components/ui/label";

const ToggleOptionsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center justify-between border border-border rounded-md p-2">
        <Label htmlFor="noSmsGraphics">Fără SMS grafică</Label>
        <div className="flex items-center h-4">
          <input type="checkbox" id="noSmsGraphics" className="toggle" />
        </div>
      </div>

      <div className="flex items-center justify-between border border-border rounded-md p-2">
        <Label htmlFor="noSmsAwb">Fără SMS AWB</Label>
        <div className="flex items-center h-4">
          <input type="checkbox" id="noSmsAwb" className="toggle" />
        </div>
      </div>

      <div className="flex items-center justify-between border border-border rounded-md p-2">
        <Label htmlFor="noInvoice">Fără factură</Label>
        <div className="flex items-center h-4">
          <input type="checkbox" id="noInvoice" className="toggle" />
        </div>
      </div>

      <div className="flex items-center justify-between border border-border rounded-md p-2">
        <Label htmlFor="manualAwb">AWB manual</Label>
        <div className="flex items-center h-4">
          <input type="checkbox" id="manualAwb" className="toggle" />
        </div>
      </div>

      <div className="flex items-center justify-between border border-border rounded-md p-2">
        <Label htmlFor="differentLichens">Licheni diferiți</Label>
        <div className="flex items-center h-4">
          <input type="checkbox" id="differentLichens" className="toggle" />
        </div>
      </div>

      <div className="flex items-center justify-between border border-border rounded-md p-2">
        <Label htmlFor="differentAnnexes">Anexe diferite</Label>
        <div className="flex items-center h-4">
          <input type="checkbox" id="differentAnnexes" className="toggle" />
        </div>
      </div>
    </div>
  );
};

export default ToggleOptionsGrid;
