// src/components/content/ConfirmationSelects.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ConfirmationSelects: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="confirmationStatus">Confirmare</Label>
        <Select defaultValue="confirmed">
          <SelectTrigger id="confirmationStatus">
            <SelectValue placeholder="Selectează statusul confirmării" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmat</SelectItem>
            <SelectItem value="toCall">De sunat</SelectItem>
            <SelectItem value="noAnswer">Fără răspuns</SelectItem>
            <SelectItem value="refused">Refuz</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="difficulty">Dificultate</Label>
        <Select defaultValue="medium">
          <SelectTrigger id="difficulty">
            <SelectValue placeholder="Selectează nivelul de dificultate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Ușor</SelectItem>
            <SelectItem value="medium">Mediu</SelectItem>
            <SelectItem value="hard">Greu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="shippingDate">Data expedierii</Label>
        <input 
          id="shippingDate" 
          type="date" 
          className="w-full p-2 border border-border rounded-md" 
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="baseColor">Culoare bază</Label>
        <Select defaultValue="white">
          <SelectTrigger id="baseColor">
            <SelectValue placeholder="Selectează culoarea de bază" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">Alb</SelectItem>
            <SelectItem value="black">Negru</SelectItem>
            <SelectItem value="wood">Lemn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="reason">Motiv</Label>
        <Select>
          <SelectTrigger id="reason">
            <SelectValue placeholder="Selectează motivul neconfirmării" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="noAnswer">Clientul nu răspunde</SelectItem>
            <SelectItem value="wrongNumber">Număr greșit</SelectItem>
            <SelectItem value="other">Alt motiv</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ConfirmationSelects;
