import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

interface AddWpNoteModalProps {
  showAddWpNoteModal: boolean;
  addWpNoteText: string;
  addWpNoteVisibleToCustomer: boolean;
  addWpNoteSubmitting: boolean;
  addWpNoteError: string | null;
  addNoteOrderId: number | null;
  notesOrder: Comanda | null;
  awbOrder: Comanda | null;
  setShowAddWpNoteModal: (show: boolean) => void;
  setAddWpNoteText: (text: string) => void;
  setAddWpNoteVisibleToCustomer: (visible: boolean) => void;
  setAddWpNoteSubmitting: (submitting: boolean) => void;
  setAddWpNoteError: (error: string | null) => void;
  setAddNoteOrderId: (id: number | null) => void;
  setNotesOrder: (order: Comanda | null) => void;
  setAwbOrder: (order: Comanda | null) => void;
}

export const AddWpNoteModal: React.FC<AddWpNoteModalProps> = ({
  showAddWpNoteModal,
  addWpNoteText,
  addWpNoteVisibleToCustomer,
  addWpNoteSubmitting,
  addWpNoteError,
  addNoteOrderId,
  notesOrder,
  awbOrder,
  setShowAddWpNoteModal,
  setAddWpNoteText,
  setAddWpNoteVisibleToCustomer,
  setAddWpNoteSubmitting,
  setAddWpNoteError,
  setAddNoteOrderId,
  setNotesOrder,
  setAwbOrder,
}) => {
  if (!showAddWpNoteModal) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop that only closes this modal, not the notes off-canvas */}
      <div className="absolute inset-0 bg-black/50" onClick={() => { if (!addWpNoteSubmitting) { setShowAddWpNoteModal(false); setAddNoteOrderId(null); } }} />
      <div className="absolute inset-x-0 top-12 mx-auto w-[94vw] sm:w-[520px] bg-white dark:bg-[#020817] border border-border rounded-md shadow-xl">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="font-semibold">Trimite notiță WordPress pentru comanda #{addNoteOrderId || notesOrder?.ID || awbOrder?.ID}</div>
          <Button variant="ghost" size="sm" onClick={() => { if (!addWpNoteSubmitting) { setShowAddWpNoteModal(false); setAddNoteOrderId(null); } }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-3 space-y-3">
          {addWpNoteError && <div className="text-sm text-red-600">{addWpNoteError}</div>}
          <div>
            <Label htmlFor="wp-note-text" className="text-sm">Mesaj</Label>
            <textarea
              id="wp-note-text"
              className="mt-1 w-full min-h-[120px] p-2 border rounded bg-background text-foreground border-input text-sm"
              placeholder="Scrie notița aici..."
              value={addWpNoteText}
              onChange={(e) => setAddWpNoteText(e.target.value)}
              disabled={addWpNoteSubmitting}
            />
          </div>
          <label className="flex items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={addWpNoteVisibleToCustomer}
              onChange={(e) => setAddWpNoteVisibleToCustomer(e.target.checked)}
              disabled={addWpNoteSubmitting}
            />
            Vizibil pentru client
          </label>
        </div>
        <div className="p-3 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => { if (!addWpNoteSubmitting) { setShowAddWpNoteModal(false); setAddNoteOrderId(null); } }}>Renunță</Button>
          <Button
            size="sm"
            onClick={() => {
              if (addWpNoteSubmitting) return;
              setAddWpNoteError(null);
              const text = (addWpNoteText || '').trim();
              if (!text) {
                setAddWpNoteError('Te rugăm să scrii un mesaj.');
                return;
              }
              setAddWpNoteSubmitting(true);
              // Simulare succes local: adăugăm notița în lista potrivită și închidem doar acest modal
              try {
                const now = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
                const newNote = { comment_date: dateStr, comment_content: text } as any;
                if (notesOrder?.ID && notesOrder.ID === addNoteOrderId) {
                  setNotesOrder(prev => {
                    if (!prev) return prev;
                    const prevNotes = Array.isArray(prev.notes) ? prev.notes : [];
                    return { ...prev, notes: [...prevNotes, newNote] };
                  });
                }
                if (awbOrder?.ID && awbOrder.ID === addNoteOrderId) {
                  setAwbOrder(prev => {
                    if (!prev) return prev;
                    const prevNotes = Array.isArray(prev.notes) ? prev.notes : [];
                    return { ...prev, notes: [...prevNotes, newNote] } as any;
                  });
                }
                setShowAddWpNoteModal(false);
                setAddWpNoteSubmitting(false);
                setAddWpNoteText('');
                setAddNoteOrderId(null);
                // Optional: toast/alert minimal
                // alert('Notița a fost adăugată local. API-ul urmează.');
              } catch (e) {
                setAddWpNoteError('A apărut o eroare locală.');
                setAddWpNoteSubmitting(false);
              }
            }}
          >
            {addWpNoteSubmitting ? 'Se trimite…' : 'Trimite'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddWpNoteModal;