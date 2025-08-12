import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadgesRow from "@/components/content/StatusBadgesRow";
import ToggleOptionsGrid from "@/components/content/ToggleOptionsGrid";
import ConfirmationSelects from "@/components/content/ConfirmationSelects";
import ProductPersonalizationCard from "@/components/content/ProductPersonalizationCard";
import GiftsSlider from "@/components/content/GiftsSlider";
import { Gift, CalendarClock, PhoneCall, X, ImageOff, Cog, Send, Loader2, User, ShoppingBag, Eye } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

// Interface for SMS message
interface SmsMessage {
  id: number;
  phone: string;
  message: string;
  date: string;
  category: string;
  tip: string;
  created_at: string;
  updated_at: string;
}

// Client Orders Modal Component
const ClientOrdersModal = ({ 
  showClientOrdersModal, 
  setShowClientOrdersModal, 
  confirmOrder 
}) => {
  if (!showClientOrdersModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowClientOrdersModal(false)} />
      <div className="relative bg-background p-6 rounded-lg shadow-lg w-[700px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Comenzile clientului</h2>
          <button 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowClientOrdersModal(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="py-4">
          {/* Fake order data table */}
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="py-2 px-3 text-left font-medium">ID</th>
                  <th className="py-2 px-3 text-left font-medium">Total</th>
                  <th className="py-2 px-3 text-left font-medium">Data</th>
                  <th className="py-2 px-3 text-left font-medium">Data livrare</th>
                  <th className="py-2 px-3 text-left font-medium">Nume</th>
                  <th className="py-2 px-3 text-left font-medium">Telefon</th>
                </tr>
              </thead>
              <tbody>
                {/* Fake order data rows */}
                <tr className="border-t border-border">
                  <td className="py-2 px-3">#12345</td>
                  <td className="py-2 px-3">199.99 RON</td>
                  <td className="py-2 px-3">15 Mai 2023</td>
                  <td className="py-2 px-3">18 Mai 2023</td>
                  <td className="py-2 px-3">
                    {confirmOrder?.shipping_details._shipping_first_name}{" "}
                    {confirmOrder?.shipping_details._shipping_last_name}
                  </td>
                  <td className="py-2 px-3">{confirmOrder?.billing_details?._billing_phone || "0712345678"}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-2 px-3">#12346</td>
                  <td className="py-2 px-3">299.99 RON</td>
                  <td className="py-2 px-3">20 Iun 2023</td>
                  <td className="py-2 px-3">23 Iun 2023</td>
                  <td className="py-2 px-3">
                    {confirmOrder?.shipping_details._shipping_first_name}{" "}
                    {confirmOrder?.shipping_details._shipping_last_name}
                  </td>
                  <td className="py-2 px-3">{confirmOrder?.billing_details?._billing_phone || "0712345678"}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-2 px-3">#12347</td>
                  <td className="py-2 px-3">149.99 RON</td>
                  <td className="py-2 px-3">5 Aug 2023</td>
                  <td className="py-2 px-3">8 Aug 2023</td>
                  <td className="py-2 px-3">
                    {confirmOrder?.shipping_details._shipping_first_name}{" "}
                    {confirmOrder?.shipping_details._shipping_last_name}
                  </td>
                  <td className="py-2 px-3">{confirmOrder?.billing_details?._billing_phone || "0712345678"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowClientOrdersModal(false)}
          >
            Închide
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export interface ConfirmOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmOrder: Comanda | null;
  activeConfirmTab: 'confirmare' | 'sms' | 'puncte' | 'persoane';
  setActiveConfirmTab: (t: 'confirmare' | 'sms' | 'puncte' | 'persoane') => void;
  activeAddressTab: 'shipping' | 'billing';
  setActiveAddressTab: (t: 'shipping' | 'billing') => void;
}

export const ConfirmOrderDialog: React.FC<ConfirmOrderDialogProps> = ({
  open,
  onOpenChange,
  confirmOrder,
  activeConfirmTab,
  setActiveConfirmTab,
  activeAddressTab,
  setActiveAddressTab,
}) => {
  console.log("ConfirmOrderDialog rendered with activeConfirmTab:", activeConfirmTab);
  // State for the note textarea
  const [noteText, setNoteText] = useState("");

  // State for the verify payment modal
  const [showVerifyPaymentModal, setShowVerifyPaymentModal] = useState(false);

  // State for the client orders modal
  const [showClientOrdersModal, setShowClientOrdersModal] = useState(false);

  // State for the top tabs
  const [activeTopTab, setActiveTopTab] = useState<'tab1' | 'tab2' | 'tab3' | 'tab4'>('tab1');

  // State for SMS messages
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [loadingSms, setLoadingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsText, setSmsText] = useState("");

  // Function to fetch SMS messages
  const fetchSmsMessages = async (phoneNumber: string) => {
    console.log("fetchSmsMessages called with phone number:", phoneNumber);
    if (!phoneNumber) {
      console.log("No phone number provided");
      setSmsError("Număr de telefon lipsă");
      return;
    }

    console.log("Setting loading state to true");
    setLoadingSms(true);
    setSmsError(null);

    try {
      console.log("Fetching SMS messages from API");
      // Use the full URL to the API
      const apiUrl = `https://crm.actium.ro/api/verifica-sms/${phoneNumber}`;




      // Add a timeout to the fetch request to prevent it from hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId); // Clear the timeout if the request completes
        console.log("Fetch response received:", response);

        if (!response.ok) {
          console.error("Response not OK:", response.status, response.statusText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        console.log("Parsing response JSON");
        const data = await response.json();
        console.log("Response data:", data);

        if (data && data["sms-uri"]) {
          console.log("SMS messages found:", data["sms-uri"].length);
          setSmsMessages(data["sms-uri"]);
        } else {
          console.log("No SMS messages found");
          setSmsMessages([]);
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          console.error("Fetch request timed out");
          throw new Error("Cererea a expirat. Vă rugăm să încercați din nou.");
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error fetching SMS messages:", error);

      // Provide more specific error messages based on the error type
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        setSmsError("Eroare de rețea. Verificați conexiunea la internet.");
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setSmsError("Eroare de conexiune. Serverul nu poate fi accesat.");
      } else if (error.message.includes('Cererea a expirat')) {
        setSmsError(error.message);
      } else {
        setSmsError("Eroare la încărcarea mesajelor SMS: " + error.message);
      }
    } finally {
      console.log("Setting loading state to false");
      setLoadingSms(false);
    }
  };

  // Function to send SMS message
  const sendSmsMessage = async () => {
    if (!smsText.trim()) {
      setSmsError("Mesajul nu poate fi gol");
      return;
    }

    const phoneNumber = confirmOrder?.billing_details?._billing_phone || "";

    if (!phoneNumber) {
      setSmsError("Număr de telefon lipsă");
      return;
    }

    setLoadingSms(true);
    setSmsError(null);

    try {
      console.log("Sending SMS to", phoneNumber, "with message:", smsText);

      // Make the actual API call to send SMS
      const response = await fetch('https://crm.actium.ro/api/send-sms', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: smsText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Parse the response
      const data = await response.json();
      console.log("SMS sent successfully:", data);

      // Add the sent message to the list
      const newMessage: SmsMessage = {
        id: Date.now(),
        phone: phoneNumber,
        message: smsText,
        date: new Date().toISOString().split('T')[0],
        category: "manual",
        tip: "trimis",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSmsMessages(prev => [newMessage, ...prev]);
      setSmsText(""); // Clear the input
    } catch (error) {
      console.error("Error sending SMS message:", error);
      setSmsError("Eroare la trimiterea mesajului SMS: " + (error.message || "Eroare necunoscută"));
    } finally {
      setLoadingSms(false);
    }
  };

  // No hash-based navigation - we'll use direct tab switching instead

  // Simple console log to track the current tab
  console.log("Current activeConfirmTab:", activeConfirmTab);

  // Fetch SMS messages when the SMS tab is clicked
  useEffect(() => {
    if (activeTopTab === 'tab2' && confirmOrder?.billing_details?._billing_phone) {
      fetchSmsMessages(confirmOrder.billing_details._billing_phone);
    }
  }, [activeTopTab, confirmOrder?.billing_details?._billing_phone]);

  // Helper function to determine if an order is paid
  const isOrderPaid = (order: Comanda | null): boolean => {
    if (!order) return false;

    // For Mobilpay payments with payment date, consider as paid
    if (order.payment_method === 'netopiapayments' && order.date_paid_unix) {
      return true;
    }

    // For COD (cash on delivery), consider as unpaid
    if (order.payment_method === 'cod') {
      return false;
    }

    // For other payment methods, check if payment date exists
    return !!order.date_paid_unix;
  };

  // Helper function to get payment status text
  const getPaymentStatusText = (order: Comanda | null): string => {
    return isOrderPaid(order) ? 'Plătit' : 'Neplătit';
  };

  // We'll use this function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 w-full h-full max-w-[1800px] p-0 m-0 rounded-none translate-x-0 translate-y-0 overflow-hidden flex flex-col mx-auto">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-2 ">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Order ID and client name */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">#{confirmOrder?.ID}</Badge>
              <span className="font-medium">
                {confirmOrder?.shipping_details._shipping_first_name}{" "}
                {confirmOrder?.shipping_details._shipping_last_name}
              </span>
            </div>

            {/* Total amount */}
            <Badge variant="secondary" className="text-sm font-semibold">
              {confirmOrder?.order_total_formatted || confirmOrder?.pret_total || "-"}
            </Badge>

            {/* Order type icon */}
            <div className="flex items-center gap-1">
              <Gift className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Creation date & time */}
            <div className="flex items-center gap-1">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {confirmOrder?.post_date ? formatDate(confirmOrder.post_date) : "-"}
              </span>
            </div>

            {/* Phone (click-to-call) */}
            {confirmOrder?.billing_details?._billing_phone && (
              <a
                href={`tel:${confirmOrder.billing_details._billing_phone}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <PhoneCall className="h-4 w-4" />
                {confirmOrder.billing_details._billing_phone}
              </a>
            )}

            {/* Order status */}
            <Badge variant="outline" className="capitalize">
              {confirmOrder?.post_status === 'wc-processing' ? 'În lucru' :
               confirmOrder?.post_status === 'wc-completed' ? 'Finalizată' :
               confirmOrder?.post_status === 'wc-pending' ? 'Nouă' :
               confirmOrder?.post_status || 'Necunoscut'}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm">
              Procesează
            </Button>
            <Button size="sm" variant="outline">
              <ImageOff className="h-4 w-4 mr-1" />
              Lipsă poze
            </Button>
            <Button size="sm" variant="outline">
              <Cog className="h-4 w-4 mr-1" />
              Actualizează
            </Button>
            <Button size="sm" variant="destructive">
              <X className="h-4 w-4 mr-1" />
              Anulează
            </Button>
            <DialogClose className="rounded-full p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </div>



        {/* Main content area with 4 columns */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-10 gap-4 max-w-[1800px] mx-auto">



            {/* Left column (18.75%) - Client data & logistics */}
            <div className="col-span-2 space-y-4">

              {/* Client Avatar Card */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {confirmOrder?.shipping_details._shipping_first_name}{" "}
                        {confirmOrder?.shipping_details._shipping_last_name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        <span>3 comenzi</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowClientOrdersModal(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vezi comenzi
                  </Button>
                </div>
              </Card>

              {/* Card 0: Payment Method */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Metodă de plată</h3>
                    <Badge variant={isOrderPaid(confirmOrder) ? 'success' : 'outline'}>
                      {getPaymentStatusText(confirmOrder)}
                    </Badge>
                  </div>
                  <Select defaultValue={confirmOrder?.payment_method_title || "Plata ramburs"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează metoda de plată" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plata ramburs">Plata ramburs</SelectItem>
                      <SelectItem value="Transfer bancar direct">Transfer bancar direct</SelectItem>
                      <SelectItem value="Plata cu cardul Mobilpay">Plata cu cardul Mobilpay</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Display payment date if available */}
                  {confirmOrder?.date_paid_unix && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">Data plății:</span> {formatDate(new Date(parseInt(confirmOrder.date_paid_unix) * 1000).toISOString())}
                    </div>
                  )}

                  {/* Display currency if available */}
                  {confirmOrder?.currency && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">Monedă:</span> {confirmOrder.currency}
                    </div>
                  )}

                  {/* Display bank account information for unpaid bank transfers */}
                  {confirmOrder?.payment_method_title === "Transfer bancar direct" && !isOrderPaid(confirmOrder) && (
                    <div className="mt-3 p-3 border border-border rounded-md bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Conturi bancare:</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="font-medium">BANCA TRANSILVANIA</div>
                          <div>RO60BTRLRONCRT0415555501</div>
                        </div>
                        <div>
                          <div className="font-medium">ING BANK ROMANIA</div>
                          <div>RO74INGB0000999906973879</div>
                        </div>
                        <div>
                          <div className="font-medium">Trezorerie operativa Sector 5</div>
                          <div>RO65TREZ7055069XXX012556</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="mt-3 w-full">
                        Trimite pe email
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 w-full"
                        onClick={() => setShowVerifyPaymentModal(true)}
                      >
                        Verifică plata
                      </Button>
                    </div>
                  )}

                  {/* Display payment link button for unpaid card payments */}
                  {confirmOrder?.payment_method_title === "Plata cu cardul Mobilpay" && !isOrderPaid(confirmOrder) && (
                    <div className="mt-3">
                      <Button size="sm" className="w-full">
                        Generează link de plată Mobilpay
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Card 1: Delivery and Billing Tabs */}
              <Card>
                <div className="p-4">
                  <div className="flex border-b border-border mb-4">
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeAddressTab === 'shipping'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveAddressTab('shipping')}
                    >
                      Livrare
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeAddressTab === 'billing'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveAddressTab('billing')}
                    >
                      Facturare
                    </button>
                  </div>

                  {/* Shipping Address Tab */}
                  {activeAddressTab === 'shipping' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="shipping_firstName">Nume</Label>
                          <input
                            id="shipping_firstName"
                            className="w-full p-2 border border-border rounded-md"
                            defaultValue={confirmOrder?.shipping_details._shipping_first_name || ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="shipping_lastName">Prenume</Label>
                          <input
                            id="shipping_lastName"
                            className="w-full p-2 border border-border rounded-md"
                            defaultValue={confirmOrder?.shipping_details._shipping_last_name || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="shipping_phone">Telefon</Label>
                        <input
                          id="shipping_phone"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.billing_details?._billing_phone || ""}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="shipping_county">Județ</Label>
                          <Select defaultValue={confirmOrder?.shipping_details?._shipping_state || ""}>
                            <SelectTrigger id="shipping_county">
                              <SelectValue placeholder="Selectează județul" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alba">Alba</SelectItem>
                              <SelectItem value="Arad">Arad</SelectItem>
                              <SelectItem value="Arges">Argeș</SelectItem>
                              <SelectItem value="Bacau">Bacău</SelectItem>
                              <SelectItem value="Bihor">Bihor</SelectItem>
                              <SelectItem value="Bistrita-Nasaud">Bistrița-Năsăud</SelectItem>
                              <SelectItem value="Botosani">Botoșani</SelectItem>
                              <SelectItem value="Braila">Brăila</SelectItem>
                              <SelectItem value="Brasov">Brașov</SelectItem>
                              <SelectItem value="Bucuresti">București</SelectItem>
                              <SelectItem value="Buzau">Buzău</SelectItem>
                              <SelectItem value="Calarasi">Călărași</SelectItem>
                              <SelectItem value="Caras-Severin">Caraș-Severin</SelectItem>
                              <SelectItem value="Cluj">Cluj</SelectItem>
                              <SelectItem value="Constanta">Constanța</SelectItem>
                              <SelectItem value="Covasna">Covasna</SelectItem>
                              <SelectItem value="Dambovita">Dâmbovița</SelectItem>
                              <SelectItem value="Dolj">Dolj</SelectItem>
                              <SelectItem value="Galati">Galați</SelectItem>
                              <SelectItem value="Giurgiu">Giurgiu</SelectItem>
                              <SelectItem value="Gorj">Gorj</SelectItem>
                              <SelectItem value="Harghita">Harghita</SelectItem>
                              <SelectItem value="Hunedoara">Hunedoara</SelectItem>
                              <SelectItem value="Ialomita">Ialomița</SelectItem>
                              <SelectItem value="Iasi">Iași</SelectItem>
                              <SelectItem value="Ilfov">Ilfov</SelectItem>
                              <SelectItem value="Maramures">Maramureș</SelectItem>
                              <SelectItem value="Mehedinti">Mehedinți</SelectItem>
                              <SelectItem value="Mures">Mureș</SelectItem>
                              <SelectItem value="Neamt">Neamț</SelectItem>
                              <SelectItem value="Olt">Olt</SelectItem>
                              <SelectItem value="Prahova">Prahova</SelectItem>
                              <SelectItem value="Salaj">Sălaj</SelectItem>
                              <SelectItem value="Satu Mare">Satu Mare</SelectItem>
                              <SelectItem value="Sibiu">Sibiu</SelectItem>
                              <SelectItem value="Suceava">Suceava</SelectItem>
                              <SelectItem value="Teleorman">Teleorman</SelectItem>
                              <SelectItem value="Timis">Timiș</SelectItem>
                              <SelectItem value="Tulcea">Tulcea</SelectItem>
                              <SelectItem value="Valcea">Vâlcea</SelectItem>
                              <SelectItem value="Vaslui">Vaslui</SelectItem>
                              <SelectItem value="Vrancea">Vrancea</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="shipping_city">Localitate</Label>
                          <Select defaultValue={confirmOrder?.shipping_details?._shipping_city || "not_selected"}>
                            <SelectTrigger id="shipping_city">
                              <SelectValue placeholder="Selectează localitatea" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={confirmOrder?.shipping_details?._shipping_city || "not_selected"}>
                                {confirmOrder?.shipping_details?._shipping_city || "Selectează localitatea"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="shipping_address">Stradă/Număr</Label>
                        <Select defaultValue={confirmOrder?.shipping_details?._shipping_address_1 || "not_selected"}>
                          <SelectTrigger id="shipping_address">
                            <SelectValue placeholder="Selectează strada" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={confirmOrder?.shipping_details?._shipping_address_1 || "not_selected"}>
                              {confirmOrder?.shipping_details?._shipping_address_1 || "Selectează strada"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="shipping_postalCode">Cod poștal</Label>
                        <input
                          id="shipping_postalCode"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.shipping_details?._shipping_postcode || ""}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="shipping_addressDetails">Detalii adresă</Label>
                        <input
                          id="shipping_addressDetails"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.shipping_details?._shipping_address_2 || ""}
                        />
                      </div>
                    </div>
                  )}

                  {/* Billing Address Tab */}
                  {activeAddressTab === 'billing' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="billing_firstName">Nume</Label>
                          <input
                            id="billing_firstName"
                            className="w-full p-2 border border-border rounded-md"
                            defaultValue={confirmOrder?.billing_details?._billing_first_name || ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="billing_lastName">Prenume</Label>
                          <input
                            id="billing_lastName"
                            className="w-full p-2 border border-border rounded-md"
                            defaultValue={confirmOrder?.billing_details?._billing_last_name || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_phone">Telefon</Label>
                        <input
                          id="billing_phone"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.billing_details?._billing_phone || ""}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="billing_county">Județ</Label>
                          <Select defaultValue={confirmOrder?.billing_details?._billing_state || ""}>
                            <SelectTrigger id="billing_county">
                              <SelectValue placeholder="Selectează județul" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alba">Alba</SelectItem>
                              <SelectItem value="Arad">Arad</SelectItem>
                              <SelectItem value="Arges">Argeș</SelectItem>
                              <SelectItem value="Bacau">Bacău</SelectItem>
                              <SelectItem value="Bihor">Bihor</SelectItem>
                              <SelectItem value="Bistrita-Nasaud">Bistrița-Năsăud</SelectItem>
                              <SelectItem value="Botosani">Botoșani</SelectItem>
                              <SelectItem value="Braila">Brăila</SelectItem>
                              <SelectItem value="Brasov">Brașov</SelectItem>
                              <SelectItem value="Bucuresti">București</SelectItem>
                              <SelectItem value="Buzau">Buzău</SelectItem>
                              <SelectItem value="Calarasi">Călărași</SelectItem>
                              <SelectItem value="Caras-Severin">Caraș-Severin</SelectItem>
                              <SelectItem value="Cluj">Cluj</SelectItem>
                              <SelectItem value="Constanta">Constanța</SelectItem>
                              <SelectItem value="Covasna">Covasna</SelectItem>
                              <SelectItem value="Dambovita">Dâmbovița</SelectItem>
                              <SelectItem value="Dolj">Dolj</SelectItem>
                              <SelectItem value="Galati">Galați</SelectItem>
                              <SelectItem value="Giurgiu">Giurgiu</SelectItem>
                              <SelectItem value="Gorj">Gorj</SelectItem>
                              <SelectItem value="Harghita">Harghita</SelectItem>
                              <SelectItem value="Hunedoara">Hunedoara</SelectItem>
                              <SelectItem value="Ialomita">Ialomița</SelectItem>
                              <SelectItem value="Iasi">Iași</SelectItem>
                              <SelectItem value="Ilfov">Ilfov</SelectItem>
                              <SelectItem value="Maramures">Maramureș</SelectItem>
                              <SelectItem value="Mehedinti">Mehedinți</SelectItem>
                              <SelectItem value="Mures">Mureș</SelectItem>
                              <SelectItem value="Neamt">Neamț</SelectItem>
                              <SelectItem value="Olt">Olt</SelectItem>
                              <SelectItem value="Prahova">Prahova</SelectItem>
                              <SelectItem value="Salaj">Sălaj</SelectItem>
                              <SelectItem value="Satu Mare">Satu Mare</SelectItem>
                              <SelectItem value="Sibiu">Sibiu</SelectItem>
                              <SelectItem value="Suceava">Suceava</SelectItem>
                              <SelectItem value="Teleorman">Teleorman</SelectItem>
                              <SelectItem value="Timis">Timiș</SelectItem>
                              <SelectItem value="Tulcea">Tulcea</SelectItem>
                              <SelectItem value="Valcea">Vâlcea</SelectItem>
                              <SelectItem value="Vaslui">Vaslui</SelectItem>
                              <SelectItem value="Vrancea">Vrancea</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="billing_city">Localitate</Label>
                          <Select defaultValue={confirmOrder?.billing_details?._billing_city || "not_selected"}>
                            <SelectTrigger id="billing_city">
                              <SelectValue placeholder="Selectează localitatea" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={confirmOrder?.billing_details?._billing_city || "not_selected"}>
                                {confirmOrder?.billing_details?._billing_city || "Selectează localitatea"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_address">Stradă/Număr</Label>
                        <Select defaultValue={confirmOrder?.billing_details?._billing_address_1 || "not_selected"}>
                          <SelectTrigger id="billing_address">
                            <SelectValue placeholder="Selectează strada" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={confirmOrder?.billing_details?._billing_address_1 || "not_selected"}>
                              {confirmOrder?.billing_details?._billing_address_1 || "Selectează strada"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_postalCode">Cod poștal</Label>
                        <input
                          id="billing_postalCode"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.billing_details?._billing_postcode || ""}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_addressDetails">Detalii adresă</Label>
                        <input
                          id="billing_addressDetails"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.billing_details?._billing_address_2 || ""}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Card 2: Courier options */}
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Opțiuni curier</h3>

                  <div className="space-y-4">
                    {/* FAN Courier */}
                    <div className="border border-border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">FAN Courier</h4>
                        <img src="https://www.fancourier.ro/wp-content/themes/fancourier/images/logo.png" alt="FAN Courier" className="h-5" />
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="fanCity">Localitate</Label>
                            <input
                              id="fanCity"
                              className="w-full p-2 border border-border rounded-md"
                              defaultValue={confirmOrder?.shipping_details?._shipping_city || ""}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="fanCounty">Județ</Label>
                            <input
                              id="fanCounty"
                              className="w-full p-2 border border-border rounded-md"
                              defaultValue={confirmOrder?.shipping_details?._shipping_state || ""}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="fanCommune">Comună (opțional)</Label>
                          <input
                            id="fanCommune"
                            className="w-full p-2 border border-border rounded-md"
                          />
                        </div>

                        <div>
                          <Label className="mb-1 block">Zile livrare</Label>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" id="fanMonday" className="rounded" />
                              <Label htmlFor="fanMonday">Lu</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" id="fanTuesday" className="rounded" />
                              <Label htmlFor="fanTuesday">Ma</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" id="fanWednesday" className="rounded" />
                              <Label htmlFor="fanWednesday">Mi</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" id="fanThursday" className="rounded" />
                              <Label htmlFor="fanThursday">Jo</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" id="fanFriday" className="rounded" />
                              <Label htmlFor="fanFriday">Vi</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>



            {/* Center column (25%) - Confirmation & production options */}
            <div className="col-span-3 space-y-4">

              {/* Top tabs */}
              <div className="bg-background border-b border-border">
                <div className="flex border-b border-border max-w-[1800px] mx-auto px-4">
                  <button
                      type="button"
                      onClick={() => setActiveTopTab('tab1')}
                      className={`px-4 py-2 font-medium ${
                          activeTopTab === 'tab1'
                              ? 'border-b-2 border-primary text-primary'
                              : 'text-muted-foreground'
                      }`}
                  >
                   Confirmare
                  </button>
                  <button
                      type="button"
                      onClick={() => setActiveTopTab('tab2')}
                      className={`px-4 py-2 font-medium ${
                          activeTopTab === 'tab2'
                              ? 'border-b-2 border-primary text-primary'
                              : 'text-muted-foreground'
                      }`}
                  >
                    SMS
                  </button>
                  <button
                      type="button"
                      onClick={() => setActiveTopTab('tab3')}
                      className={`px-4 py-2 font-medium ${
                          activeTopTab === 'tab3'
                              ? 'border-b-2 border-primary text-primary'
                              : 'text-muted-foreground'
                      }`}
                  >
                    Puncte
                  </button>

                    <button
                        type="button"
                        onClick={() => setActiveTopTab('tab4')}
                        className={`px-4 py-2 font-medium ${
                            activeTopTab === 'tab4'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Persoane apropiate
                    </button>
                </div>

                {/* Tab content */}
                <div className=" max-w-[1800px] mx-auto">
                  {activeTopTab === 'tab1' && (
                      <Card className="p-4">
                        {activeConfirmTab === 'confirmare' && (
                            <>
                              <div>
                                {confirmOrder?.confirmare_comanda && (
                                    <h3 className="font-semibold text-lg mb-4">Confirmata la data {formatDate(confirmOrder.confirmare_comanda)}</h3>
                                )}
                              </div>
                              {/* Reason selection and add button */}
                              <div className="border border-border rounded-md p-4 mb-4 bg-yellow-50">
                                <div className="mb-4">
                                  <Label htmlFor="reason" className="block mb-2">Motiv</Label>
                                  <div className="grid-cols-1 grid gap-3">
                                    <select
                                        id="reason"
                                        className="p-2 border border-border rounded-md bg-background text-foreground"

                                    >
                                      <option value="Selecteaza">Selectează</option>
                                      <option value="Clientul nu raspunde" selected="selected">Clientul nu răspunde</option>
                                      <option value="Telefon inchis">Telefon închis</option>
                                      <option value="Telefonul nu suna">Telefonul nu sună</option>
                                      <option value="Numar gresit">Număr greșit</option>
                                      <option value="Linie ocupata">Linie ocupată</option>
                                      <option value="Apel respins">Apel respins</option>
                                      <option value="Amanare confirmare">Amânare confirmare</option>
                                    </select>
                                    <Button variant="outline" size="sm">
                                      Adaugă motiv neconfirmare
                                    </Button>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium">Istoric motive neconfirmare</h4>
                                    {/* Show "Mută în anulate" button only when there are 3 or more active reasons */}
                                    {(() => {
                                      const motivesObj = confirmOrder?.motive_comanda_neconfirmata || {};
                                      const motivesActiveCount = Object.keys(motivesObj).filter((k) => {
                                        const v = motivesObj[k]?.meta_value;
                                        return v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                                      }).length;

                                      return motivesActiveCount >= 3 ? (
                                          <Button
                                              variant="destructive"
                                              size="sm"
                                              className="text-xs"
                                              onClick={() => {
                                                // Logic to move the order to canceled
                                                console.log('Moving order to canceled:', confirmOrder?.ID);
                                              }}
                                          >
                                            Mută în anulate
                                          </Button>
                                      ) : null;
                                    })()}
                                  </div>
                                  <div className="border border-border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-muted">
                                      <tr>
                                        <th className="py-2 px-3 text-left font-medium w-10">#</th>
                                        <th className="py-2 px-3 text-left font-medium">Motiv</th>
                                        <th className="py-2 px-3 text-right font-medium">Data</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      {(() => {
                                        const motivesObj = confirmOrder?.motive_comanda_neconfirmata || {};
                                        const activeMotives = Object.keys(motivesObj).filter((k) => {
                                          const v = motivesObj[k]?.meta_value;
                                          return v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                                        });

                                        if (activeMotives.length > 0) {
                                          return activeMotives.map((key, index) => (
                                              <tr key={key} className="border-t border-border">
                                                <td className="py-2 px-3 text-center">{index + 1}</td>
                                                <td className="py-2 px-3">{motivesObj[key]?.meta_key?.replace('_motive_comanda_neconfirmata_', '') || key}</td>
                                                <td className="py-2 px-3 text-right text-muted-foreground">
                                                  {/* Display the key as is, or try to format it as a date if it's a timestamp */}
                                                  {(() => {
                                                    try {
                                                      // Try to parse the key as a timestamp
                                                      const timestamp = parseInt(key);
                                                      if (!isNaN(timestamp) && timestamp > 0) {
                                                        const date = new Date(timestamp * 1000);
                                                        // Check if the date is valid
                                                        if (!isNaN(date.getTime())) {
                                                          return date.toLocaleDateString('ro-RO', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                          });
                                                        }
                                                      }
                                                    } catch (e) {
                                                      // If parsing fails, fall back to the key
                                                    }
                                                    return key;
                                                  })()}
                                                </td>
                                              </tr>
                                          ));
                                        } else {
                                          return (
                                              <tr className="border-t border-border">
                                                <td colSpan={3} className="py-2 px-3 text-center text-muted-foreground">Nu există motive de neconfirmare</td>
                                              </tr>
                                          );
                                        }
                                      })()}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </>
                        )}

                        {/* SMS tab content */}
                        {activeConfirmTab === 'sms' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Mesaje SMS</h3>
                                <div className="text-sm text-muted-foreground">
                                  {confirmOrder?.billing_details?._billing_phone ? (
                                      <span>Telefon: {confirmOrder.billing_details._billing_phone}</span>
                                  ) : (
                                      <span className="text-red-500">Număr de telefon lipsă</span>
                                  )}
                                </div>
                              </div>

                              <div className="border border-border rounded-md p-4 mb-4">
                                <div className="space-y-4">
                                  {/* Error message */}
                                  {smsError && (
                                      <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md">
                                        {smsError}
                                      </div>
                                  )}

                                  {/* SMS messages table */}
                                  <div className="border border-border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-muted">
                                      <tr>
                                        <th className="py-2 px-3 text-left font-medium">Mesaj</th>
                                        <th className="py-2 px-3 text-right font-medium w-32">Data</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      {loadingSms ? (
                                          <tr className="border-t border-border">
                                            <td colSpan={2} className="py-8 text-center">
                                              <div className="flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                                                <span className="text-muted-foreground">Se încarcă mesajele SMS...</span>
                                              </div>
                                            </td>
                                          </tr>
                                      ) : smsMessages.length > 0 ? (
                                          smsMessages.map((sms) => (
                                              <tr key={sms.id} className="border-t border-border">
                                                <td className="py-2 px-3">
                                                  {/* Decode URL-encoded message */}
                                                  {decodeURIComponent(sms.message.replace(/\+/g, ' '))}
                                                </td>
                                                <td className="py-2 px-3 text-right text-muted-foreground">
                                                  {new Date(sms.created_at).toLocaleDateString('ro-RO', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })}
                                                </td>
                                              </tr>
                                          ))
                                      ) : (
                                          <tr className="border-t border-border">
                                            <td colSpan={2} className="py-4 text-center text-muted-foreground">
                                              Nu există mesaje SMS pentru acest client.
                                            </td>
                                          </tr>
                                      )}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* SMS sending form */}
                                  <div className="flex flex-col space-y-2">
                                    <Label htmlFor="smsMessage" className="text-sm font-medium">Trimite SMS către client</Label>
                                    <textarea
                                        id="smsMessage"
                                        className="w-full p-2 border border-border rounded-md min-h-[100px] resize-none"
                                        placeholder="Scrie mesajul SMS aici..."
                                        value={smsText}
                                        onChange={(e) => setSmsText(e.target.value)}
                                        disabled={loadingSms}
                                    />
                                    <div className="flex justify-between items-center">
                                      <div className="text-xs text-muted-foreground">
                                        {smsText.length} caractere
                                      </div>
                                      <Button
                                          onClick={sendSmsMessage}
                                          disabled={loadingSms || !smsText.trim() || !confirmOrder?.billing_details?._billing_phone}
                                          className="self-end"
                                      >
                                        {loadingSms ? (
                                            <>
                                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                              Se trimite...
                                            </>
                                        ) : (
                                            <>
                                              <Send className="h-4 w-4 mr-2" />
                                              Trimite SMS
                                            </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                        )}

                        {activeConfirmTab === 'puncte' && (
                            <div>
                              <h3 className="font-semibold text-lg mb-4">Puncte</h3>
                              <p className="text-muted-foreground">Conținutul pentru tab-ul Puncte va fi implementat ulterior.</p>
                            </div>
                        )}

                        {activeConfirmTab === 'persoane' && (
                            <div>
                              <h3 className="font-semibold text-lg mb-4">Persoane apropiate</h3>
                              <p className="text-muted-foreground">Conținutul pentru tab-ul Persoane apropiate va fi implementat ulterior.</p>
                            </div>
                        )}


                        {/* Client mood section */}

                        <div className="w-full">
                          <div className=" grid grid-cols-7 gap-1" >

                            <button  autoupdate="atentie_client" valoare="fas fa-angry" onClick={(e) => { /* autoupdate(this) */ }} autoidcomanda="1139251" data-toggle="tooltip" data-placement="top" title="" className="col-span-1 border p-2 rounded-md " data-original-title="Recalcitrant">
                              <i className="fas fa-angry"></i>
                            </button>
                            <button autoupdate="atentie_client" valoare="fas fa-dizzy" onClick={(e) => { /* autoupdate(this) */ }} autoidcomanda="1139251" data-toggle="tooltip" data-placement="top" title="" className="col-span-1 border p-2 rounded-md " data-original-title="IQ mic">
                              <i className="fas fa-dizzy"></i>
                            </button>
                            <button autoupdate="atentie_client" valoare="fas fa-grin-hearts" onClick={(e) => { /* autoupdate(this) */ }} autoidcomanda="1139251" data-toggle="tooltip" data-placement="top" title="" className="col-span-1 border p-2 rounded-md" data-original-title="Dragut">
                              <i className="fas fa-grin-hearts"></i>
                            </button>
                            <button autoupdate="atentie_client" valoare="fas fa-frown" onClick={(e) => { /* autoupdate(this) */ }} autoidcomanda="1139251" data-toggle="tooltip" data-placement="top" title="" className="col-span-1 border p-2 rounded-md" data-original-title="Morocanos">
                              <i className="fas fa-frown"></i>
                            </button>
                            <button autoupdate="atentie_client" valoare="fas fa-meh-rolling-eyes" onClick={(e) => { /* autoupdate(this) */ }} autoidcomanda="1139251" data-toggle="tooltip" data-placement="top" title="" className="col-span-1 border p-2 rounded-md" data-original-title="Pretentios">
                              <i className="fas fa-meh-rolling-eyes"></i>
                            </button>
                            <button autoupdate="atentie_client" valoare="fas fa-meh" onClick={(e) => { /* autoupdate(this) */ }} autoidcomanda="1139251" data-toggle="tooltip" data-placement="top" title="" className="col-span-1 border p-2 rounded-md" data-original-title="Indiferent">
                              <i className="fas fa-meh"></i>
                            </button>
                            <button autoupdate="atentie_client" valoare="fas fa-grin-squint" onClick={(e) => { /* autoupdate(this) */ }} autoidcomanda="1139251" data-toggle="tooltip" data-placement="top" title="" className="col-span-1 border p-2 rounded-md" data-original-title="Amuzat">
                              <i className="fas fa-grin-squint"></i>
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">





                          {/* Add Font Awesome for icons */}
                          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />



                          <div className="space-y-4">
                            {/* Status icons row */}
                            {/*<StatusBadgesRow />*/}

                            {/* Toggle switches */}
                            <ToggleOptionsGrid confirmOrder={confirmOrder} />




                          </div>
                        </div>
                      </Card>
                  )}

                  {activeTopTab === 'tab2' && (
                      <div className="p-4 bg-muted/20 rounded-md">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Mesaje SMS</h3>
                            <div className="text-sm text-muted-foreground">
                              {confirmOrder?.billing_details?._billing_phone ? (
                                  <span>Telefon: {confirmOrder.billing_details._billing_phone}</span>
                              ) : (
                                  <span className="text-red-500">Număr de telefon lipsă</span>
                              )}
                            </div>
                          </div>

                          <div className="border border-border rounded-md p-4 mb-4">
                            <div className="space-y-4">
                              {/* Error message */}
                              {smsError && (
                                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md">
                                    {smsError}
                                  </div>
                              )}

                              {/* SMS messages table */}
                              <div className="border border-border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted">
                                  <tr>
                                    <th className="py-2 px-3 text-left font-medium">Mesaj</th>
                                    <th className="py-2 px-3 text-right font-medium w-32">Data</th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  {loadingSms ? (
                                      <tr className="border-t border-border">
                                        <td colSpan={2} className="py-8 text-center">
                                          <div className="flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                                            <span className="text-muted-foreground">Se încarcă mesajele SMS...</span>
                                          </div>
                                        </td>
                                      </tr>
                                  ) : smsMessages.length > 0 ? (
                                      smsMessages.map((sms) => (
                                          <tr key={sms.id} className="border-t border-border">
                                            <td className="py-2 px-3">
                                              {/* Decode URL-encoded message */}
                                              {decodeURIComponent(sms.message.replace(/\+/g, ' '))}
                                            </td>
                                            <td className="py-2 px-3 text-right text-muted-foreground">
                                              {new Date(sms.created_at).toLocaleDateString('ro-RO', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </td>
                                          </tr>
                                      ))
                                  ) : (
                                      <tr className="border-t border-border">
                                        <td colSpan={2} className="py-4 text-center text-muted-foreground">
                                          Nu există mesaje SMS pentru acest client.
                                        </td>
                                      </tr>
                                  )}
                                  </tbody>
                                </table>
                              </div>

                              {/* SMS sending form */}
                              <div className="flex flex-col space-y-2">
                                <Label htmlFor="smsMessage" className="text-sm font-medium">Trimite SMS către client</Label>
                                <textarea
                                    id="smsMessage"
                                    className="w-full p-2 border border-border rounded-md min-h-[100px] resize-none"
                                    placeholder="Scrie mesajul SMS aici..."
                                    value={smsText}
                                    onChange={(e) => setSmsText(e.target.value)}
                                    disabled={loadingSms}
                                />
                                <div className="flex justify-between items-center">
                                  <div className="text-xs text-muted-foreground">
                                    {smsText.length} caractere
                                  </div>
                                  <Button
                                      onClick={sendSmsMessage}
                                      disabled={loadingSms || !smsText.trim() || !confirmOrder?.billing_details?._billing_phone}
                                      className="self-end"
                                  >
                                    {loadingSms ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          Se trimite...
                                        </>
                                    ) : (
                                        <>
                                          <Send className="h-4 w-4 mr-2" />
                                          Trimite SMS
                                        </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {activeTopTab === 'tab3' && (
                      <div className="p-4 bg-muted/20 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Conținut Tab 3</h3>
                        <p>Acesta este conținutul pentru al treilea tab. Încă un text simplu pentru a demonstra funcționalitatea.</p>
                      </div>
                  )}
                </div>
              </div>



            </div>

            {/* Right column (25%) - Product personalization & dynamic fields */}
            <div className="col-span-3 space-y-4 h-full ">

              <Card>
                {/* Gifts slider/list under sub-tabs: shows ~6 visible, rest scroll */}
                <GiftsSlider />

                {/* Difficulty level section */}
                <div className="w-full p-4">
                  <div className="flex items-center mb-2">
                    <div className="text-sm font-medium mr-2">Dificultate:</div>
                    {confirmOrder?.dificultate && (
                        <div className="text-xs text-muted-foreground">
                          (Valoare API: {confirmOrder.dificultate})
                        </div>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    <button

                        valoare="1"
                        onClick={(e) => { /* autoupdate(this) */ }}
                        autoidcomanda="1139251"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=""
                        className={`col-span-1 border p-2 rounded-md font-medium ${confirmOrder?.dificultate == 1 ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                        data-original-title="Foarte ușor"
                    >
                      1
                    </button>
                    <button

                        valoare="2"
                        onClick={(e) => { /* autoupdate(this) */ }}
                        autoidcomanda="1139251"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=""
                        className={`col-span-1 border p-2 rounded-md font-medium ${confirmOrder?.dificultate == 2 ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                        data-original-title="Ușor"
                    >
                      2
                    </button>
                    <button

                        valoare="3"
                        onClick={(e) => { /* autoupdate(this) */ }}
                        autoidcomanda="1139251"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=""
                        className={`col-span-1 border p-2 rounded-md font-medium ${confirmOrder?.dificultate == 3 ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                        data-original-title="Mediu"
                    >
                      3
                    </button>
                    <button

                        valoare="4"
                        onClick={(e) => { /* autoupdate(this) */ }}
                        autoidcomanda="1139251"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=""
                        className={`col-span-1 border p-2 rounded-md font-medium ${confirmOrder?.dificultate == 4 ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                        data-original-title="Dificil"
                    >
                      4
                    </button>
                    {}
                    <button

                        valoare="5"
                        onClick={(e) => { /* autoupdate(this) */ }}
                        autoidcomanda="1139251"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=""
                        className={`col-span-1 border p-2 rounded-md font-medium ${confirmOrder?.dificultate == 5 ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                        data-original-title="Foarte dificil"
                    >
                      5
                    </button>
                  </div>
                </div>



                <div className="p-4 ">
                  <div className="flex items-center justify-between mb-4 ">
                    <h3 className="font-semibold text-lg">Detalii produs & personalizare</h3>
                    <Badge variant={isOrderPaid(confirmOrder) ? 'success' : 'outline'}>
                      {confirmOrder?.order_total_formatted || confirmOrder?.pret_total || "-"} /
                      {isOrderPaid(confirmOrder) ? ' plătit' : ' neplătit'}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {confirmOrder?.produse_finale.map((produs, idx) => (
                        <ProductPersonalizationCard key={idx} produs={produs} idx={idx} />
                    ))}

                    <Button className="w-full">
                      Actualizează
                    </Button>
                  </div>
                </div>
              </Card>
            </div>



            {/* Notes column (25%) - Order notes */}
            <div className="col-span-2 space-y-4 h-full">
              <Card className="h-full flex flex-col">
                <div className="p-4 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg">Notițe</h3>
                  </div>
                  {/* Chat-like interface for adding notes */}
                  <div className="mb-4">
                    <div className="flex items-end gap-2">
                      <textarea 
                        className="flex-grow p-2 border border-border rounded-md min-h-[60px] resize-none"
                        placeholder="Scrie o notiță..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                      />
                      <Button 
                        className="h-10 px-3" 
                        onClick={() => {
                          if (noteText.trim()) {
                            console.log('Sending note:', noteText, 'for order:', confirmOrder?.ID);
                            // Here you would typically call an API to add the note
                            setNoteText('');
                          }
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-grow">
                    {Array.isArray(confirmOrder?.notes) && confirmOrder.notes.length > 0 ? (
                        confirmOrder.notes.map((note, idx) => (
                            <div key={idx} className="border border-border rounded-md p-3">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">Admin</span>
                                <span className="text-xs text-muted-foreground">{note.comment_date}</span>
                              </div>
                              <p className="text-sm">{note.comment_content}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-muted-foreground">Nu există notițe pentru această comandă.</div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 bg-background border-t border-border p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="text-green-500 animate-pulse">✓ Salvat automat</span>
            <button className="ml-3 text-primary hover:underline">Jurnal modificări</button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Închide
            </Button>

            <Button variant="default" onClick={() => {
              // Here you would implement the confirmation logic
              alert('Comandă confirmată!');
              setShowConfirmModal(false);
            }}>
              Confirma comanda
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Verify Payment Modal */}
      {showVerifyPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowVerifyPaymentModal(false)} />
          <div className="relative bg-background p-6 rounded-lg shadow-lg w-[500px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Verificare plată</h2>
              <button 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowVerifyPaymentModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4">
              {/* Empty modal content as per requirements */}
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowVerifyPaymentModal(false)}
              >
                Închide
              </Button>
            </div>
          </div>
        </div>
      )}

    </Dialog>
  );
};

export default ConfirmOrderDialog;
