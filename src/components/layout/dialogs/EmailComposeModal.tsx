import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { isLikelyValidEmail } from "@/utils/validation";

interface EmailComposeModalProps {
  showEmailSendModal: boolean;
  emailSubmitting: boolean;
  emailTo: string;
  emailFrom: string;
  emailSubject: string;
  emailMessage: string;
  setShowEmailSendModal: (show: boolean) => void;
  setEmailSubmitting: (submitting: boolean) => void;
  setEmailTo: (to: string) => void;
  setEmailFrom: (from: string) => void;
  setEmailSubject: (subject: string) => void;
  setEmailMessage: (message: string) => void;
}

export const EmailComposeModal: React.FC<EmailComposeModalProps> = ({
  showEmailSendModal,
  emailSubmitting,
  emailTo,
  emailFrom,
  emailSubject,
  emailMessage,
  setShowEmailSendModal,
  setEmailSubmitting,
  setEmailTo,
  setEmailFrom,
  setEmailSubject,
  setEmailMessage,
}) => {
  if (!showEmailSendModal) return null;

  const resetForm = () => {
    setEmailTo('');
    setEmailFrom('');
    setEmailSubject('');
    setEmailMessage('');
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop closes only this modal */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => { 
          if (!emailSubmitting) { 
            setShowEmailSendModal(false); 
            resetForm();
          } 
        }} 
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[96vw] sm:w-[640px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#020817] border border-border rounded-md shadow-xl">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="font-semibold">Trimite email</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { 
                if (!emailSubmitting) { 
                  setShowEmailSendModal(false); 
                  resetForm();
                } 
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-3 space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="email-to" className="text-sm">Către</Label>
                <input 
                  id="email-to" 
                  type="text" 
                  className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" 
                  value={emailTo} 
                  onChange={(e) => setEmailTo(e.target.value)} 
                  disabled={emailSubmitting} 
                />
              </div>
              <div>
                <Label htmlFor="email-from" className="text-sm">De la</Label>
                <input 
                  id="email-from" 
                  type="text" 
                  className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" 
                  value={emailFrom} 
                  onChange={(e) => setEmailFrom(e.target.value)} 
                  disabled={emailSubmitting} 
                />
              </div>
              <div>
                <Label htmlFor="email-subject" className="text-sm">Subiect</Label>
                <input 
                  id="email-subject" 
                  type="text" 
                  className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                  disabled={emailSubmitting} 
                />
              </div>
              <div>
                <Label htmlFor="email-message" className="text-sm">Mesaj</Label>
                <textarea 
                  id="email-message" 
                  className="mt-1 w-full min-h-[160px] p-2 border rounded bg-background text-foreground border-input text-sm" 
                  placeholder="Scrie mesajul aici..." 
                  value={emailMessage} 
                  onChange={(e) => setEmailMessage(e.target.value)} 
                  disabled={emailSubmitting} 
                />
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-border flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { 
                if (!emailSubmitting) { 
                  setShowEmailSendModal(false); 
                  resetForm();
                } 
              }}
            >
              Renunță
            </Button>
            <Button 
              size="sm"
              disabled={emailSubmitting || !isLikelyValidEmail(emailTo) || !isLikelyValidEmail(emailFrom)}
              onClick={async () => {
                if (emailSubmitting) return;
                setEmailSubmitting(true);

                try {
                  console.log(`📧 Trimit email către: ${emailTo}`);

                  // Send email using the API endpoint with separate subject field
                  const response = await fetch('https://crm.actium.ro/api/trimitere-email', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      to_email: emailTo,
                      message: emailMessage,
                      subject: emailSubject
                    }),
                  });

                  if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                  }

                  const data = await response.json();
                  console.log('✅ Email trimis cu succes:', data);

                  if (data.success) {
                    // Success - close modal and reset form
                    setShowEmailSendModal(false);
                    resetForm();
                  } else {
                    throw new Error(data.message || 'Eroare la trimiterea email-ului');
                  }

                } catch (error) {
                  console.error('❌ Eroare la trimiterea email-ului:', error);
                  // You might want to show an error message to the user here
                  alert(`Eroare la trimiterea email-ului: ${error.message || 'Eroare necunoscută'}`);
                } finally {
                  setEmailSubmitting(false);
                }
              }}
            >
              {emailSubmitting ? 'Se trimite…' : 'Trimite'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposeModal;
