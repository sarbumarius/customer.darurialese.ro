import React from "react";
import { Button } from "@/components/ui/button";
import { X, Gift, PhoneCall, Send, Plus } from "lucide-react";
import type { Comanda } from "@/types/dashboard";
import AwbTimeline from "@/components/content/AwbTimeline";

interface AwbTrackingOffCanvasProps {
  showAwbModal: boolean;
  awbLoading: boolean;
  awbError: string | null;
  awbData: any | null;
  awbInfo: { awb?: string; courier?: string } | null;
  awbOrder: Comanda | null;
  setShowAwbModal: (show: boolean) => void;
  setAwbError: (error: string | null) => void;
  setAwbData: (data: any | null) => void;
  setAwbInfo: (info: { awb?: string; courier?: string } | null) => void;
  setAwbOrder: (order: Comanda | null) => void;
  setHighlightedOrderId: (id: number | null) => void;
  setShowAddWpNoteModal: (show: boolean) => void;
  setAddNoteOrderId: (id: number | null) => void;
  setShowAwbTicketModal: (show: boolean) => void;
  setAwbTicketMessage: (message: string) => void;
  setAwbTicketGenerating: (generating: boolean) => void;
  setAwbTicketSubject: (subject: string) => void;
  setAddWpNoteText: (text: string) => void;
  setAddWpNoteError: (error: string | null) => void;
  setAddWpNoteVisibleToCustomer: (visible: boolean) => void;
}

export const AwbTrackingOffCanvas: React.FC<AwbTrackingOffCanvasProps> = ({
  showAwbModal,
  awbLoading,
  awbError,
  awbData,
  awbInfo,
  awbOrder,
  setShowAwbModal,
  setAwbError,
  setAwbData,
  setAwbInfo,
  setAwbOrder,
  setHighlightedOrderId,
  setShowAddWpNoteModal,
  setAddNoteOrderId,
  setShowAwbTicketModal,
  setAwbTicketMessage,
  setAwbTicketGenerating,
  setAwbTicketSubject,
  setAddWpNoteText,
  setAddWpNoteError,
  setAddWpNoteVisibleToCustomer,
}) => {
  if (!showAwbModal) return null;

  const closeModal = () => {
    setShowAwbModal(false);
    setAwbError(null);
    setAwbData(null);
    setAwbInfo(null);
    setAwbOrder(null);
    setHighlightedOrderId(null);
    setShowAddWpNoteModal(false);
    setAddNoteOrderId(null);
    setShowAwbTicketModal(false);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={closeModal}
      />
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[720px] md:w-[780px] bg-white border-l border-border shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">Istoric AWB {awbInfo?.awb ? `#${awbInfo.awb}` : ''} {awbInfo?.courier ? `(${awbInfo.courier})` : ''}</div>
            {awbOrder && (
              <div className="mt-1 text-sm flex items-center gap-3 flex-wrap">
                <span className="font-medium truncate inline-flex items-center gap-1">
                  {(() => {
                    const first = awbOrder?.billing_details?._billing_first_name || awbOrder?.shipping_details._shipping_first_name || '';
                    const last = awbOrder?.billing_details?._billing_last_name || awbOrder?.shipping_details._shipping_last_name || '';
                    const nm = `${first} ${last}`.trim();
                    return nm || '-';
                  })()}
                  {(() => {
                    const v: any = (awbOrder as any)?.comandaCadou;
                    const isGift = v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                    return isGift ? (
                      <Gift className="w-4 h-4 text-pink-600 shrink-0" title="Acest colet este oferit cadou" />
                    ) : null;
                  })()}
                </span>
                {(() => {
                  const comp = (awbOrder?.billing_details?._billing_numefirma || '').trim();
                  return comp ? (
                    <div className="text-xs text-muted-foreground" title={comp}>
                      Firma: <span className="font-medium text-foreground">{comp}</span>
                    </div>
                  ) : null;
                })()}
                {(() => {
                  const raw = awbOrder?.billing_details?._billing_phone || awbOrder?.shipping_details?._shipping_phone || '';
                  const display = String(raw || '').trim();
                  const tel = display.replace(/[^+\d]/g, '');
                  return display ? (
                    <a href={`tel:${tel}`} className="inline-flex items-center gap-1 text-primary hover:underline" title={`Sună: ${display}`}>
                      <PhoneCall className="w-4 h-4" />
                      <span className="truncate">{display}</span>
                    </a>
                  ) : null;
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => awbOrder && window.open(`https://darurialese.com/wp-admin/post.php?post=${awbOrder.ID}&action=edit`, '_blank')}
                  title={`Deschide comanda #${awbOrder?.ID}`}
                >
                  #{awbOrder?.ID}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {(() => {
              const courier = (awbInfo?.courier || '').toString().toLowerCase();
              if (courier.includes('dpd')) {
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    title="Trimite tichet DPD"
                    onClick={() => {
                      const first = awbOrder?.billing_details?._billing_first_name || awbOrder?.shipping_details._shipping_first_name || '';
                      const last = awbOrder?.billing_details?._billing_last_name || awbOrder?.shipping_details._shipping_last_name || '';
                      const nm = `${first} ${last}`.trim() || '-';
                      const id = awbOrder?.ID ? `#${awbOrder.ID}` : '';
                      const awb = awbInfo?.awb || 'AWB';
                      const subject = `${awb} - Problema comanda ${nm} ${id}`;

                      setAwbTicketMessage("");
                      setAwbTicketGenerating(false);
                      setAwbTicketSubject(subject);
                      setShowAwbTicketModal(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Trimite tichet
                  </Button>
                );
              }
              return null;
            })()}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              title="Închide"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Body: split height in 2 panes with independent scroll */}
        <div className="flex-1 min-h-0 p-3 flex flex-col gap-3">
          {awbLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Se încarcă istoricul...</div>
          ) : awbError ? (
            <div className="p-4 text-sm text-red-600">{awbError}</div>
          ) : awbData ? (
            <>
              {/* Wizard steps above Curier */}
              <div className="border border-border rounded-md p-3 bg-white">
                {(() => {
                  // Derive step dates from notes
                  const normalize = (s: any) => {
                    try {
                      return String(s || '')
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase();
                    } catch {
                      return String(s || '').toLowerCase();
                    }
                  };
                  let gotGraphicsAt: string | null = null;
                  let approvedGraphicsAt: string | null = null;
                  try {
                    const notesArr = Array.isArray(awbOrder?.notes) ? (awbOrder as any).notes : [];
                    const sortedNotes = [...notesArr];
                    try {
                      sortedNotes.sort((a: any, b: any) => new Date(a?.comment_date || '').getTime() - new Date(b?.comment_date || '').getTime());
                    } catch {}
                    for (const n of sortedNotes) {
                      const txt = normalize(n?.comment_content);
                      if (!gotGraphicsAt && txt.includes('starea comenzii a fost modificata') && txt.includes('din in procesare in aprobare client')) {
                        gotGraphicsAt = n?.comment_date || null;
                      }
                      if (!approvedGraphicsAt && txt.includes('din aprobare client in productie')) {
                        approvedGraphicsAt = n?.comment_date || null;
                      }
                      if (gotGraphicsAt && approvedGraphicsAt) break;
                    }
                  } catch {}
                  const steps = [
                    { key: 'order', label: 'A dat comanda', sub: awbOrder?.post_date ? awbOrder.post_date : null },
                    { key: 'confirm', label: 'Confirmată comanda', sub: awbOrder?.confirmare_comanda || null },
                    { key: 'got_graphics', label: 'A primit grafica', sub: gotGraphicsAt },
                    { key: 'approved_graphics', label: 'A aprobat grafica', sub: approvedGraphicsAt },
                    { key: 'picked_up', label: 'Preluat curierul', sub: (() => {
                      try {
                        const td = Array.isArray(awbData?.tracking_data) ? awbData.tracking_data : [];
                        if (td.length === 0) return null;
                        const asc = [...td].sort((a: any, b: any) => new Date(a?.timestamp || '').getTime() - new Date(b?.timestamp || '').getTime());
                        const firstTs = asc[0]?.timestamp;
                        return firstTs || null;
                      } catch { return null; }
                    })() }
                  ];
                  return (
                    <>
                      <div className="mb-2 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        {awbOrder?.expediere && (
                          <div>
                            Propus pentru expediere: <span className="font-medium">{awbOrder.expediere}</span>
                          </div>
                        )}

                      </div>
                      <AwbTimeline steps={steps} proposedShippingDate={awbOrder?.expediere} />
                    </>
                  );
                })()}
              </div>
              {/* Curier (AWB tracking) pane */}
              <div className="flex-1 min-h-0 border border-border rounded-md flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-border bg-white sticky top-0 z-10 flex items-center justify-between">
                  <div className="font-semibold text-sm">Curier</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-3"><span className="text-muted-foreground">Curent:</span> <span className="font-medium">{awbData.current_status || '-'}</span></span>
                    <span className="mr-3"><span className="text-muted-foreground">Livrat:</span> <span className="font-medium">{awbData.delivered ? 'da' : 'nu'}</span></span>
                    {awbData.courier && (<span><span className="text-muted-foreground">Curier:</span> <span className="font-medium">{awbData.courier}</span></span>)}
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-gray-50">
                  {Array.isArray(awbData.tracking_data) && awbData.tracking_data.length > 0 ? (
                    <div className="space-y-2">
                      {(() => {
                        const sorted = [...awbData.tracking_data].sort((a: any, b: any) => {
                          const ta = new Date(a?.timestamp || '').getTime();
                          const tb = new Date(b?.timestamp || '').getTime();
                          return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
                        });
                        return sorted.map((t: any, idx: number) => (
                          <div key={idx} className={`p-2 rounded-md border ${idx === 0 ? 'border-green-500 bg-green-50/40' : 'border-border'}`}>
                            <div className={`text-xs mb-1 ${idx === 0 ? 'text-green-700' : 'text-muted-foreground'}`}>{t.timestamp} {t.location ? `• ${t.location}` : ''}</div>
                            <div className={`text-sm ${idx === 0 ? 'font-bold' : 'font-medium'}`}>{t.status}</div>
                            {t.comment && (
                              <div className="text-xs whitespace-pre-wrap text-muted-foreground mt-1">{t.comment}</div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nu există înregistrări de tracking.</div>
                  )}
                </div>
              </div>

              {/* Notițe pane */}
              <div className="flex-1 min-h-0 border border-border rounded-md flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-border bg-white sticky top-0 z-10 flex items-center justify-between">
                  <div className="font-semibold text-sm">Notițe comandă {awbOrder ? `#${awbOrder.ID}` : ''}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    title="Adaugă notiță WordPress"
                    onClick={() => { setAddWpNoteText(''); setAddWpNoteError(null); setAddWpNoteVisibleToCustomer(true); setAddNoteOrderId(awbOrder?.ID || null); setShowAddWpNoteModal(true); }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 bg-gray-50">
                  {Array.isArray(awbOrder?.notes) && awbOrder!.notes.length > 0 ? (
                    awbOrder!.notes.map((n, idx) => (
                      <div key={idx} className="p-2 rounded-md border border-border">
                        <div className="text-xs text-muted-foreground mb-1">{n.comment_date}</div>
                        <div className="text-sm whitespace-pre-wrap break-words">{n.comment_content}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Nu există notițe pentru această comandă.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">Selectează un AWB pentru a vedea istoricul.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border text-right">
          <Button variant="outline" size="sm" onClick={closeModal}>Închide</Button>
        </div>
      </div>
    </div>
  );
};

export default AwbTrackingOffCanvas;
