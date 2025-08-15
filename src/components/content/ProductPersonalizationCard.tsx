// src/components/content/ProductPersonalizationCard.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Produs } from "@/types/dashboard";

// Interface for personalization item
interface PersonalizationItem {
  name: string;
  value: string;
  type: string;
  display?: string;
}

interface ProductPersonalizationCardProps {
  produs: Produs;
  idx: number;
  personalizationData?: PersonalizationItem[];
}

const ProductPersonalizationCard: React.FC<ProductPersonalizationCardProps> = ({ produs, idx, personalizationData = [] }) => {
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
        {/* Display personalization data if available */}
        {personalizationData && personalizationData.length > 0 ? (
          personalizationData.map((item, itemIndex) => (
            <div key={itemIndex} className="space-y-1">
              <Label htmlFor={`personalization-${idx}-${itemIndex}`}>{item.name}</Label>
              
              {item.type === 'textfield' && (
                <input 
                  id={`personalization-${idx}-${itemIndex}`} 
                  className="w-full p-2 border border-border rounded-md"
                  value={item.value}
                  readOnly
                />
              )}
              
              {item.type === 'textarea' && (
                <Textarea 
                  id={`personalization-${idx}-${itemIndex}`} 
                  className="w-full" 
                  value={item.value}
                  readOnly
                />
              )}
              
              {item.type === 'upload' && (
                <div className="mt-1">
                  {item.value ? (
                    <div className="flex items-center">
                      <a 
                        href={item.value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        <Image className="h-4 w-4 mr-1" />
                        {item.display || 'Vezi imaginea'}
                      </a>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Nicio imagine încărcată</div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          // Fallback to default form fields when no personalization data is available
          <>
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
          </>
        )}
        
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Câmp personalizat
        </Button>
      </div>
    </div>
  );
};

export default ProductPersonalizationCard;
