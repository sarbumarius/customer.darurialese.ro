// src/components/content/ProductPersonalizationCard.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Produs } from "@/types/dashboard";

interface ProductPersonalizationCardProps {
  produs: Produs;
  idx: number;
}

const ProductPersonalizationCard: React.FC<ProductPersonalizationCardProps> = ({ produs, idx }) => {
  return (
    <div className="border border-border rounded-md p-3">
      <div className="flex items-start gap-3 mb-3">
        {produs.poza && (
          <img
            src={`https://darurialese.ro/wp-content/uploads/${produs.poza}`}
            alt={produs.nume}
            className="w-16 h-16 object-contain rounded"
          />
        )}
        <div>
          <div className="font-medium">{produs.nume}</div>
          <div className="text-xs text-muted-foreground">
            Cantitate: {produs.quantity}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor={`title-${idx}`}>Titlu</Label>
          <input 
            id={`title-${idx}`} 
            className="w-full p-2 border border-border rounded-md" 
            placeholder="Ex: Nuntă de argint"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`customText-${idx}`}>Text personalizare</Label>
          <Textarea 
            id={`customText-${idx}`} 
            className="w-full" 
            placeholder="Ex: Doresc același mesaj, fără modificări"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`coupleName-${idx}`}>Nume cuplu</Label>
          <input 
            id={`coupleName-${idx}`} 
            className="w-full p-2 border border-border rounded-md" 
            placeholder="Ex: Călin & Felicia"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`marriageYears-${idx}`}>Ani de căsătorie</Label>
          <input 
            id={`marriageYears-${idx}`} 
            type="number" 
            className="w-full p-2 border border-border rounded-md" 
            placeholder="Ex: 25"
          />
        </div>

        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Câmp personalizat
        </Button>
      </div>
    </div>
  );
};

export default ProductPersonalizationCard;
