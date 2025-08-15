// src/components/content/ConfirmationSelects.tsx
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Comanda } from "@/types/dashboard";

interface ConfirmationSelectsProps {
  confirmOrder: Comanda | null;
}

const ConfirmationSelects: React.FC<ConfirmationSelectsProps> = ({ confirmOrder }) => {
  // State for shipping date
  const [shippingDate, setShippingDate] = useState<string>("");

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

  // Update shipping date when confirmOrder changes
  useEffect(() => {
    if (confirmOrder?.expediere) {
      setShippingDate(formatDateForInput(confirmOrder.expediere));
    } else {
      setShippingDate("");
    }
  }, [confirmOrder]);

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

      const encodedDate = encodeURIComponent(newDate);
      const response = await fetch(`https://crm.actium.ro/api/modificare-expediere/${confirmOrder.ID}/${encodedDate}`, {
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
    </div>
  );
};

export default ConfirmationSelects;
