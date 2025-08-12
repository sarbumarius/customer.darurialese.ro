import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface AwbTicketModalProps {
  showAwbTicketModal: boolean;
  sendTicketSubmitting: boolean;
  awbTicketMessage: string;
  awbTicketGenerating: boolean;
  awbTicketTo: string;
  awbTicketCc: string;
  awbTicketSubject: string;
  awbEditorRef: React.RefObject<HTMLDivElement>;
  setShowAwbTicketModal: (show: boolean) => void;
  setSendTicketSubmitting: (submitting: boolean) => void;
  setAwbTicketMessage: (message: string) => void;
  setAwbTicketGenerating: (generating: boolean) => void;
}

export const AwbTicketModal: React.FC<AwbTicketModalProps> = ({
  showAwbTicketModal,
  sendTicketSubmitting,
  awbTicketMessage,
  awbTicketGenerating,
  awbTicketTo,
  awbTicketCc,
  awbTicketSubject,
  awbEditorRef,
  setShowAwbTicketModal,
  setSendTicketSubmitting,
  setAwbTicketMessage,
  setAwbTicketGenerating,
}) => {
  if (!showAwbTicketModal) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop closes only this modal */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => { 
          if (!sendTicketSubmitting) { 
            setShowAwbTicketModal(false); 
            setAwbTicketMessage(""); 
            setAwbTicketGenerating(false); 
          } 
        }} 
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[96vw] sm:w-[680px] md:w-[760px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#020817] border border-border rounded-md shadow-xl">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="font-semibold">Trimite tichet DPD</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { 
                if (!sendTicketSubmitting) { 
                  setShowAwbTicketModal(false); 
                  setAwbTicketMessage(""); 
                  setAwbTicketGenerating(false); 
                } 
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-3 space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="ticket-to" className="text-sm">Către</Label>
                <input 
                  id="ticket-to" 
                  type="text" 
                  className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" 
                  value={awbTicketTo} 
                  readOnly 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="ticket-cc" className="text-sm">CC</Label>
                <input 
                  id="ticket-cc" 
                  type="text" 
                  className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" 
                  value={awbTicketCc} 
                  readOnly 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="ticket-subject" className="text-sm">Subiect</Label>
                <input 
                  id="ticket-subject" 
                  type="text" 
                  className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" 
                  value={awbTicketSubject} 
                  readOnly 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="ticket-message" className="text-sm">Mesaj</Label>
                <div className="relative">
                  <textarea 
                    id="ticket-message" 
                    className="mt-1 w-full min-h-[200px] p-2 border rounded bg-background text-foreground border-input text-sm" 
                    placeholder="Scrie mesajul aici..." 
                    value={awbTicketMessage} 
                    onChange={(e) => setAwbTicketMessage(e.target.value)} 
                    disabled={sendTicketSubmitting || awbTicketGenerating} 
                  />
                  <div 
                    ref={awbEditorRef} 
                    className="hidden"
                  ></div>
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs" 
                      disabled={awbTicketGenerating || sendTicketSubmitting} 
                      onClick={() => {
                        setAwbTicketGenerating(true);
                        setTimeout(() => {
                          setAwbTicketMessage("Bună ziua,\n\nVă scriu în legătură cu AWB-ul menționat în subiect. Avem următoarea problemă:\n\n[Descriere problemă]\n\nVă rog să verificați și să ne comunicați statusul livrării.\n\nMulțumesc,\nEchipa Daruri Alese");
                          setAwbTicketGenerating(false);
                        }, 800);
                      }}
                    >
                      Completează cu AI
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-border flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { 
                if (!sendTicketSubmitting) { 
                  setShowAwbTicketModal(false); 
                  setAwbTicketMessage(""); 
                  setAwbTicketGenerating(false); 
                } 
              }}
            >
              Renunță
            </Button>
            <Button 
              size="sm" 
              onClick={() => { 
                if (sendTicketSubmitting) return; 
                setSendTicketSubmitting(true); 
                setTimeout(() => { 
                  setSendTicketSubmitting(false); 
                  setShowAwbTicketModal(false); 
                  setAwbTicketMessage(""); 
                  setAwbTicketGenerating(false); 
                }, 300); 
              }}
            >
              {sendTicketSubmitting ? 'Se trimite…' : 'Trimite'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwbTicketModal;