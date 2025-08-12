import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export interface StudiuItem {
  id: number;
  titlu_custom?: string;
  tip_produs?: string;
  poza_prezentare?: string;
  grafica_produs_print?: any[];
  grafica_produs_gravare?: any;
  am_debitat?: boolean | number | string | null;
  am_printat?: boolean | number | string | null;
  am_gravat?: boolean | number | string | null;
}

export interface StudiuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  items: StudiuItem[];
  markLoading: Record<number, boolean>;
  onMarkPrintat: (id: number) => void;
  onMarkGravat: (id: number) => void;
  onMarkDebitat: (id: number) => void;
}

export const StudiuDialog: React.FC<StudiuDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  items,
  markLoading,
  onMarkPrintat,
  onMarkGravat,
  onMarkDebitat,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed right-0 top-0 left-auto h-screen max-h-screen translate-x-0 translate-y-0 rounded-none w-full sm:w-[520px] md:w-[320px] overflow-hidden p-0">
        {/* Header */}
        <div className="border-b border-border px-4 py-3 bg-card">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Studiu produse</div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} aria-label="Închide">
              
            </Button>
          </div>
        </div>
        <div className="h-[calc(100vh-52px)] overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground px-2">Nu există elemente de afișat.</div>
              ) : (
                items.map((item, idx) => {
                  const anexes = [
                    { key: 'anexa_wenge', label: 'Wenge' },
                    { key: 'anexa_alb', label: 'Alb' },
                    { key: 'anexa_natur', label: 'Natur' },
                    { key: 'anexa_plexi', label: 'Plexi' },
                    { key: 'anexa_print', label: 'Print' },
                    { key: 'anexa_gold', label: 'Gold' },
                    { key: 'anexa_argintiu', label: 'Argintiu' },
                    { key: 'anexa_plexi_gold', label: 'Plexi Gold' },
                    { key: 'anexa_plexi_negru', label: 'Plexi Negru' },
                    { key: 'anexa_plexi_alb', label: 'Plexi Alb' },
                    { key: 'anexa_plexi_alb_satin', label: 'Plexi Alb Satin' },
                  ] as const;
                  const imageUrl = item?.poza_prezentare ? `https://crm.actium.ro/uploads/researchdevelopment/${item.poza_prezentare}` : '';
                  return (
                    <Card key={idx} className="p-4">
                      <div className="flex flex-col gap-2">
                        <span>{item?.titlu_custom || 'Fără titlu'}</span>

                        {(() => {
                          if (item?.tip_produs) {
                            const s = String(item.tip_produs).replace(/-/g, ' ');
                            return <div className="text-xs text-muted-foreground truncate mb-2 ">{s.charAt(0).toUpperCase() + s.slice(1)}</div>;
                          }
                          return <div className="text-xs text-muted-foreground truncate ">-</div>;
                        })()}
                        <div className="w-full h-52 bg-muted/30 rounded overflow-hidden flex items-center justify-center">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item?.titlu_custom || 'poza prezentare'} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs text-muted-foreground">Fără imagine</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="">
                              <div className="truncate">
                                <div className="text-sm font-semibold truncate gap-2">

                                  <div className="flex items-center gap-1">
                                    {item?.am_debitat == 1 && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted/40" title="Debitat">
                                        {(item?.am_debitat === true || item?.am_debitat === 1 || item?.am_debitat === '1') ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <X className="w-3 h-3" />
                                        )}
                                          <span>Debitat</span>
                                      </span>
                                    )}

                                    {/* Printat: show button when null AND print files exist, icon otherwise */}
                                    {item?.am_printat == null && item?.grafica_produs_print && Array.isArray(item.grafica_produs_print) && item.grafica_produs_print.length > 0 ? (
                                      <Button
                                        size="xs"
                                        className="h-6 px-2 bg-green-600 hover:bg-green-700 text-white w-full"
                                        onClick={() => onMarkPrintat(item.id)}
                                        disabled={!!markLoading[item.id]}
                                        title="Marchează ca printat"
                                      >
                                        {markLoading[item.id] ? '...' : 'Am printat'}
                                      </Button>
                                    ) : item?.am_printat != null ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted/40" title="Printat">
                                        {(item?.am_printat === true || item?.am_printat === 1 || item?.am_printat === '1') ? (
                                          <Check className="w-3 h-3" />
                                        ) : (
                                          <X className="w-3 h-3" />
                                        )}
                                        <span>Printat</span>
                                      </span>
                                    ) : null}

                                    {/* Gravat: show button when null AND gravare file exists, icon otherwise */}
                                    {item?.am_gravat == null && item?.grafica_produs_gravare ? (
                                      <Button
                                        size="xs"
                                        className="h-6 px-2 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => onMarkGravat(item.id)}
                                        disabled={!!markLoading[item.id]}
                                        title="Marchează ca gravat"
                                      >
                                        {markLoading[item.id] ? '...' : 'Am gravat'}
                                      </Button>
                                    ) : item?.am_gravat != null ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted/40" title="Gravat">
                                        {(item?.am_gravat === true || item?.am_gravat === 1 || item?.am_gravat === '1') ? (
                                          <Check className="w-3 h-3" />
                                        ) : (
                                          <X className="w-3 h-3" />
                                        )}
                                        <span>Gravat</span>
                                      </span>
                                    ) : null}


                                  </div>

                                  {/* Produs Fizic: show button only when all three conditions are met */}
                                  {((item?.am_gravat === true || item?.am_gravat === 1 || item?.am_gravat === '1') ||
                                          (item?.am_gravat === null && !item?.grafica_produs_gravare)) &&
                                      (item?.am_printat === true || item?.am_printat === 1 || item?.am_printat === '1') &&
                                      (item?.am_debitat === true || item?.am_debitat === 1 || item?.am_debitat === '1') && (
                                          <Button
                                              size="xs"
                                              className="h-6 px-2  bg-blue-600 hover:bg-blue-700 text-white w-full mt-2"
                                              onClick={() => onMarkDebitat(item.id)}
                                              disabled={!!markLoading[item.id]}
                                              title="Marchează ca Produs Fizic"
                                          >
                                            {markLoading[item.id] ? '...' : 'Produs Fizic'}
                                          </Button>
                                      )}

                                </div>
                              </div>
                            </div>
                          </div>

                        {/* Anexe table */}
                        <div className="mt-3 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {anexes.map(({ key, label }) => (
                              <span key={key} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/30 border border-border">
                                <span className="text-muted-foreground">{label}:</span>
                                <span className="font-medium">{(item as any)?.[key] ?? '-'}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudiuDialog;
