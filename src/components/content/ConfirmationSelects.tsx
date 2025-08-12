// src/components/content/ConfirmationSelects.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ConfirmationSelects: React.FC = () => {
  return (
    <div className="space-y-3">



      <div className="space-y-1">
        <Label htmlFor="shippingDate">Data expedierii</Label>
        <input 
          id="shippingDate" 
          type="date" 
          className="w-full p-2 border border-border rounded-md" 
        />
      </div>



    </div>
  );
};

export default ConfirmationSelects;
