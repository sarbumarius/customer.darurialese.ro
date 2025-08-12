import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface InventoryItem {
  id: number;
  name?: string;
  title?: string;
  cantitate?: number;
  stoc?: number;
  [key: string]: any;
}

export interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  newStockValues: Record<number, number>;
  setNewStockValues: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  inventoryData: InventoryItem[];
  inventorySearchTerm: string;
  setInventorySearchTerm: (val: string) => void;
}

export const InventoryDialog: React.FC<InventoryDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  isEditMode,
  setIsEditMode,
  onSave,
  isSaving,
  newStockValues,
  setNewStockValues,
  inventoryData,
  inventorySearchTerm,
  setInventorySearchTerm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl fixed  left-1/2 transform  rounded-t-xl rounded-b-none max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Stocuri Sistem Gravare</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex-grow overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {!isEditMode ? (
                    <Button 
                      onClick={() => setIsEditMode(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Adauga stocuri curente
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={onSave}
                        className="bg-green-500 hover:bg-green-600"
                        disabled={isSaving || Object.keys(newStockValues).length === 0}
                      >
                        {isSaving ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Se salvează...
                          </div>
                        ) : (
                          "Salveaza stocul curent"
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditMode(false);
                          setNewStockValues({});
                        }}
                        disabled={isSaving}
                      >
                        Anulează
                      </Button>
                      <div className="text-xs text-gray-400 ml-2">
                        {Object.keys(newStockValues).length} produse modificate
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cauta produs..."
                      value={inventorySearchTerm}
                      onChange={(e) => setInventorySearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-md w-64"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.1-3.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Inchide</Button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh] pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {inventoryData
                    .filter((item) => {
                      if (!inventorySearchTerm) return true;
                      const searchTermLower = inventorySearchTerm.toLowerCase();
                      const name = (item.name || item.title || '').toLowerCase();
                      return name.includes(searchTermLower);
                    })
                    .map((item) => {
                      const currentValue = newStockValues[item.id] ?? item.stoc ?? 0;
                      return (
                        <Card key={item.id} className="p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate" title={item.name || item.title || ''}>
                              {item.name || item.title || '-'}
                            </div>
                            <div className="text-sm text-muted-foreground">ID: {item.id}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">Stoc:</div>
                            {isEditMode ? (
                              <input
                                type="number"
                                className="w-24 p-2 border rounded"
                                value={currentValue}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setNewStockValues((prev) => ({ ...prev, [item.id]: val }));
                                }}
                              />
                            ) : (
                              <div className="font-semibold">{currentValue}</div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDialog;
