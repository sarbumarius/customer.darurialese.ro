import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Comanda } from "@/types/dashboard";

export interface ProblemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOrder: Comanda | null;
  problemZone: string;
  setProblemZone: (v: string) => void;
  problemProduct: string;
  setProblemProduct: (v: string) => void;
  problemDescription: string;
  setProblemDescription: (v: string) => void;
  onSubmit: () => void;
}

export const ProblemDialog: React.FC<ProblemDialogProps> = ({
  open,
  onOpenChange,
  currentOrder,
  problemZone,
  setProblemZone,
  problemProduct,
  setProblemProduct,
  problemDescription,
  setProblemDescription,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Problema comanda</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zone">Zona</Label>
            <Select 
              value={problemZone} 
              onValueChange={setProblemZone}
            >
              <SelectTrigger id="zone">
                <SelectValue placeholder="Selectează zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grafica">Grafica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Produs cu probleme</Label>
            <Select 
              value={problemProduct} 
              onValueChange={setProblemProduct}
              disabled={!currentOrder}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Selectează produsul" />
              </SelectTrigger>
              <SelectContent>
                {currentOrder?.produse_finale.map((produs, idx) => (
                  <SelectItem key={idx} value={produs.id_produs}>
                    {produs.nume}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departament</Label>
            <Select disabled>
              <SelectTrigger id="department">
                <SelectValue placeholder="Gravare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gravare">Gravare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere problemă</Label>
            <Textarea
              id="description"
              placeholder="Detaliază problema..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Anulează
          </Button>
          <Button onClick={onSubmit}>
            Trimite task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProblemDialog;
