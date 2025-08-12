import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Plus } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

interface NotesOffCanvasProps {
  showNotesPanel: boolean;
  notesOrder: Comanda | null;
  setShowNotesPanel: (show: boolean) => void;
  setNotesOrder: (order: Comanda | null) => void;
  setAddWpNoteText: (text: string) => void;
  setAddWpNoteError: (error: string | null) => void;
  setAddWpNoteVisibleToCustomer: (visible: boolean) => void;
  setAddNoteOrderId: (id: number | null) => void;
  setShowAddWpNoteModal: (show: boolean) => void;
}

export const NotesOffCanvas: React.FC<NotesOffCanvasProps> = ({
  showNotesPanel,
  notesOrder,
  setShowNotesPanel,
  setNotesOrder,
  setAddWpNoteText,
  setAddWpNoteError,
  setAddWpNoteVisibleToCustomer,
  setAddNoteOrderId,
  setShowAddWpNoteModal,
}) => {
  if (!showNotesPanel) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => { setShowNotesPanel(false); setNotesOrder(null); setShowAddWpNoteModal(false); }} />
      <div className="absolute right-0 top-0 h-full w-[90vw] sm:w-[460px] bg-white dark:bg-[#020817] border-l border-border shadow-xl flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <div className="font-semibold">Notițe comandă #{notesOrder?.ID}</div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              title="Adaugă notiță WordPress"
              onClick={() => { setAddWpNoteText(''); setAddWpNoteError(null); setAddWpNoteVisibleToCustomer(true); setAddNoteOrderId(notesOrder?.ID || null); setShowAddWpNoteModal(true); }}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowNotesPanel(false); setNotesOrder(null); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {Array.isArray(notesOrder?.notes) && notesOrder!.notes.length > 0 ? (
            notesOrder!.notes.map((n, idx) => (
              <div key={idx} className="p-2 rounded-md border border-border">
                <div className="text-xs text-muted-foreground mb-1">{n.comment_date}</div>
                <div className="text-sm whitespace-pre-wrap break-words">{n.comment_content}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Nu există notițe pentru această comandă.</div>
          )}
        </div>
        <div className="p-3 border-t border-border text-right">
          <Button variant="outline" size="sm" onClick={() => { setShowNotesPanel(false); setNotesOrder(null); }}>Închide</Button>
        </div>
      </div>
    </div>
  );
};

export default NotesOffCanvas;