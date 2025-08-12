import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Mail, MessageSquare, MessageCircle } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

interface RetrimitereGraficaModalProps {
  showResendGraphicModal: boolean;
  resendOrder: Comanda | null;
  resendSubmitting: boolean;
  resendViaEmail: boolean;
  resendViaSMS: boolean;
  resendViaWhatsApp: boolean;
  resendMessage: string;
  setShowResendGraphicModal: (show: boolean) => void;
  setResendOrder: (order: Comanda | null) => void;
  setResendSubmitting: (submitting: boolean) => void;
  setResendViaEmail: (via: boolean) => void;
  setResendViaSMS: (via: boolean) => void;
  setResendViaWhatsApp: (via: boolean) => void;
  setResendMessage: (message: string) => void;
}

export const RetrimitereGraficaModal: React.FC<RetrimitereGraficaModalProps> = ({
  showResendGraphicModal,
  resendOrder,
  resendSubmitting,
  resendViaEmail,
  resendViaSMS,
  resendViaWhatsApp,
  resendMessage,
  setShowResendGraphicModal,
  setResendOrder,
  setResendSubmitting,
  setResendViaEmail,
  setResendViaSMS,
  setResendViaWhatsApp,
  setResendMessage,
}) => {
  if (!showResendGraphicModal) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={() => { if (!resendSubmitting) { setShowResendGraphicModal(false); setResendOrder(null); } }} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[96vw] sm:w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#020817] border border-border rounded-md shadow-xl">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="font-semibold">Retrimitere grafică {resendOrder ? `#${resendOrder.ID}` : ''}</div>
            <Button variant="ghost" size="sm" onClick={() => { if (!resendSubmitting) { setShowResendGraphicModal(false); setResendOrder(null); } }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-3 space-y-3 text-sm">
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 select-none">
                <input type="checkbox" className="h-4 w-4" checked={resendViaEmail} onChange={(e) => setResendViaEmail(e.target.checked)} disabled={resendSubmitting} />
                <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4" /> Email</span>
              </label>
              <label className="inline-flex items-center gap-2 select-none">
                <input type="checkbox" className="h-4 w-4" checked={resendViaSMS} onChange={(e) => setResendViaSMS(e.target.checked)} disabled={resendSubmitting} />
                <span className="inline-flex items-center gap-1"><MessageSquare className="w-4 h-4" /> SMS</span>
              </label>
              <label className="inline-flex items-center gap-2 select-none">
                <input type="checkbox" className="h-4 w-4" checked={resendViaWhatsApp} onChange={(e) => setResendViaWhatsApp(e.target.checked)} disabled={resendSubmitting} />
                <span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> WhatsApp</span>
              </label>
              <div className="text-[12px] text-muted-foreground">Alege canalele pentru retrimiterea graficii. Mesajul de mai jos va fi folosit la trimitere.</div>
            </div>
            <div>
              <Label htmlFor="resend-msg" className="text-sm">Mesaj</Label>
              <textarea 
                id="resend-msg" 
                className="mt-1 w-full min-h-[140px] p-2 border rounded bg-background text-foreground border-input text-sm" 
                placeholder="Scrie mesajul care va fi trimis..." 
                value={resendMessage} 
                onChange={(e) => setResendMessage(e.target.value)} 
                disabled={resendSubmitting} 
              />
            </div>
          </div>
          <div className="p-3 border-t border-border flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { if (!resendSubmitting) { setShowResendGraphicModal(false); setResendOrder(null); } }}>Renunță</Button>
            <Button 
              size="sm" 
              onClick={() => { 
                if (resendSubmitting) return; 
                setResendSubmitting(true); 
                setTimeout(() => { 
                  setResendSubmitting(false); 
                  setShowResendGraphicModal(false); 
                  setResendOrder(null); 
                }, 300); 
              }}
            >
              {resendSubmitting ? 'Se trimite…' : 'Trimite'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetrimitereGraficaModal;