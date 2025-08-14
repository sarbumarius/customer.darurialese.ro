import React, { useRef, useState } from "react";
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
  orderId?: number; // Order ID for AI API call
  awbData?: any; // AWB tracking data
  awbOrder?: any; // Order data with notes
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
  orderId,
  awbData,
  awbOrder,
  setShowAwbTicketModal,
  setSendTicketSubmitting,
  setAwbTicketMessage,
  setAwbTicketGenerating,
}) => {
  // State for client mentions (semi-automatic mode)
  const [mentiuniClient, setMentiuniClient] = useState<string>("");
  const [showMentiuniField, setShowMentiuniField] = useState<boolean>(false);

  // Helper function to format tracking data for AI
  const formatTrackingData = (awbData: any): string => {
    if (!awbData || !Array.isArray(awbData.tracking_data) || awbData.tracking_data.length === 0) {
      return '';
    }

    const lines: string[] = [];

    // Add current status info
    if (awbData.current_status) {
      lines.push(`Status curent: ${awbData.current_status}`);
    }
    if (awbData.delivered !== undefined) {
      lines.push(`Livrat: ${awbData.delivered ? 'da' : 'nu'}`);
    }
    if (awbData.courier) {
      lines.push(`Curier: ${awbData.courier}`);
    }
    lines.push(''); // Empty line separator

    // Sort tracking data by timestamp (newest first)
    const sortedTracking = [...awbData.tracking_data].sort((a: any, b: any) => {
      const ta = new Date(a?.timestamp || '').getTime();
      const tb = new Date(b?.timestamp || '').getTime();
      return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
    });

    // Format each tracking event
    sortedTracking.forEach((event: any, index: number) => {
      const timestamp = event.timestamp || '';
      const location = event.location ? ` • ${event.location}` : '';
      const status = event.status || '';
      const comment = event.comment ? `\n${event.comment}` : '';

      lines.push(`${timestamp}${location}`);
      lines.push(`${status}${comment}`);
      if (index < sortedTracking.length - 1) {
        lines.push(''); // Empty line between events
      }
    });

    return lines.join('\n');
  };

  // Helper function to format order notes for AI
  const formatOrderNotes = (awbOrder: any): string => {
    if (!awbOrder || !Array.isArray(awbOrder.notes) || awbOrder.notes.length === 0) {
      return '';
    }

    const lines: string[] = [];

    // Sort notes by date (newest first)
    const sortedNotes = [...awbOrder.notes].sort((a: any, b: any) => {
      const ta = new Date(a?.comment_date || '').getTime();
      const tb = new Date(b?.comment_date || '').getTime();
      return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
    });

    // Format each note
    sortedNotes.forEach((note: any, index: number) => {
      const date = note.comment_date || '';
      const content = note.comment_content || '';

      lines.push(`${date}: ${content}`);
      if (index < sortedNotes.length - 1) {
        lines.push(''); // Empty line between notes
      }
    });

    return lines.join('\n');
  };

  // Function to call AI email generation API
  const generateAIEmail = async (mentiuni_client?: string) => {
    if (!orderId) {
      console.error('Order ID is required for AI email generation');
      return;
    }

    try {
      setAwbTicketGenerating(true);

      // Format the tracking data and notes for AI
      const formattedTrackingData = formatTrackingData(awbData);
      const formattedNotes = formatOrderNotes(awbOrder);

      console.log('📊 Formatted tracking data:', formattedTrackingData);
      console.log('📝 Formatted notes:', formattedNotes);

      const response = await fetch(`https://crm.actium.ro/api/email-curier/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courier_email: 'probleme@darurialese.ro',
          awb: awbData?.awb || 'AWB',
          courier_name: 'DPD România',
          istoric_dpd: formattedTrackingData,
          istoric_notite: formattedNotes,
          mentiuni_client: mentiuni_client || ''
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ AI email generated successfully:', data);

      if (data.success && data.email_content) {
        setAwbTicketMessage(data.email_content);
      } else {
        throw new Error('No email content received from AI');
      }

    } catch (error) {
      console.error('❌ Error generating AI email:', error);
      // Fallback to hardcoded message if API fails
      const baseMessage = "Bună ziua,\n\nVă scriu în legătură cu AWB-ul menționat în subiect. Avem următoarea problemă:\n\n";
      const clientMentions = mentiuni_client || "[Descriere problemă]";
      const endMessage = "\n\nVă rog să verificați și să ne comunicați statusul livrării.\n\nMulțumesc,\nEchipa Daruri Alese";
      setAwbTicketMessage(baseMessage + clientMentions + endMessage);
    } finally {
      setAwbTicketGenerating(false);
    }
  };

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
            setMentiuniClient("");
            setShowMentiuniField(false);
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
                  setMentiuniClient("");
                  setShowMentiuniField(false);
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
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs" 
                      disabled={awbTicketGenerating || sendTicketSubmitting} 
                      onClick={() => {
                        setShowMentiuniField(false);
                        generateAIEmail();
                      }}
                    >
                      Completeaza integral cu ai
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs" 
                      disabled={awbTicketGenerating || sendTicketSubmitting} 
                      onClick={() => {
                        setShowMentiuniField(true);
                      }}
                    >
                      Completeaza semi-automat ai
                    </Button>
                  </div>
                </div>
              </div>

              {/* Client mentions field - appears only in semi-automatic mode */}
              {showMentiuniField && (
                <div>
                  <Label htmlFor="mentiuni-client" className="text-sm">Mențiuni client</Label>
                  <div className="relative">
                    <textarea 
                      id="mentiuni-client" 
                      className="mt-1 w-full min-h-[100px] p-2 border rounded bg-background text-foreground border-input text-sm" 
                      placeholder="Introduceți ideile de care să țină cont AI-ul..." 
                      value={mentiuniClient} 
                      onChange={(e) => setMentiuniClient(e.target.value)} 
                      disabled={sendTicketSubmitting || awbTicketGenerating} 
                    />
                    <div className="absolute top-2 right-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2 text-xs" 
                        disabled={awbTicketGenerating || sendTicketSubmitting || !mentiuniClient.trim()} 
                        onClick={() => {
                          generateAIEmail(mentiuniClient.trim());
                        }}
                      >
                        Generează cu mențiuni
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                  setMentiuniClient("");
                  setShowMentiuniField(false);
                } 
              }}
            >
              Renunță
            </Button>
            <Button 
              size="sm" 
              onClick={async () => { 
                if (sendTicketSubmitting) return; 
                setSendTicketSubmitting(true); 

                try {
                  console.log(`📧 Trimit tichet DPD către: ${awbTicketTo}`);

                  // Parse CC emails from the CC string (comma-separated)
                  const ccEmails = awbTicketCc 
                    ? awbTicketCc.split(',').map(email => email.trim()).filter(email => email.length > 0)
                    : [];

                  // Send email using the new API endpoint with CC support
                  const response = await fetch('https://crm.actium.ro/api/trimitere-email-cc', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      to_email: awbTicketTo,
                      message: awbTicketMessage,
                      subject: awbTicketSubject,
                      cc: ccEmails
                    }),
                  });

                  if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                  }

                  const data = await response.json();
                  console.log('✅ Tichet DPD trimis cu succes:', data);

                  if (data.success) {
                    // Success - close modal and reset form
                    setShowAwbTicketModal(false);
                    setAwbTicketMessage("");
                    setAwbTicketGenerating(false);
                    setMentiuniClient("");
                    setShowMentiuniField(false);
                  } else {
                    throw new Error(data.message || 'Eroare la trimiterea tichetului');
                  }

                } catch (error) {
                  console.error('❌ Eroare la trimiterea tichetului DPD:', error);
                  // You might want to show an error message to the user here
                  alert(`Eroare la trimiterea tichetului: ${error.message || 'Eroare necunoscută'}`);
                } finally {
                  setSendTicketSubmitting(false);
                }
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
