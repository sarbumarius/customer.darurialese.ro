import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GooglePlacesAutocomplete } from "@/components/ui/google-places-autocomplete";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import StatusBadgesRow from "@/components/content/StatusBadgesRow";
import ToggleOptionsGrid from "@/components/content/ToggleOptionsGrid";
import ConfirmationSelects from "@/components/content/ConfirmationSelects";
import ProductPersonalizationCard from "@/components/content/ProductPersonalizationCard";
import OrderSummary from "@/components/content/OrderSummary";
import GiftsSlider from "@/components/content/GiftsSlider";
import { Gift, CalendarClock, PhoneCall, X, ImageOff, Cog, Send, Loader2, User, ShoppingBag, Eye, Info, Mail, MessageSquare, CheckCircle, FileText, CreditCard, Users, ChevronRight, Check, ChevronUp } from "lucide-react";
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

// Interface for Points data (old structure - keeping for compatibility)
interface PuncteData {
  ID: number;
  customer_user: string;
  shipping_details: {
    _shipping_first_name: string;
    _shipping_last_name?: string;
    _shipping_address_1?: string;
    _shipping_city?: string;
    _shipping_state?: string;
    _shipping_postcode?: string;
    _shipping_phone?: string;
  };
  billing_details?: {
    _billing_first_name?: string;
    _billing_last_name?: string;
    _billing_phone?: string;
    _billing_email?: string;
  };
  puncte?: number;
  total_comenzi?: number;
  data_ultima_comanda?: string;
}

// Interface for Points History data (new structure as requested)
interface PuncteHistoryItem {
  id: number;
  points: number;
  type: string;
  user_points_id: number | null;
  order_id: number | null;
  admin_user_id: number | null;
  data: string | null;
  date: string;
}

// Map configuration
const mapContainerStyle = { width: "100%", height: "300px", borderRadius: "0.5rem" };
const defaultCenter = { lat: 44.4268, lng: 26.1025 }; // București
const libraries: ("places")[] = ["places"];

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
  activeConfirmTab: 'confirmare' | 'puncte' | 'persoane';
  setActiveConfirmTab: (t: 'confirmare' | 'puncte' | 'persoane') => void;
  activeAddressTab: 'shipping' | 'billing';
  setActiveAddressTab: (t: 'shipping' | 'billing') => void;
  refreshUserData?: (orderId: number) => Promise<void>;
}

export const ConfirmOrderDialog: React.FC<ConfirmOrderDialogProps> = ({
  open,
  onOpenChange,
  confirmOrder,
  activeConfirmTab,
  setActiveConfirmTab,
  activeAddressTab,
  setActiveAddressTab,
  refreshUserData,
}) => {
  // console.log("ConfirmOrderDialog rendered with activeConfirmTab:", activeConfirmTab);
  // State for the note textarea
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);
  const [deletingNote, setDeletingNote] = useState<number | null>(null);

  // State for the verify payment modal
  const [showVerifyPaymentModal, setShowVerifyPaymentModal] = useState(false);

  // State for the client orders modal
  const [showClientOrdersModal, setShowClientOrdersModal] = useState(false);

  // State for updating gift status
  const [isUpdatingGift, setIsUpdatingGift] = useState(false);

  // State for the top tabs
  const [activeTopTab, setActiveTopTab] = useState<'tab1' | 'tab3' | 'tab4'>('tab1');

  // State for the notes tabs
  const [activeNotesTab, setActiveNotesTab] = useState<'notite' | 'sms' | 'puncte' | 'persoane'>('notite');

  // State for SMS messages
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [loadingSms, setLoadingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsText, setSmsText] = useState("");
  const [selectedSmsPhone, setSelectedSmsPhone] = useState<string>("");

  // State for Points data (old structure)
  const [puncteData, setPuncteData] = useState<PuncteData[]>([]);
  const [loadingPuncte, setLoadingPuncte] = useState(false);
  const [puncteError, setPuncteError] = useState<string | null>(null);

  // State for Points History data (new structure)
  const [puncteHistory, setPuncteHistory] = useState<PuncteHistoryItem[]>([]);
  const [loadingPuncteHistory, setLoadingPuncteHistory] = useState(false);
  const [puncteHistoryError, setPuncteHistoryError] = useState<string | null>(null);

  // State for adding points
  const [puncteInput, setPuncteInput] = useState<string>("");
  const [motivInput, setMotivInput] = useState<string>("");
  const [addingPuncte, setAddingPuncte] = useState(false);
  const [puncteAddError, setPuncteAddError] = useState<string | null>(null);
  const [puncteAddSuccess, setPuncteAddSuccess] = useState<string | null>(null);

  // State for email and WhatsApp sending
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState<string | null>(null);

  // State for motiv neconfirmare
  const [selectedReason, setSelectedReason] = useState<string>("Clientul nu raspunde");
  const [addingMotive, setAddingMotive] = useState(false);
  const [deletingMotive, setDeletingMotive] = useState<number | null>(null);
  const [motiveError, setMotiveError] = useState<string | null>(null);
  const [motiveSuccess, setMotiveSuccess] = useState<string | null>(null);
  const [isMotiveHistoryCollapsed, setIsMotiveHistoryCollapsed] = useState<boolean>(true);

  // Local state for motives list (for immediate visual updates)
  const [localMotives, setLocalMotives] = useState<Array<{
    motiv_neconfirmare: string;
    data_si_ora: string;
  }>>([]);

  // Local state for notes list (for immediate visual updates)
  const [localNotes, setLocalNotes] = useState<Array<{
    comment_content: string;
    comment_date: string;
    comment_ID: number;
  }>>([]);

  // State for difficulty level
  const [difficulty, setDifficulty] = useState<string>("1");

  // State for client mood
  const [clientMood, setClientMood] = useState<string>("");

  // State for loading status of API calls
  const [loadingField, setLoadingField] = useState<string | null>(null);

  // State for visual field values to update after API calls
  const [shippingState, setShippingState] = useState<string>("");
  const [shippingCity, setShippingCity] = useState<string>("");
  const [shippingPostalCode, setShippingPostalCode] = useState<string>("");
  const [billingState, setBillingState] = useState<string>("");
  const [billingCity, setBillingCity] = useState<string>("");
  const [billingPostalCode, setBillingPostalCode] = useState<string>("");

  // State for map location
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // State for FanCourier additional kilometers check
  const [fanCourierKmCheck, setFanCourierKmCheck] = useState<{
    hasAdditionalKm: boolean;
    kmValue: string;
    locality: string;
    county: string;
    checked: boolean;
  } | null>(null);

  // State for SameDay additional kilometers check
  const [samedayKmCheck, setSamedayKmCheck] = useState<{
    hasAdditionalKm: boolean;
    kmValue: string;
    locality: string;
    county: string;
    checked: boolean;
  } | null>(null);

  // State for scroll-to-top button
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Refs for accessing the GooglePlacesAutocomplete values
  const shippingAddressRef = useRef<{ getValue: () => string }>(null);
  const billingAddressRef = useRef<{ getValue: () => string }>(null);

  // Function to compare shipping and billing addresses and get differences
  const getAddressDifferences = () => {
    if (!confirmOrder) return null;

    const shipping = confirmOrder.shipping_details;
    const billing = confirmOrder.billing_details;

    const differences: string[] = [];

    // Compare first name
    const shippingFirstName = shipping?._shipping_first_name || "";
    const billingFirstName = billing?._billing_first_name || "";
    if (shippingFirstName !== billingFirstName) {
      differences.push(`Nume: "${shippingFirstName}" vs "${billingFirstName}"`);
    }

    // Compare last name
    const shippingLastName = shipping?._shipping_last_name || "";
    const billingLastName = billing?._billing_last_name || "";
    if (shippingLastName !== billingLastName) {
      differences.push(`Prenume: "${shippingLastName}" vs "${billingLastName}"`);
    }

    // Compare phone (shipping uses billing phone, so we compare with billing phone)
    const shippingPhone = billing?._billing_phone || "";
    const billingPhone = billing?._billing_phone || "";
    // Phone is typically the same, so we don't compare it

    // Compare address 1
    const shippingAddress1 = shipping?._shipping_address_1 || "";
    const billingAddress1 = billing?._billing_address_1 || "";
    if (shippingAddress1 !== billingAddress1) {
      differences.push(`Adresă: "${shippingAddress1}" vs "${billingAddress1}"`);
    }

    // Compare address 2
    const shippingAddress2 = shipping?._shipping_address_2 || "";
    const billingAddress2 = billing?._billing_address_2 || "";
    if (shippingAddress2 !== billingAddress2) {
      differences.push(`Detalii adresă: "${shippingAddress2}" vs "${billingAddress2}"`);
    }

    // Compare state (county)
    const shippingStateValue = shippingState || shipping?._shipping_state || "";
    const billingStateValue = billingState || billing?._billing_state || "";
    if (shippingStateValue !== billingStateValue) {
      differences.push(`Județ: "${shippingStateValue}" vs "${billingStateValue}"`);
    }

    // Compare city
    const shippingCityValue = shippingCity || shipping?._shipping_city || "";
    const billingCityValue = billingCity || billing?._billing_city || "";
    if (shippingCityValue !== billingCityValue) {
      differences.push(`Localitate: "${shippingCityValue}" vs "${billingCityValue}"`);
    }

    // Compare postal code
    const shippingPostalCodeValue = shippingPostalCode || shipping?._shipping_postcode || "";
    const billingPostalCodeValue = billingPostalCode || billing?._billing_postcode || "";
    if (shippingPostalCodeValue !== billingPostalCodeValue) {
      differences.push(`Cod poștal: "${shippingPostalCodeValue}" vs "${billingPostalCodeValue}"`);
    }

    return differences.length > 0 ? differences : null;
  };

  // State for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);

  // State for payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);

  // Utility function to normalize names for FanCourier matching
  const normalizeNameForMatching = (name: string): string => {
    if (!name) return "";

    // Remove "County" suffix (case insensitive)
    let normalized = name.replace(/\s+county$/i, "").trim();

    // Remove "Județul " prefix (case insensitive)
    normalized = normalized.replace(/^județul\s+/i, "");

    // Remove diacritics
    const diacriticsMap: { [key: string]: string } = {
      'ă': 'a', 'Ă': 'A',
      'â': 'a', 'Â': 'A', 
      'î': 'i', 'Î': 'I',
      'ș': 's', 'Ș': 'S',
      'ț': 't', 'Ț': 'T'
    };

    normalized = normalized.replace(/[ăâîșțĂÂÎȘȚ]/g, (match) => diacriticsMap[match] || match);

    return normalized.toLowerCase().trim();
  };

  // Function to check FanCourier additional kilometers
  const checkFanCourierAdditionalKm = async (county: string, locality: string) => {
    try {
      console.log(`🚚 Verific km suplimentari FanCourier pentru: ${locality}, ${county}`);

      // Normalize input values for matching
      const normalizedLocality = normalizeNameForMatching(locality);
      const normalizedCounty = normalizeNameForMatching(county);

      console.log(`🚚 Valori normalizate pentru căutare: ${normalizedLocality}, ${normalizedCounty}`);

      // Fetch the CSV file
      const response = await fetch('/liste/km-fan-suplimentari.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }

      const csvText = await response.text();
      const lines = csvText.split('\n');

      // Skip header line and process data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handle quoted values)
        const matches = line.match(/("([^"]*)"|[^",]+)/g);
        if (!matches || matches.length < 4) continue;

        const csvLocalitate = matches[0].replace(/"/g, '').trim();
        const csvJudet = matches[1].replace(/"/g, '').trim();
        const csvAgentie = matches[2].replace(/"/g, '').trim();
        const csvKm = matches[3].replace(/"/g, '').trim();

        // Normalize CSV values for matching
        const normalizedCsvLocalitate = normalizeNameForMatching(csvLocalitate);
        const normalizedCsvJudet = normalizeNameForMatching(csvJudet);

        // Check for match (normalized comparison)
        if (normalizedCsvLocalitate === normalizedLocality && 
            normalizedCsvJudet === normalizedCounty) {

          const hasAdditionalKm = csvKm !== "" && csvKm !== "0";

          console.log(`🚚 Găsit în CSV: ${csvLocalitate}, ${csvJudet}, Agenție: ${csvAgentie}, KM: "${csvKm}"`);
          console.log(`🚚 Match găsit cu valorile normalizate: "${normalizedCsvLocalitate}" === "${normalizedLocality}" și "${normalizedCsvJudet}" === "${normalizedCounty}"`);

          setFanCourierKmCheck({
            hasAdditionalKm,
            kmValue: csvKm,
            locality: csvLocalitate,
            county: csvJudet,
            checked: true
          });

          return;
        }
      }

      // No match found
      console.log(`🚚 Nu s-a găsit în CSV: ${locality}, ${county}`);
      console.log(`🚚 Căutat cu valorile normalizate: ${normalizedLocality}, ${normalizedCounty}`);
      setFanCourierKmCheck({
        hasAdditionalKm: false,
        kmValue: "",
        locality,
        county,
        checked: true
      });

    } catch (error) {
      console.error('Error checking FanCourier additional km:', error);
      setFanCourierKmCheck({
        hasAdditionalKm: false,
        kmValue: "",
        locality,
        county,
        checked: true
      });
    }
  };

  // Function to check SameDay additional kilometers
  const checkSamedayAdditionalKm = async (county: string, locality: string) => {
    try {
      console.log(`📦 Verific km suplimentari SameDay pentru: ${locality}, ${county}`);

      // Normalize input values for matching
      const normalizedLocality = normalizeNameForMatching(locality);
      const normalizedCounty = normalizeNameForMatching(county);

      console.log(`📦 Valori normalizate pentru căutare: ${normalizedLocality}, ${normalizedCounty}`);

      // Fetch the CSV file
      const response = await fetch('/liste/km-sameday-suplimentari.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch SameDay CSV file');
      }

      const csvText = await response.text();
      const lines = csvText.split('\n');

      // Skip header line and process data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (SameDay CSV doesn't have quotes, comma-separated)
        const columns = line.split(',');
        if (columns.length < 4) continue;

        const csvLocalitate = columns[0].trim();
        const csvJudet = columns[1].trim();
        const csvComuna = columns[2].trim();
        const csvKm = columns[3].trim();

        // Normalize CSV values for matching
        const normalizedCsvLocalitate = normalizeNameForMatching(csvLocalitate);
        const normalizedCsvJudet = normalizeNameForMatching(csvJudet);

        // Check for match (normalized comparison)
        if (normalizedCsvLocalitate === normalizedLocality && 
            normalizedCsvJudet === normalizedCounty) {

          const hasAdditionalKm = csvKm !== "" && csvKm !== "0";

          console.log(`📦 Găsit în CSV: ${csvLocalitate}, ${csvJudet}, Comuna: ${csvComuna}, KM: "${csvKm}"`);
          console.log(`📦 Match găsit cu valorile normalizate: "${normalizedCsvLocalitate}" === "${normalizedLocality}" și "${normalizedCsvJudet}" === "${normalizedCounty}"`);

          setSamedayKmCheck({
            hasAdditionalKm,
            kmValue: csvKm,
            locality: csvLocalitate,
            county: csvJudet,
            checked: true
          });

          return;
        }
      }

      // No match found
      console.log(`📦 Nu s-a găsit în CSV: ${locality}, ${county}`);
      console.log(`📦 Căutat cu valorile normalizate: ${normalizedLocality}, ${normalizedCounty}`);
      setSamedayKmCheck({
        hasAdditionalKm: false,
        kmValue: "",
        locality,
        county,
        checked: true
      });

    } catch (error) {
      console.error('Error checking SameDay additional km:', error);
      setSamedayKmCheck({
        hasAdditionalKm: false,
        kmValue: "",
        locality,
        county,
        checked: true
      });
    }
  };

  // Generic function to handle changes to shipping details
  const handleShippingDetailChange = async (field: string, value: string) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    const loadingKey = `shipping_${field}`;
    setLoadingField(loadingKey);

    try {
      const response = await fetch(`https://crm.actium.ro/api/change/shipping/${field}/${confirmOrder.ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      if (field === 'state') {
        console.log(`🏛️ Județ pentru livrare trimis cu succes: "${value}" către API: https://crm.actium.ro/api/change/shipping/state/${confirmOrder.ID}`);
        setShippingState(value); // Update visual state
      } else if (field === 'city') {
        console.log(`Shipping ${field} updated successfully to ${value}`);
        setShippingCity(value); // Update visual state
      } else if (field === 'postcode') {
        console.log(`Shipping ${field} updated successfully to ${value}`);
        setShippingPostalCode(value); // Update visual state
      } else {
        console.log(`Shipping ${field} updated successfully to ${value}`);
      }
    } catch (error) {
      console.error(`Error updating shipping ${field}:`, error);
    } finally {
      setLoadingField(null);
    }
  };

  // Generic function to handle changes to billing details
  const handleBillingDetailChange = async (field: string, value: string) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    const loadingKey = `billing_${field}`;
    setLoadingField(loadingKey);

    try {
      const response = await fetch(`https://crm.actium.ro/api/change/billing/${field}/${confirmOrder.ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      if (field === 'state') {
        console.log(`🏛️ Județ pentru facturare trimis cu succes: "${value}" către API: https://crm.actium.ro/api/change/billing/state/${confirmOrder.ID}`);
        setBillingState(value); // Update visual state
      } else if (field === 'city') {
        console.log(`Billing ${field} updated successfully to ${value}`);
        setBillingCity(value); // Update visual state
      } else if (field === 'postcode') {
        console.log(`Billing ${field} updated successfully to ${value}`);
        setBillingPostalCode(value); // Update visual state
      } else {
        console.log(`Billing ${field} updated successfully to ${value}`);
      }
    } catch (error) {
      console.error(`Error updating billing ${field}:`, error);
    } finally {
      setLoadingField(null);
    }
  };

  // Function to copy shipping data to billing
  const copyShippingToBilling = async () => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    console.log('🔄 Copiez datele de livrare la facturare...');

    try {
      // Get current shipping values
      const shippingData = {
        first_name: confirmOrder.shipping_details?._shipping_first_name || "",
        last_name: confirmOrder.shipping_details?._shipping_last_name || "",
        phone: confirmOrder.billing_details?._billing_phone || "", // Phone is usually from billing
        address_1: shippingAddressRef.current?.getValue() || confirmOrder.shipping_details?._shipping_address_1 || "",
        address_2: confirmOrder.shipping_details?._shipping_address_2 || "",
        state: shippingState || confirmOrder.shipping_details?._shipping_state || "",
        city: shippingCity || confirmOrder.shipping_details?._shipping_city || "",
        postcode: shippingPostalCode || confirmOrder.shipping_details?._shipping_postcode || ""
      };

      console.log('📋 Date de copiat:', shippingData);

      // Copy each field to billing using the API
      const copyPromises = [];

      if (shippingData.first_name !== undefined) {
        copyPromises.push(handleBillingDetailChange("first_name", shippingData.first_name));
      }
      if (shippingData.last_name !== undefined) {
        copyPromises.push(handleBillingDetailChange("last_name", shippingData.last_name));
      }
      if (shippingData.phone !== undefined) {
        copyPromises.push(handleBillingDetailChange("phone", shippingData.phone));
      }
      if (shippingData.address_1 !== undefined) {
        copyPromises.push(handleBillingDetailChange("address_1", shippingData.address_1));
      }
      if (shippingData.address_2 !== undefined) {
        copyPromises.push(handleBillingDetailChange("address_2", shippingData.address_2));
      }
      if (shippingData.state !== undefined) {
        copyPromises.push(handleBillingDetailChange("state", shippingData.state));
      }
      if (shippingData.city !== undefined) {
        copyPromises.push(handleBillingDetailChange("city", shippingData.city));
      }
      if (shippingData.postcode !== undefined) {
        copyPromises.push(handleBillingDetailChange("postcode", shippingData.postcode));
      }

      // Wait for all API calls to complete
      await Promise.all(copyPromises);

      console.log('✅ Datele au fost copiate cu succes de la livrare la facturare!');

      // Switch to billing tab to show the copied data
      setActiveAddressTab('billing');

    } catch (error) {
      console.error('❌ Eroare la copierea datelor:', error);
    }
  };

  // Function to handle payment method changes and call API
  const handlePaymentMethodChange = async (paymentMethodTitle: string) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    // Map payment method titles to API method values
    const methodMapping: { [key: string]: string } = {
      'Plata ramburs': 'cod',
      'Transfer bancar direct': 'bacs',
      'Plata cu cardul Mobilpay': 'netopiapayments'
    };

    const apiMethod = methodMapping[paymentMethodTitle];
    if (!apiMethod) {
      console.error('Invalid payment method:', paymentMethodTitle);
      return;
    }

    setLoadingPaymentMethod(true);

    try {
      console.log(`💳 Schimb metoda de plată la "${paymentMethodTitle}" (${apiMethod}) pentru comanda ${confirmOrder.ID}`);

      const response = await fetch(`https://crm.actium.ro/api/change-metoda-plata/${confirmOrder.ID}/${apiMethod}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Metoda de plată actualizată cu succes:', data);

      // Update local state
      setSelectedPaymentMethod(paymentMethodTitle);

      // Optionally show success message or update UI
      if (data.success) {
        console.log(`💳 ${data.message}`);

        // Refresh user data from API to ensure all UI components have the latest data
        if (refreshUserData) {
          await refreshUserData(confirmOrder.ID);
        }
      }

    } catch (error) {
      console.error('❌ Eroare la actualizarea metodei de plată:', error);
      // Optionally show error message to user
    } finally {
      setLoadingPaymentMethod(false);
    }
  };

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

    const phoneNumber = selectedSmsPhone;

    if (!phoneNumber) {
      setSmsError("Număr de telefon lipsă");
      return;
    }

    setLoadingSms(true);
    setSmsError(null);

    try {
      console.log("Sending SMS to", phoneNumber, "with message:", smsText);

      // Clean phone number - remove +4 prefix if present
      const cleanPhoneNumber = phoneNumber.replace(/^\+4/, '');

      // Make the actual API call to send SMS using the new endpoint
      const response = await fetch('https://crm.actium.ro/api/sendsmsonline', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          smsto: encodeURIComponent(cleanPhoneNumber),
          smsbody: encodeURIComponent(smsText),
          smstype: 'sms',
          token: 'Q6^G08236WyWU$DCjMO!$4llPyLC6yBpFl',
          category: 'manual',
          tip: 'trimis'
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

  // Function to fetch Points data
  const fetchPuncte = async (customerUser: string) => {
    if (!customerUser) {
      setPuncteError("Customer user lipsă");
      return;
    }

    setLoadingPuncte(true);
    setPuncteError(null);

    try {
      console.log("Fetching points data for customer:", confirmOrder.customer_user);

      const apiUrl = `https://crm.actium.ro/api/puncte-client/${confirmOrder.customer_user}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Points data received:", data);

      if (Array.isArray(data)) {
        setPuncteData(data);
      } else {
        setPuncteData([]);
      }
    } catch (error) {
      console.error("Error fetching points data:", error);
      setPuncteError("Eroare la încărcarea datelor de puncte: " + (error.message || "Eroare necunoscută"));
    } finally {
      setLoadingPuncte(false);
    }
  };

  // Function to fetch Points History data (new structure as requested)
  const fetchPuncteHistory = async (customerUser: string) => {
    if (!customerUser) {
      setPuncteHistoryError("Customer user lipsă");
      return;
    }

    setLoadingPuncteHistory(true);
    setPuncteHistoryError(null);

    try {
      console.log("Fetching points history data for customer:", confirmOrder.customer_user);
      // Using the same API endpoint but expecting different data structure
      const apiUrl = `https://crm.actium.ro/api/puncte-client/${confirmOrder.customer_user}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Points history data received:", data);

      if (Array.isArray(data)) {
        // Sort by date (newest first) as requested
        const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPuncteHistory(sortedData);
      } else {
        setPuncteHistory([]);
      }
    } catch (error) {
      console.error("Error fetching points history data:", error);
      setPuncteHistoryError("Eroare la încărcarea istoricului de puncte: " + (error.message || "Eroare necunoscută"));
    } finally {
      setLoadingPuncteHistory(false);
    }
  };

  // Function to add points
  const addPuncte = async () => {
    if (!confirmOrder?.customer_user) {
      setPuncteAddError("Customer user lipsă");
      return;
    }

    if (!puncteInput.trim()) {
      setPuncteAddError("Numărul de puncte nu poate fi gol");
      return;
    }

    if (!motivInput.trim()) {
      setPuncteAddError("Motivul nu poate fi gol");
      return;
    }

    const puncteValue = parseInt(puncteInput.trim());
    if (isNaN(puncteValue)) {
      setPuncteAddError("Numărul de puncte trebuie să fie un număr valid");
      return;
    }

    setAddingPuncte(true);
    setPuncteAddError(null);
    setPuncteAddSuccess(null);

    try {
      console.log(`📝 Adaug ${puncteValue} puncte pentru clientul ${confirmOrder.customer_user} cu motivul: ${motivInput.trim()}`);

      const response = await fetch(`https://crm.actium.ro/api/adauga-puncte-client/${confirmOrder.customer_user}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: puncteValue,
          type: motivInput.trim(),
          order_id: confirmOrder.ID || null,
          data: null
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Puncte adăugate cu succes:', data);

      if (data.success) {
        // Update points history with the response data
        if (data.points_log && Array.isArray(data.points_log)) {
          // Sort by date (newest first) as requested
          const sortedData = data.points_log.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setPuncteHistory(sortedData);
        }

        setPuncteAddSuccess(`${puncteValue} puncte au fost adăugate cu succes`);
        setPuncteInput(''); // Clear the inputs
        setMotivInput('');

        // Clear success message after 3 seconds
        setTimeout(() => setPuncteAddSuccess(null), 3000);

        // Refresh user data from API to ensure all UI components have the latest data
        if (refreshUserData && confirmOrder.ID) {
          await refreshUserData(confirmOrder.ID);
        }
      }

    } catch (error) {
      console.error('❌ Eroare la adăugarea punctelor:', error);
      setPuncteAddError(`Eroare la adăugarea punctelor: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setAddingPuncte(false);
    }
  };

  // Function to create billing message template
  const createBillingMessage = () => {
    if (!confirmOrder) return '';

    const customerName = `${confirmOrder.billing_details?._billing_first_name || confirmOrder.shipping_details._shipping_first_name} ${confirmOrder.billing_details?._billing_last_name || confirmOrder.shipping_details._shipping_last_name}`;
    const totalAmount = confirmOrder.pret_total || confirmOrder.order_total_formatted || '0';
    const totalItems = confirmOrder.total_buc || 1;
    const orderId = confirmOrder.ID;

    return `Bună ziua, ${customerName},

Așa cum am discutat, revenim cu detaliile conturilor bancare pentru achitarea comenzii #${orderId}.

Detalii comandă:
• Total articole: ${totalItems}
• Total de plată: ${totalAmount} RON

Conturi disponibile pentru transfer bancar:

Banca Transilvania
IBAN: RO60BTRLRONCRT0415555501

ING Bank România
IBAN: RO74INGB0000999906973879

Trezorerie operativă Sector 5
IBAN: RO65TREZ7055069XXX012556

Vă rugăm să menționați numărul comenzii #${orderId} în descrierea transferului.

Cu stimă,
Echipa Daruri Alese`;
  };

  // Function to send email with billing information
  const sendBillingEmail = async () => {
    if (!confirmOrder?.billing_details?._billing_email) {
      setEmailError("Adresa de email pentru facturare lipsește");
      return;
    }

    setSendingEmail(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      console.log(`📧 Trimit email cu informații de facturare la: ${confirmOrder.billing_details._billing_email}`);

      const message = createBillingMessage();

      // Send email using the API endpoint
      const response = await fetch('https://crm.actium.ro/api/trimitere-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: confirmOrder.billing_details._billing_email,
          message: message,
          subject: 'Conturi bancare Perfect Gift SRL (Brand Daruri Alese)'
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Email trimis cu succes:', data);

      if (data.success) {
        setEmailSuccess('Email-ul a fost trimis cu succes către client');
      } else {
        throw new Error(data.message || 'Eroare la trimiterea email-ului');
      }

      // Clear success message after 5 seconds
      setTimeout(() => setEmailSuccess(null), 5000);

    } catch (error) {
      console.error('❌ Eroare la trimiterea email-ului:', error);
      setEmailError(`Eroare la trimiterea email-ului: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Function to send WhatsApp message with billing information
  const sendBillingWhatsApp = async () => {
    const phoneNumber = confirmOrder?.billing_details?._billing_phone || confirmOrder?.shipping_details._shipping_phone;

    if (!phoneNumber) {
      setWhatsAppError("Numărul de telefon pentru facturare lipsește");
      return;
    }

    setSendingWhatsApp(true);
    setWhatsAppError(null);
    setWhatsAppSuccess(null);

    try {
      console.log(`📱 Trimit mesaj WhatsApp cu informații de facturare la: ${phoneNumber}`);

      const message = createBillingMessage();

      // Clean phone number - remove spaces, dashes, and ensure it starts with country code
      let cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '40' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('40')) {
        cleanPhone = '40' + cleanPhone;
      }

      // Create WhatsApp link
      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp link
      window.open(whatsappLink, '_blank');

      setWhatsAppSuccess('WhatsApp a fost deschis cu mesajul pregătit');

      // Clear success message after 5 seconds
      setTimeout(() => setWhatsAppSuccess(null), 5000);

    } catch (error) {
      console.error('❌ Eroare la trimiterea mesajului WhatsApp:', error);
      setWhatsAppError(`Eroare la trimiterea mesajului WhatsApp: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Function to add a new motiv neconfirmare
  const addMotivNeconfirmare = async () => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      setMotiveError('ID comandă lipsă');
      return;
    }

    if (!selectedReason || selectedReason === "Selecteaza") {
      setMotiveError('Vă rugăm să selectați un motiv');
      return;
    }

    setAddingMotive(true);
    setMotiveError(null);
    setMotiveSuccess(null);

    try {
      console.log(`📝 Adaug motiv neconfirmare: "${selectedReason}" pentru comanda ${confirmOrder.ID}`);

      const response = await fetch(`https://crm.actium.ro/api/add-motiv-neconfirmare/${confirmOrder.ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motiv_neconfirmare: selectedReason
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Motiv neconfirmare adăugat cu succes:', data);

      if (data.success) {
        console.log(`📝 ${data.message}`);
        setMotiveSuccess('Motivul a fost adăugat cu succes');

        // Update the local motives state for immediate visual feedback
        if (data.data) {
          const newMotive = {
            motiv_neconfirmare: data.data.motiv_neconfirmare,
            data_si_ora: data.data.data_si_ora
          };

          // Add the new motive to the local state
          setLocalMotives(prevMotives => [...prevMotives, newMotive]);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setMotiveSuccess(null), 3000);
      }

    } catch (error) {
      console.error('❌ Eroare la adăugarea motivului de neconfirmare:', error);
      setMotiveError(`Eroare la adăugarea motivului: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setAddingMotive(false);
    }
  };

  // Function to delete a motiv neconfirmare
  const deleteMotivNeconfirmare = async (index: number) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      setMotiveError('ID comandă lipsă');
      return;
    }

    setDeletingMotive(index);
    setMotiveError(null);
    setMotiveSuccess(null);

    try {
      console.log(`🗑️ Șterg motiv neconfirmare cu indexul ${index} pentru comanda ${confirmOrder.ID}`);

      const response = await fetch(`https://crm.actium.ro/api/delete-motiv-neconfirmare/${confirmOrder.ID}/${index}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Motiv neconfirmare șters cu succes:', data);

      if (data.success) {
        console.log(`🗑️ ${data.message}`);
        setMotiveSuccess('Motivul a fost șters cu succes');

        // Update the local motives state for immediate visual feedback
        setLocalMotives(prevMotives => prevMotives.filter((_, i) => i !== index));

        // Clear success message after 3 seconds
        setTimeout(() => setMotiveSuccess(null), 3000);
      }

    } catch (error) {
      console.error('❌ Eroare la ștergerea motivului de neconfirmare:', error);
      setMotiveError(`Eroare la ștergerea motivului: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setDeletingMotive(null);
    }
  };

  // Function to add a new note
  const addNote = async () => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      setNoteError('ID comandă lipsă');
      return;
    }

    if (!noteText.trim()) {
      setNoteError('Notița nu poate fi goală');
      return;
    }

    setAddingNote(true);
    setNoteError(null);
    setNoteSuccess(null);

    try {
      console.log(`📝 Adaug notița: "${noteText}" pentru comanda ${confirmOrder.ID}`);

      const response = await fetch(`https://crm.actium.ro/api/adauga-notita/${confirmOrder.ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: noteText.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Notița adăugată cu succes:', data);

      if (data.success) {
        console.log(`📝 ${data.message}`);
        setNoteSuccess('Notița a fost adăugată cu succes');

        // Add the new note to the local notes list for immediate visual feedback
        const newNote = {
          comment_content: noteText.trim(),
          comment_date: new Date().toISOString()
        };

        // Add the new note to the beginning of the local notes array
        setLocalNotes(prevNotes => [newNote, ...prevNotes]);

        // Clear the note text and success message
        setNoteText('');
        setTimeout(() => setNoteSuccess(null), 3000);
      }

    } catch (error) {
      console.error('❌ Eroare la adăugarea notiței:', error);
      setNoteError(`Eroare la adăugarea notiței: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setAddingNote(false);
    }
  };

  // Function to delete a note
  const deleteNote = async (noteId: number, noteIndex: number) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      setNoteError('ID comandă lipsă');
      return;
    }

    if (!noteId) {
      setNoteError('ID notița lipsă');
      return;
    }

    setDeletingNote(noteId);
    setNoteError(null);
    setNoteSuccess(null);

    try {
      console.log(`🗑️ Șterg notița cu ID ${noteId} pentru comanda ${confirmOrder.ID}`);

      const response = await fetch(`https://crm.actium.ro/api/sterge-notita/${confirmOrder.ID}/${noteId}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Notița ștearsă cu succes:', data);

      if (data.success) {
        console.log(`🗑️ ${data.message}`);
        setNoteSuccess('Notița a fost ștearsă cu succes');

        // Remove the note from the local notes list for immediate visual feedback
        setLocalNotes(prevNotes => prevNotes.filter((_, index) => index !== noteIndex));

        // Clear success message after 3 seconds
        setTimeout(() => setNoteSuccess(null), 3000);
      }

    } catch (error) {
      console.error('❌ Eroare la ștergerea notiței:', error);
      setNoteError(`Eroare la ștergerea notiței: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setDeletingNote(null);
    }
  };

  // No hash-based navigation - we'll use direct tab switching instead


  // Initialize difficulty state and client mood when confirmOrder changes
  useEffect(() => {
    // Reset tabs to default when opening dialog for a different client
    setActiveNotesTab('notite');

    // Reset points input fields when switching clients
    setPuncteInput('');
    setMotivInput('');

    if (confirmOrder?.dificultate) {
      setDifficulty(confirmOrder.dificultate.toString());
    } else {
      setDifficulty("1");
    }

    // Initialize client mood from mood_client if available
    if ((confirmOrder as any)?.mood_client) {
      setClientMood((confirmOrder as any).mood_client);
      console.log("Setting client mood from API:", (confirmOrder as any).mood_client);
    } else {
      setClientMood("");
    }

    // Initialize local motives from confirmOrder
    const motivesData = confirmOrder?.motive_comanda_neconfirmata;
    if (motivesData && 'count' in motivesData && 'motives' in motivesData) {
      // New structure
      setLocalMotives(motivesData.motives || []);
    } else {
      // Old structure or no motives
      setLocalMotives([]);
    }

    // Initialize local notes from confirmOrder
    if (Array.isArray(confirmOrder?.notes)) {
      setLocalNotes(confirmOrder.notes);
    } else {
      setLocalNotes([]);
    }

    // Initialize county, locality, and postal code state variables
    setShippingState(confirmOrder?.shipping_details?._shipping_state || "");
    setShippingCity(confirmOrder?.shipping_details?._shipping_city || "");
    setShippingPostalCode(confirmOrder?.shipping_details?._shipping_postcode || "");
    setBillingState(confirmOrder?.billing_details?._billing_state || "");
    setBillingCity(confirmOrder?.billing_details?._billing_city || "");
    setBillingPostalCode(confirmOrder?.billing_details?._billing_postcode || "");

    // Initialize payment method state
    setSelectedPaymentMethod(confirmOrder?.payment_method_title || "Plata ramburs");

    // Initialize selected SMS phone number (default to billing phone)
    setSelectedSmsPhone(confirmOrder?.billing_details?._billing_phone || "");

    // Initialize map with existing address data when dialog opens
    const initializeMapWithOrderData = async () => {
      if (!confirmOrder) return;

      // Try to use shipping address first, then billing address
      const shippingAddress = confirmOrder.shipping_details?._shipping_address_1;
      const shippingCity = confirmOrder.shipping_details?._shipping_city;
      const shippingState = confirmOrder.shipping_details?._shipping_state;

      const billingAddress = confirmOrder.billing_details?._billing_address_1;
      const billingCity = confirmOrder.billing_details?._billing_city;
      const billingState = confirmOrder.billing_details?._billing_state;

      // Determine which address to use (prefer shipping, fallback to billing)
      const addressToUse = shippingAddress || billingAddress;
      const cityToUse = shippingCity || billingCity;
      const stateToUse = shippingState || billingState;

      if (addressToUse && cityToUse && stateToUse) {
        try {
          // Create full address string for geocoding
          const fullAddress = `${addressToUse}, ${cityToUse}, ${stateToUse}, Romania`;
          console.log("🗺️ Inițializez harta cu adresa din comandă:", fullAddress);

          // Use Google Geocoding API to get coordinates
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: fullAddress }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              const lat = location.lat();
              const lng = location.lng();

              setMapLocation({
                lat: lat,
                lng: lng,
                address: fullAddress
              });

              console.log("🗺️ Harta inițializată cu coordonatele:", { lat, lng, address: fullAddress });

              // Also check courier additional kilometers
              if (stateToUse && cityToUse) {
                checkFanCourierAdditionalKm(stateToUse, cityToUse);
                checkSamedayAdditionalKm(stateToUse, cityToUse);
              }
            } else {
              console.log("🗺️ Nu s-au putut obține coordonatele pentru adresa:", fullAddress, "Status:", status);
            }
          });
        } catch (error) {
          console.error("🗺️ Eroare la inițializarea hărții:", error);
        }
      }
    };

    // Initialize map when dialog opens and Google Maps is available
    if (typeof google !== 'undefined' && google.maps) {
      initializeMapWithOrderData();
    } else {
      // If Google Maps is not loaded yet, wait a bit and try again
      const checkGoogleMaps = () => {
        if (typeof google !== 'undefined' && google.maps) {
          initializeMapWithOrderData();
        } else {
          setTimeout(checkGoogleMaps, 500);
        }
      };
      checkGoogleMaps();
    }
  }, [confirmOrder]);

  // Fetch points data when points tab is activated
  useEffect(() => {
    if (activeConfirmTab === 'puncte' && confirmOrder?.customer_user) {
      fetchPuncte(confirmOrder.customer_user);
    }
  }, [activeConfirmTab, confirmOrder?.customer_user]);

  // Handler for difficulty change - calls the API endpoint and updates local state
  const handleDifficultyChange = async (value: string) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    try {
      // Update local state immediately for responsive UI
      setDifficulty(value);

      const response = await fetch(`https://crm.actium.ro/api/modificare-dificultate/${confirmOrder.ID}/${value}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log(`Difficulty updated successfully to ${value}`);

      // Refresh user data from API to ensure all UI components have the latest data
      if (refreshUserData) {
        await refreshUserData(confirmOrder.ID);
      }
    } catch (error) {
      console.error(`Error updating difficulty:`, error);
      // Revert the local state if API call fails
      if (confirmOrder?.dificultate) {
        setDifficulty(confirmOrder.dificultate.toString());
      } else {
        setDifficulty("1");
      }
    }
  };


  // Handler for client mood change - calls the API endpoint and updates local state
  const handleClientMoodChange = async (value: string) => {
    if (!confirmOrder?.ID) {
      console.error('No order ID available');
      return;
    }

    try {
      // Update local state immediately for responsive UI
      setClientMood(value);

      // No need to extract icon name as it's already passed without the prefix
      const iconName = value;

      const response = await fetch(`https://crm.actium.ro/api/mood-client/${confirmOrder.ID}/${iconName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log(`Client mood updated successfully to ${iconName}`);

      // Refresh user data from API to ensure all UI components have the latest data
      if (refreshUserData) {
        await refreshUserData(confirmOrder.ID);
      }
    } catch (error) {
      console.error(`Error updating client mood:`, error);
      // Revert the local state if API call fails
      setClientMood("");
    }
  };

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

  // Function to toggle gift status
  const toggleGiftStatus = async () => {
    if (!confirmOrder?.ID || isUpdatingGift) return;

    const isGift = confirmOrder?.comandaCadou !== false && 
                 (confirmOrder?.comandaCadou === 1 || 
                  confirmOrder?.comandaCadou === '1' || 
                  confirmOrder?.comandaCadou === true || 
                  String(confirmOrder?.comandaCadou || '').trim() === '1');

    try {
      setIsUpdatingGift(true);
      // Send "nu" if it's currently a gift, otherwise send "da"
      const newValue = isGift ? 'nu' : 'da';

      const response = await fetch(`https://crm.actium.ro/api/modificarei-comanda-caodu/${confirmOrder.ID}/${newValue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Parse the API response to get updated data
      const responseData = await response.json();
      console.log('API response:', responseData);

      // Update the local state to reflect the change
      // Map the API response to the appropriate format
      // For "da" the comandaCadou should be true/1/"1", for "nu" it should be false/0/"0"
      const updatedOrder = { 
        ...confirmOrder,
        comandaCadou: newValue === 'da' ? true : false
      };



      // Refresh user data from API to ensure all UI components have the latest data
      if (refreshUserData && confirmOrder.ID) {
        await refreshUserData(confirmOrder.ID);
      }

      console.log(`Gift status updated to ${newValue}`, updatedOrder);
    } catch (error) {
      console.error('Error updating gift status:', error);
    } finally {
      setIsUpdatingGift(false);
    }
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

  // Scroll event handler for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Show button when scrolled 10% or more
        setShowScrollToTop(scrollPercentage >= 10);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Wizard step completion logic
  const getWizardStepStatus = () => {
    const steps = [
      {
        id: 1,
        title: "Cadou selectat",
        completed: confirmOrder?.comandaCadou !== undefined && confirmOrder?.comandaCadou !== null
      },
      {
        id: 2,
        title: "Dificultate",
        completed: confirmOrder?.dificultate !== undefined && confirmOrder?.dificultate !== null
      },
      {
        id: 3,
        title: "Data expediere",
        completed: confirmOrder?.expediere !== undefined && confirmOrder?.expediere !== null && confirmOrder?.expediere !== ""
      },
      {
        id: 4,
        title: "Tip client",
        completed: (confirmOrder?.billing_details?._billing_first_name || confirmOrder?.shipping_details._shipping_first_name) !== undefined
      },
      {
        id: 5,
        title: "Curier ales",
        completed: confirmOrder?.ramburs !== undefined && confirmOrder?.ramburs !== null && confirmOrder?.ramburs !== ""
      },
      {
        id: 6,
        title: "Metoda de plata",
        completed: confirmOrder?.payment_method !== undefined && confirmOrder?.payment_method !== null && confirmOrder?.payment_method !== ""
      },
      {
        id: 7,
        title: "Confirma comanda",
        completed: false // This will be determined by all other steps
      }
    ];

    // Check if all first 6 steps are completed
    const allStepsCompleted = steps.slice(0, 6).every(step => step.completed);
    steps[6].completed = allStepsCompleted;

    return { steps, allStepsCompleted };
  };

  const { steps: wizardSteps, allStepsCompleted } = getWizardStepStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 w-full h-full max-w-[1800px] p-0 m-0 rounded-none translate-x-0 translate-y-0 overflow-hidden flex flex-col mx-auto gap-0">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-2 ">
          {/* Single line header with ID, name, and order count */}
          <div className="flex items-center gap-3">
            {/* Order ID */}
            <Badge variant="outline" className="text-sm">
              <a href={`https://darurialese.com/wp-admin/post.php?post=${confirmOrder?.ID}&action=edit`} target="_blank" rel="noopener noreferrer">
              #{confirmOrder?.ID}
              </a>
            </Badge>

            {/* Name */}
            <span className="font-semibold">
              {confirmOrder?.shipping_details._shipping_first_name}{" "}
              {confirmOrder?.shipping_details._shipping_last_name}
            </span>

            {/* Order count in parentheses */}
            <button 
              className="text-sm text-muted-foreground hover:text-primary focus:outline-none focus:text-primary flex items-center"
              onClick={() => setShowClientOrdersModal(true)}
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              <span>({confirmOrder?.total_comenzi || 3} comenzi)</span>
            </button>


            {/* Total amount */}
            <Badge variant="secondary" className="text-sm font-semibold">
              {confirmOrder?.order_total_formatted || confirmOrder?.pret_total || "-"}
            </Badge>

            {/* Order type icon - clickable for gift status toggle */}
            <div className="flex items-center gap-1">
              {(() => {
                const v = confirmOrder?.comandaCadou;
                const isGift = v !== false && (v === 1 || v === '1' || v === true || String(v || '').trim() === '1');

                return (
                  <button 
                    onClick={toggleGiftStatus}
                    disabled={isUpdatingGift}
                    className="relative rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    title={isGift ? "Comandă cadou - Click pentru a dezactiva" : "Nu este comandă cadou - Click pentru a activa"}
                  >
                    {isUpdatingGift ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Gift 
                        className={`h-4 w-4 ${isGift ? 'text-pink-600' : 'text-muted-foreground'}`} 
                      />
                    )}
                  </button>
                );
              })()}
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

        {/* Wizard Progress Bar */}
        <div className="sticky  z-9 bg-gray-50 border-b border-border px-4 py-2">
          <div className="flex items-center justify-between  mx-auto">
            <div className="flex items-center space-x-1">
              {wizardSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.completed ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      step.completed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Confirm Order Button */}
            <Button 
              size="sm" 
              className={`${
                allStepsCompleted 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!allStepsCompleted}
              onClick={() => {
                if (allStepsCompleted) {
                  console.log('Confirming order...');
                  // Add your confirm order logic here
                }
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirma comanda
            </Button>
          </div>
        </div>

        {/* Main content area with 4 columns */}
        <div className="flex-1 overflow-y-auto p-4 coloane3elemente">
          <div className="grid grid-cols-10 gap-4 max-w-[1800px] mx-auto subcoloane3elemente h-full">



            {/* Left column (18.75%) - Client data & logistics */}
            <div className="no-scrollbar h-full overflow-y-auto col-span-2 space-y-4">

              {/* Payment Method Card */}

                <div className="p-2">

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Metodă de plată</h3>
                        {loadingPaymentMethod && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <Badge variant={isOrderPaid(confirmOrder) ? 'success' : 'outline'}>
                        {getPaymentStatusText(confirmOrder)}
                      </Badge>
                    </div>
                    <Select
                        value={selectedPaymentMethod}
                        onValueChange={handlePaymentMethodChange}
                        disabled={loadingPaymentMethod}
                    >
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
                    {/*{confirmOrder?.currency && (*/}
                    {/*    <div className="mt-1 text-sm text-muted-foreground">*/}
                    {/*      <span className="font-medium">Monedă:</span> {confirmOrder.currency}*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Display bank account information for unpaid bank transfers */}
                    {selectedPaymentMethod === "Transfer bancar direct" && !isOrderPaid(confirmOrder) && (
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

                          {/* Error and Success Messages */}
                          {emailError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-md mt-3 text-sm">
                              {emailError}
                            </div>
                          )}
                          {emailSuccess && (
                            <div className="bg-green-50 border border-green-200 text-green-600 p-2 rounded-md mt-3 text-sm">
                              {emailSuccess}
                            </div>
                          )}
                          {whatsAppError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-md mt-3 text-sm">
                              {whatsAppError}
                            </div>
                          )}
                          {whatsAppSuccess && (
                            <div className="bg-green-50 border border-green-200 text-green-600 p-2 rounded-md mt-3 text-sm">
                              {whatsAppSuccess}
                            </div>
                          )}

                          {/* 3-column grid layout for buttons */}
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center justify-center"
                              onClick={sendBillingEmail}
                              disabled={sendingEmail || !confirmOrder?.billing_details?._billing_email}
                            >
                              {sendingEmail ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Mail className="h-4 w-4 mr-1" />

                                </>
                              )}
                            </Button>

                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center justify-center"
                              onClick={sendBillingWhatsApp}
                              disabled={sendingWhatsApp || (!confirmOrder?.billing_details?._billing_phone && !confirmOrder?.shipping_details._shipping_phone)}
                            >
                              {sendingWhatsApp ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <MessageSquare className="h-4 w-4 mr-1" />

                                </>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center justify-center"
                              onClick={() => setShowVerifyPaymentModal(true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />

                            </Button>
                          </div>
                        </div>
                    )}

                    {/* Display payment link button for unpaid card payments */}
                    {selectedPaymentMethod === "Plata cu cardul Mobilpay" && !isOrderPaid(confirmOrder) && (
                        <div className="mt-3">
                          <Button size="sm" className="w-full">
                            Generează link de plată Mobilpay
                          </Button>
                        </div>
                    )}


                  {/* Task List */}
                  {/*<div className="mt-4 pt-4 border-t border-border">*/}
                  {/*  <h4 className="font-medium text-sm mb-3 text-muted-foreground">Taskuri de implementat:</h4>*/}
                  {/*  <div className="space-y-2">*/}
                  {/*    <div className="flex items-center space-x-2 text-sm">*/}
                  {/*      <input type="checkbox" id="task-puncte" className="rounded" />*/}
                  {/*      <label htmlFor="task-puncte" className="text-muted-foreground">1. Zona de puncte</label>*/}
                  {/*    </div>*/}
                  {/*    <div className="flex items-center space-x-2 text-sm">*/}
                  {/*      <input type="checkbox" id="task-persoane" className="rounded" />*/}
                  {/*      <label htmlFor="task-persoane" className="text-muted-foreground">2. Persoane apropiate</label>*/}
                  {/*    </div>*/}

                  {/*    <div className="flex items-center space-x-2 text-sm">*/}
                  {/*      <input type="checkbox" id="task-vezi-comenzi" className="rounded" />*/}
                  {/*      <label htmlFor="task-vezi-comenzi" className="text-muted-foreground">4. Butonul de vezi comenzi</label>*/}
                  {/*    </div>*/}
                  {/*    <div className="flex items-center space-x-2 text-sm">*/}
                  {/*      <input type="checkbox" id="task-lockere" className="rounded" />*/}
                  {/*      <label htmlFor="task-lockere" className="text-muted-foreground">5. Lista de lockere SameDay și FAN</label>*/}
                  {/*    </div>*/}
                  {/*    <div className="flex items-center space-x-2 text-sm">*/}
                  {/*      <input type="checkbox" id="task-personalizari" className="rounded" />*/}
                  {/*      <label htmlFor="task-personalizari" className="text-muted-foreground">6. Personalizările la produs și modificarea</label>*/}
                  {/*    </div>*/}
                  {/*    <div className="flex items-center space-x-2 text-sm">*/}
                  {/*      <input type="checkbox" id="task-cupoane" className="rounded" />*/}
                  {/*      <label htmlFor="task-cupoane" className="text-muted-foreground">7. Adăugat și șters cupoane</label>*/}
                  {/*    </div>*/}

                  {/*  </div>*/}
                  {/*</div>*/}
                </div>




              {/* Card 1: Delivery and Billing Tabs */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between border-b border-border mb-4">
                    <div className="flex">
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

                    {/* Info icon with tooltip when addresses are different */}
                    {getAddressDifferences() && (
                      <div className="relative">
                        <div
                          className="cursor-help"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          <Info className="h-4 w-4 text-blue-500" />
                        </div>

                        {/* Tooltip */}
                        {showTooltip && (
                          <div className="absolute right-0 top-6 z-50 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              Diferențe între adresele de livrare și facturare:
                            </div>
                            <div className="space-y-1">
                              {getAddressDifferences()?.map((diff, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  • {diff}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                                              onBlur={(e) => handleShippingDetailChange("first_name", e.target.value)}
                                              disabled={loadingField === "shipping_first_name"}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="shipping_lastName">Prenume</Label>
                          <input
                            id="shipping_lastName"
                            className="w-full p-2 border border-border rounded-md"
                            defaultValue={confirmOrder?.shipping_details._shipping_last_name || ""}
                                              onBlur={(e) => handleShippingDetailChange("last_name", e.target.value)}
                                              disabled={loadingField === "shipping_last_name"}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="shipping_phone">Telefon</Label>
                        <input
                          id="shipping_phone"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.billing_details?._billing_phone || ""}
                          onBlur={(e) => handleShippingDetailChange("phone", e.target.value)}
                          disabled={loadingField === "shipping_phone"}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="shipping_address">Stradă/Număr</Label>
                        <GooglePlacesAutocomplete
                            id="shipping_address"
                            value={confirmOrder?.shipping_details?._shipping_address_1 || ""}
                            onChange={(value) => {
                              // Just update the input value, don't try to update state
                              console.log("Address value changed:", value);
                            }}
                            onBlur={(value) => handleShippingDetailChange("address_1", value)}
                            onAddressResolved={async (data) => {
                              // Automatically save all address details when resolved
                              console.log("📦 Procesez adresa pentru livrare:", data);

                              if (data.strada) {
                                await handleShippingDetailChange("address_1", data.strada);
                              }
                              if (data.judet) {
                                console.log(`🏛️ Trimit județ pentru livrare: "${data.judet}"`);
                                await handleShippingDetailChange("state", data.judet);
                              }
                              if (data.localitate) {
                                await handleShippingDetailChange("city", data.localitate);
                              }
                              if (data.cod_postal) {
                                await handleShippingDetailChange("postcode", data.cod_postal);
                              }

                              // Update map location if coordinates are available
                              if (data.lat && data.lng) {
                                const fullAddress = `${data.strada || ""}, ${data.localitate || ""}, ${data.judet || ""}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
                                setMapLocation({
                                  lat: data.lat,
                                  lng: data.lng,
                                  address: fullAddress || "Adresa de livrare"
                                });
                                console.log("🗺️ Actualizez harta cu adresa de livrare:", { lat: data.lat, lng: data.lng, address: fullAddress });

                                // Check FanCourier and SameDay additional kilometers
                                if (data.judet && data.localitate) {
                                  checkFanCourierAdditionalKm(data.judet, data.localitate);
                                  checkSamedayAdditionalKm(data.judet, data.localitate);
                                }
                              }
                            }}
                            placeholder="Caută adresa..."
                            disabled={loadingField === "shipping_address_1"}
                            className="w-full"
                            inputRef={shippingAddressRef}
                            showMap={false}
                        />
                        <div className="flex flex-col gap-2 mt-2">
                          <Button 
                            onClick={() => handleShippingDetailChange("address_1", shippingAddressRef.current?.getValue() || "")}
                            className="w-full"
                            disabled={loadingField !== null}
                          >
                            Salvează adresa
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="shipping_county">Județ</Label>
                          <input
                            id="shipping_county"
                            className="w-full p-2 border border-border rounded-md"
                            value={shippingState}
                            onChange={(e) => setShippingState(e.target.value)}
                            onBlur={(e) => handleShippingDetailChange("state", e.target.value)}
                            disabled={loadingField === "shipping_state"}
                            placeholder="Introduceți județul"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="shipping_city">Localitate</Label>
                          <input
                            id="shipping_city"
                            className="w-full p-2 border border-border rounded-md"
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            onBlur={(e) => handleShippingDetailChange("city", e.target.value)}
                            disabled={loadingField === "shipping_city"}
                            placeholder="Introduceți localitatea"
                          />
                        </div>
                      </div>


                      <div className="space-y-1">
                        <Label htmlFor="shipping_postalCode">Cod poștal</Label>
                        <input
                          id="shipping_postalCode"
                          className="w-full p-2 border border-border rounded-md"
                          value={shippingPostalCode}
                          onChange={(e) => setShippingPostalCode(e.target.value)}
                          onBlur={(e) => handleShippingDetailChange("postcode", e.target.value)}
                          disabled={loadingField === "shipping_postcode"}
                          placeholder="Introduceți codul poștal"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="shipping_addressDetails">Detalii adresă</Label>
                        <input
                          id="shipping_addressDetails"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.shipping_details?._shipping_address_2 || ""}
                          onBlur={(e) => handleShippingDetailChange("address_2", e.target.value)}
                          disabled={loadingField === "shipping_address_2"}
                        />
                      </div>

                      {/* Copy to Billing Button */}
                      <div className="pt-4 border-t border-border">
                        <Button 
                          onClick={copyShippingToBilling}
                          className="w-full"
                          disabled={loadingField !== null}
                          variant="outline"
                        >
                          📋 Copiază la facturare
                        </Button>
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
                            onBlur={(e) => handleBillingDetailChange("first_name", e.target.value)}
                            disabled={loadingField === "billing_first_name"}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="billing_lastName">Prenume</Label>
                          <input
                            id="billing_lastName"
                            className="w-full p-2 border border-border rounded-md"
                            defaultValue={confirmOrder?.billing_details?._billing_last_name || ""}
                            onBlur={(e) => handleBillingDetailChange("last_name", e.target.value)}
                            disabled={loadingField === "billing_last_name"}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_phone">Telefon</Label>
                        <input
                          id="billing_phone"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.billing_details?._billing_phone || ""}
                          onBlur={(e) => handleBillingDetailChange("phone", e.target.value)}
                          disabled={loadingField === "billing_phone"}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="billing_county">Județ</Label>
                          <input
                            id="billing_county"
                            className="w-full p-2 border border-border rounded-md"
                            value={billingState}
                            onChange={(e) => setBillingState(e.target.value)}
                            onBlur={(e) => handleBillingDetailChange("state", e.target.value)}
                            disabled={loadingField === "billing_state"}
                            placeholder="Introduceți județul"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="billing_city">Localitate</Label>
                          <input
                            id="billing_city"
                            className="w-full p-2 border border-border rounded-md"
                            value={billingCity}
                            onChange={(e) => setBillingCity(e.target.value)}
                            onBlur={(e) => handleBillingDetailChange("city", e.target.value)}
                            disabled={loadingField === "billing_city"}
                            placeholder="Introduceți localitatea"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_address">Stradă/Număr</Label>
                        <GooglePlacesAutocomplete
                          id="billing_address"
                          value={confirmOrder?.billing_details?._billing_address_1 || ""}
                          onChange={(value) => {
                            // Just update the input value, don't try to update state
                            console.log("Billing address value changed:", value);
                          }}
                          onBlur={(value) => handleBillingDetailChange("address_1", value)}
                          onAddressResolved={async (data) => {
                            // Automatically save all address details when resolved
                            console.log("💳 Procesez adresa pentru facturare:", data);

                            if (data.strada) {
                              await handleBillingDetailChange("address_1", data.strada);
                            }
                            if (data.judet) {
                              console.log(`🏛️ Trimit județ pentru facturare: "${data.judet}"`);
                              await handleBillingDetailChange("state", data.judet);
                            }
                            if (data.localitate) {
                              await handleBillingDetailChange("city", data.localitate);
                            }
                            if (data.cod_postal) {
                              await handleBillingDetailChange("postcode", data.cod_postal);
                            }

                            // Update map location if coordinates are available
                            if (data.lat && data.lng) {
                              const fullAddress = `${data.strada || ""}, ${data.localitate || ""}, ${data.judet || ""}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
                              setMapLocation({
                                lat: data.lat,
                                lng: data.lng,
                                address: fullAddress || "Adresa de facturare"
                              });
                              console.log("🗺️ Actualizez harta cu adresa de facturare:", { lat: data.lat, lng: data.lng, address: fullAddress });

                              // Check FanCourier and SameDay additional kilometers
                              if (data.judet && data.localitate) {
                                checkFanCourierAdditionalKm(data.judet, data.localitate);
                                checkSamedayAdditionalKm(data.judet, data.localitate);
                              }
                            }
                          }}
                          placeholder="Caută adresa..."
                          disabled={loadingField === "billing_address_1"}
                          className="w-full"
                          inputRef={billingAddressRef}
                          showMap={false}
                        />
                        <div className="flex flex-col gap-2 mt-2">
                          <Button 
                            onClick={() => handleBillingDetailChange("address_1", billingAddressRef.current?.getValue() || "")}
                            className="w-full"
                            disabled={loadingField !== null}
                          >
                            Salvează adresa
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_postalCode">Cod poștal</Label>
                        <input
                          id="billing_postalCode"
                          className="w-full p-2 border border-border rounded-md"
                          value={billingPostalCode}
                          onChange={(e) => setBillingPostalCode(e.target.value)}
                          onBlur={(e) => handleBillingDetailChange("postcode", e.target.value)}
                          disabled={loadingField === "billing_postcode"}
                          placeholder="Introduceți codul poștal"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="billing_addressDetails">Detalii adresă</Label>
                        <input
                          id="billing_addressDetails"
                          className="w-full p-2 border border-border rounded-md"
                          defaultValue={confirmOrder?.billing_details?._billing_address_2 || ""}
                          onBlur={(e) => handleBillingDetailChange("address_2", e.target.value)}
                          disabled={loadingField === "billing_address_2"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Card 2: Courier options */}
              {/*<Card>*/}
              {/*  <div className="p-4">*/}
              {/*    <h3 className="font-semibold text-lg mb-4">Opțiuni curier</h3>*/}

              {/*    <div className="space-y-4">*/}
              {/*      /!* FAN Courier *!/*/}
              {/*      <div className="border border-border rounded-md p-3">*/}
              {/*        <div className="flex items-center justify-between mb-2">*/}
              {/*          <h4 className="font-medium">FAN Courier</h4>*/}
              {/*          <img src="https://www.fancourier.ro/wp-content/themes/fancourier/images/logo.png" alt="FAN Courier" className="h-5" />*/}
              {/*        </div>*/}

              {/*        <div className="space-y-3">*/}
              {/*          <div className="grid grid-cols-2 gap-3">*/}
              {/*            <div className="space-y-1">*/}
              {/*              <Label htmlFor="fanCity">Localitate</Label>*/}
              {/*              <input*/}
              {/*                id="fanCity"*/}
              {/*                className="w-full p-2 border border-border rounded-md"*/}
              {/*                defaultValue={confirmOrder?.shipping_details?._shipping_city || ""}*/}
              {/*              />*/}
              {/*            </div>*/}
              {/*            <div className="space-y-1">*/}
              {/*              <Label htmlFor="fanCounty">Județ</Label>*/}
              {/*              <input*/}
              {/*                id="fanCounty"*/}
              {/*                className="w-full p-2 border border-border rounded-md"*/}
              {/*                defaultValue={confirmOrder?.shipping_details?._shipping_state || ""}*/}
              {/*              />*/}
              {/*            </div>*/}
              {/*          </div>*/}

              {/*          <div className="space-y-1">*/}
              {/*            <Label htmlFor="fanCommune">Comună (opțional)</Label>*/}
              {/*            <input*/}
              {/*              id="fanCommune"*/}
              {/*              className="w-full p-2 border border-border rounded-md"*/}
              {/*            />*/}
              {/*          </div>*/}

              {/*          <div>*/}
              {/*            <Label className="mb-1 block">Zile livrare</Label>*/}
              {/*            <div className="flex flex-wrap gap-2">*/}
              {/*              <div className="flex items-center space-x-1">*/}
              {/*                <input type="checkbox" id="fanMonday" className="rounded" />*/}
              {/*                <Label htmlFor="fanMonday">Lu</Label>*/}
              {/*              </div>*/}
              {/*              <div className="flex items-center space-x-1">*/}
              {/*                <input type="checkbox" id="fanTuesday" className="rounded" />*/}
              {/*                <Label htmlFor="fanTuesday">Ma</Label>*/}
              {/*              </div>*/}
              {/*              <div className="flex items-center space-x-1">*/}
              {/*                <input type="checkbox" id="fanWednesday" className="rounded" />*/}
              {/*                <Label htmlFor="fanWednesday">Mi</Label>*/}
              {/*              </div>*/}
              {/*              <div className="flex items-center space-x-1">*/}
              {/*                <input type="checkbox" id="fanThursday" className="rounded" />*/}
              {/*                <Label htmlFor="fanThursday">Jo</Label>*/}
              {/*              </div>*/}
              {/*              <div className="flex items-center space-x-1">*/}
              {/*                <input type="checkbox" id="fanFriday" className="rounded" />*/}
              {/*                <Label htmlFor="fanFriday">Vi</Label>*/}
              {/*              </div>*/}
              {/*            </div>*/}
              {/*          </div>*/}
              {/*        </div>*/}
              {/*      </div>*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</Card>*/}
            </div>


            <div className="no-scrollbar h-full col-span-6 grid-cols-2 grid gap-2 overflow-y-auto coloanaCentrala">
              {/* Center column (25%) - Confirmation & production options */}
              <div className="no-scrollbar h-full space-y-4 overflow-y-auto ">

                <div className="w-full hartaAfisata">
                  <LoadScript 
                    googleMapsApiKey="AIzaSyA1B8WNJx5X5S9tqN-hdyiZyrEwOcUpZvM" 
                    libraries={libraries}
                  >
                    <div className="border border-border rounded-lg overflow-hidden">
                      {mapLocation ? (
                        <>
                          <div className="bg-muted px-4 py-2 border-b border-border">
                            <h3 className="font-medium text-sm">📍 {mapLocation.address}</h3>
                          </div>
                          <GoogleMap 
                            mapContainerStyle={mapContainerStyle} 
                            center={{ lat: mapLocation.lat, lng: mapLocation.lng }} 
                            zoom={16}
                          >
                            <Marker
                              position={{ lat: mapLocation.lat, lng: mapLocation.lng }}
                              title={mapLocation.address}
                            />
                          </GoogleMap>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] bg-muted/20 text-muted-foreground">
                          <div className="text-center">
                            <div className="text-2xl mb-2">🗺️</div>
                            <p className="text-sm">Selectează o adresă pentru a afișa harta</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </LoadScript>
                </div>

                {/* Courier Additional Kilometers Check - 3 Rows */}
                <div className="border border-border rounded-lg p-4 bg-background ">
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Localitate:</span> {fanCourierKmCheck?.locality || samedayKmCheck?.locality || "Selectează o adresă"} <span className="font-medium">Județ:</span> {fanCourierKmCheck?.county || samedayKmCheck?.county || ""}
                    </p>
                  </div>

                  <div className="gap-3 grid grid-cols-3">
                    {/* DPD - Always available */}
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                      <img 
                        src="/curieri/dpd.jpg" 
                        alt="DPD" 
                        className="w-12 h-8 object-contain"
                      />
                      <div className="flex items-center gap-2">
                        <div className="text-green-600 text-lg">✓</div>
                        <span className="text-sm font-medium">0 km</span>
                      </div>
                    </div>

                    {/* FanCourier */}
                    {fanCourierKmCheck && fanCourierKmCheck.checked ? (
                      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                        <img 
                          src="/curieri/fan.jpg" 
                          alt="FanCourier" 
                          className="w-12 h-8 object-contain"
                        />
                        <div className="flex items-center gap-2">
                          {fanCourierKmCheck.hasAdditionalKm ? (
                            <>
                              <div className="text-red-600 text-lg">✗</div>
                              <span className="text-sm font-medium">{fanCourierKmCheck.kmValue} km</span>
                            </>
                          ) : (
                            <>
                              <div className="text-green-600 text-lg">✓</div>
                              <span className="text-sm font-medium">0 km</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                        <img 
                          src="/curieri/fan.jpg" 
                          alt="FanCourier" 
                          className="w-12 h-8 object-contain"
                        />
                        <div className="flex items-center gap-2">
                          <div className="text-green-600 text-lg">✓</div>
                          <span className="text-sm font-medium">0 km</span>
                        </div>
                      </div>
                    )}

                    {/* SameDay */}
                    {samedayKmCheck && samedayKmCheck.checked ? (
                      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                        <img 
                          src="/curieri/sameday.jpg" 
                          alt="SameDay" 
                          className="w-12 h-8 object-contain"
                        />
                        <div className="flex items-center gap-2">
                          {samedayKmCheck.hasAdditionalKm ? (
                            <>
                              <div className="text-red-600 text-lg">✗</div>
                              <span className="text-sm font-medium">{samedayKmCheck.kmValue} km</span>
                            </>
                          ) : (
                            <>
                              <div className="text-green-600 text-lg">✓</div>
                              <span className="text-sm font-medium">0 km</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                        <img 
                          src="/curieri/sameday.jpg" 
                          alt="SameDay" 
                          className="w-12 h-8 object-contain"
                        />
                        <div className="flex items-center gap-2">
                          <div className="text-green-600 text-lg">✓</div>
                          <span className="text-sm font-medium">0 km</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top tabs */}
                <div className="bg-background border-b border-border">


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
                                  {/* Error and Success Messages */}
                                  {motiveError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                                      {motiveError}
                                    </div>
                                  )}
                                  {motiveSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4">
                                      {motiveSuccess}
                                    </div>
                                  )}
                                  <div className="mb-4">
                                    <Label htmlFor="reason" className="block mb-2">Motiv</Label>
                                    <div className="grid-cols-1 grid gap-3">
                                      <select
                                          id="reason"
                                          className="p-2 border border-border rounded-md bg-background text-foreground"
                                          value={selectedReason}
                                          onChange={(e) => setSelectedReason(e.target.value)}
                                          disabled={addingMotive}
                                      >
                                        <option value="Selecteaza">Selectează</option>
                                        <option value="Clientul nu raspunde">Clientul nu răspunde</option>
                                        <option value="Telefon inchis">Telefon închis</option>
                                        <option value="Telefonul nu suna">Telefonul nu sună</option>
                                        <option value="Numar gresit">Număr greșit</option>
                                        <option value="Linie ocupata">Linie ocupată</option>
                                        <option value="Apel respins">Apel respins</option>
                                        <option value="Amanare confirmare">Amânare confirmare</option>
                                      </select>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={addMotivNeconfirmare}
                                        disabled={addingMotive || selectedReason === "Selecteaza"}
                                      >
                                        {addingMotive ? (
                                          <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Se adaugă...
                                          </>
                                        ) : (
                                          "Adaugă motiv neconfirmare"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <button
                                        type="button"
                                        onClick={() => setIsMotiveHistoryCollapsed(!isMotiveHistoryCollapsed)}
                                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                                      >
                                        <span>Istoric motive neconfirmare ({localMotives.length} {localMotives.length === 1 ? 'încercare' : 'încercări'})</span>
                                        <svg 
                                          className={`w-4 h-4 transition-transform ${isMotiveHistoryCollapsed ? 'rotate-0' : 'rotate-180'}`}
                                          fill="none" 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </button>
                                      {/* Show "Mută în anulate" button only when there are 3 or more active reasons */}
                                      {localMotives.length >= 3 && (
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
                                      )}
                                    </div>
                                    {!isMotiveHistoryCollapsed && (
                                      <div className="border border-border rounded-md overflow-hidden">
                                        <table className="w-full text-sm">
                                          <thead className="bg-muted">
                                          <tr>
                                            <th className="py-2 px-3 text-left font-medium w-10">#</th>
                                            <th className="py-2 px-3 text-left font-medium">Motiv</th>
                                            <th className="py-2 px-3 text-right font-medium">Data</th>
                                            <th className="py-2 px-3 text-center font-medium w-20">Acțiuni</th>
                                          </tr>
                                          </thead>
                                          <tbody>
                                          {localMotives.length > 0 ? (
                                            localMotives.map((motive, index) => (
                                              <tr key={`${motive.data_si_ora}-${index}`} className="border-t border-border">
                                                <td className="py-2 px-3 text-center">{index + 1}</td>
                                                <td className="py-2 px-3">{motive.motiv_neconfirmare}</td>
                                                <td className="py-2 px-3 text-right text-muted-foreground">
                                                  {motive.data_si_ora}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => deleteMotivNeconfirmare(index)}
                                                    disabled={deletingMotive === index}
                                                    title="Șterge motiv"
                                                  >
                                                    {deletingMotive === index ? (
                                                      <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                      <X className="h-3 w-3" />
                                                    )}
                                                  </Button>
                                                </td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr className="border-t border-border">
                                              <td colSpan={4} className="py-2 px-3 text-center text-muted-foreground">Nu există motive de neconfirmare</td>
                                            </tr>
                                          )}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
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
                                            disabled={loadingSms || !smsText.trim() || !selectedSmsPhone}
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

                                {/* Error message */}
                                {puncteError && (
                                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm">{puncteError}</p>
                                  </div>
                                )}

                                {/* Loading state */}
                                {loadingPuncte ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span className="text-muted-foreground">Se încarcă datele de puncte...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {/* Points data table */}
                                    <div className="border border-border rounded-md overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                          <tr>
                                            <th className="py-2 px-3 text-left font-medium">ID</th>
                                            <th className="py-2 px-3 text-left font-medium">Customer User</th>
                                            <th className="py-2 px-3 text-left font-medium">Nume</th>
                                            <th className="py-2 px-3 text-left font-medium">Telefon</th>
                                            <th className="py-2 px-3 text-left font-medium">Puncte</th>
                                            <th className="py-2 px-3 text-left font-medium">Total Comenzi</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {puncteData.length > 0 ? (
                                            puncteData.map((item, index) => (
                                              <tr key={item.ID || index} className="border-t border-border hover:bg-muted/50">
                                                <td className="py-2 px-3">{item.ID}</td>
                                                <td className="py-2 px-3">{item.customer_user}</td>
                                                <td className="py-2 px-3">
                                                  {item.shipping_details._shipping_first_name} {item.shipping_details._shipping_last_name || ''}
                                                </td>
                                                <td className="py-2 px-3">
                                                  {item.shipping_details._shipping_phone || item.billing_details?._billing_phone || '-'}
                                                </td>
                                                <td className="py-2 px-3">
                                                  <Badge variant="secondary">{item.puncte || 0}</Badge>
                                                </td>
                                                <td className="py-2 px-3">{item.total_comenzi || 0}</td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr className="border-t border-border">
                                              <td colSpan={6} className="py-4 text-center text-muted-foreground">
                                                Nu există date de puncte pentru acest client.
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Additional info if available */}
                                    {puncteData.length > 0 && puncteData[0].data_ultima_comanda && (
                                      <div className="p-3 bg-muted/20 rounded-md">
                                        <p className="text-sm text-muted-foreground">
                                          <span className="font-medium">Data ultimei comenzi:</span> {puncteData[0].data_ultima_comanda}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
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
                            <div className="grid grid-cols-7 gap-1">
                              <button 
                                onClick={() => handleClientMoodChange("angry")}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Recalcitrant" 
                                className={`col-span-1 border p-2 rounded-md ${clientMood == "angry" ? 'bg-green-500 border-green-500 text-white' : ''}`}
                              >
                                <i className="fas fa-angry"></i>
                              </button>
                              <button 
                                onClick={() => handleClientMoodChange("dizzy")}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="IQ mic" 
                                className={`col-span-1 border p-2 rounded-md ${clientMood == "dizzy" ? 'bg-green-500 border-green-500 text-white' : ''}`}
                              >
                                <i className="fas fa-dizzy"></i>
                              </button>
                              <button 
                                onClick={() => handleClientMoodChange("grin-hearts")}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Dragut" 
                                className={`col-span-1 border p-2 rounded-md ${clientMood == "grin-hearts" ? 'bg-green-500 border-green-500 text-white' : ''}`}
                              >
                                <i className="fas fa-grin-hearts"></i>
                              </button>
                              <button 
                                onClick={() => handleClientMoodChange("frown")}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Morocanos" 
                                className={`col-span-1 border p-2 rounded-md ${clientMood == "frown" ? 'bg-green-500 border-green-500 text-white' : ''}`}
                              >
                                <i className="fas fa-frown"></i>
                              </button>
                              <button 
                                onClick={() => handleClientMoodChange("meh-rolling-eyes")}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Pretentios" 
                                className={`col-span-1 border p-2 rounded-md ${clientMood == "meh-rolling-eyes" ? 'bg-green-500 border-green-500 text-white' : ''}`}
                              >
                                <i className="fas fa-meh-rolling-eyes"></i>
                              </button>
                              <button 
                                onClick={() => handleClientMoodChange("meh")}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Indiferent" 
                                className={`col-span-1 border p-2 rounded-md ${clientMood == "meh" ? 'bg-green-500 border-green-500 text-white' : ''}`}
                              >
                                <i className="fas fa-meh"></i>
                              </button>
                              {/* Debug: {clientMood} */}
                              <button 
                                onClick={() => handleClientMoodChange("grin-squint")}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Amuzat" 
                                className={`col-span-1 border p-2 rounded-md ${clientMood == "grin-squint" ? 'bg-green-500 border-green-500 text-white' : ''}`}
                              >
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
                              <ToggleOptionsGrid confirmOrder={confirmOrder} refreshUserData={refreshUserData} />




                            </div>
                          </div>
                        </Card>
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
              <div className="no-scrollbar h-full space-y-4 overflow-y-auto  ">

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
                          onClick={() => handleDifficultyChange("1")}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Foarte ușor"
                          className={`col-span-1 border p-2 rounded-md font-medium ${difficulty === "1" ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                      >
                        1
                      </button>
                      <button
                          valoare="2"
                          onClick={() => handleDifficultyChange("2")}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Ușor"
                          className={`col-span-1 border p-2 rounded-md font-medium ${difficulty === "2" ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                      >
                        2
                      </button>
                      <button
                          valoare="3"
                          onClick={() => handleDifficultyChange("3")}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Mediu"
                          className={`col-span-1 border p-2 rounded-md font-medium ${difficulty === "3" ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                      >
                        3
                      </button>
                      <button
                          valoare="4"
                          onClick={() => handleDifficultyChange("4")}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Dificil"
                          className={`col-span-1 border p-2 rounded-md font-medium ${difficulty === "4" ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
                      >
                        4
                      </button>
                      <button
                          valoare="5"
                          onClick={() => handleDifficultyChange("5")}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Foarte dificil"
                          className={`col-span-1 border p-2 rounded-md font-medium ${difficulty === "5" ? 'bg-green-500 border-green-500 border-2 text-white opacity-100' : 'bg-gray-100 border-gray-300 text-gray-700 opacity-50'}`}
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
                      {confirmOrder?.produse_finale.map((produs, idx) => {
                        // Initialize personalization data array
                        let personalizationData = [];

                        // Check if we have personalization data in the items
                        if (confirmOrder?.items && Array.isArray(confirmOrder.items)) {
                          // Find the line item that corresponds to this product
                          const orderItem = confirmOrder.items.find(item => 
                            item.order_item_type === "line_item"
                          );

                          if (orderItem && orderItem.order_item_meta) {
                            // Check for _tmcartepo_data meta
                            const personalizationMeta = orderItem.order_item_meta.find(meta => 
                              meta.meta_key === "_tmcartepo_data"
                            );

                            if (personalizationMeta && personalizationMeta.meta_value) {
                              try {
                                // Parse the serialized PHP data structure
                                // We'll extract the personalization items from the _tmcartepo_data field
                                const data = [];

                                // Regular expressions to extract data from the serialized PHP format
                                // This is a simplified approach to extract the key data points
                                const valuePattern = /s:5:"value";s:\d+:"([^"]*)"/g;
                                const namePattern = /s:4:"name";s:\d+:"([^"]*)"/g;
                                const typePattern = /s:4:"type";s:\d+:"([^"]*)"/g;
                                const displayPattern = /s:7:"display";s:\d+:"([^"]*)"/g;

                                const metaValue = personalizationMeta.meta_value;

                                // Extract all names, values, and types
                                const names = [];
                                const values = [];
                                const types = [];
                                const displays = [];

                                let nameMatch;
                                while ((nameMatch = namePattern.exec(metaValue)) !== null) {
                                  names.push(nameMatch[1]);
                                }

                                let valueMatch;
                                while ((valueMatch = valuePattern.exec(metaValue)) !== null) {
                                  values.push(valueMatch[1]);
                                }

                                let typeMatch;
                                while ((typeMatch = typePattern.exec(metaValue)) !== null) {
                                  types.push(typeMatch[1]);
                                }

                                let displayMatch;
                                while ((displayMatch = displayPattern.exec(metaValue)) !== null) {
                                  displays.push(displayMatch[1]);
                                }

                                // Create personalization items combining the extracted data
                                for (let i = 0; i < names.length; i++) {
                                  if (values[i]) {
                                    const item = {
                                      name: names[i],
                                      value: values[i],
                                      type: types[i] || 'textfield', // Default to textfield if type not found
                                    };

                                    // Add display property for uploads
                                    if (types[i] === 'upload' && displays[i]) {
                                      // Extract the filename from display HTML
                                      const displayTextMatch = displays[i].match(/>([^<]+)</);
                                      if (displayTextMatch && displayTextMatch[1]) {
                                        item.display = displayTextMatch[1];
                                      } else {
                                        item.display = 'Vezi imaginea';
                                      }
                                    }

                                    data.push(item);
                                  }
                                }

                                personalizationData = data;
                              } catch (e) {
                                console.error("Error parsing personalization data:", e);
                              }
                            }
                          }
                        }

                        return (
                          <ProductPersonalizationCard 
                            key={idx} 
                            produs={produs} 
                            idx={idx}
                            personalizationData={personalizationData}
                          />
                        );
                      })}

                      <div className="border-t border-border pt-4 mt-4">
                        {/*<h4 className="font-medium mb-3">Detalii de Personalizare - Desfășurător Comandă</h4>*/}
                        {confirmOrder && (
                          <OrderSummary
                            orderData={{
                              ID: confirmOrder.ID,
                              customer_user: confirmOrder.customer_user.toString(),
                              order_currency: confirmOrder.currency || "RON",
                              _cart_discount: "0",
                              _order_shipping: confirmOrder.shipping_details ? "17" : "0",
                              total_buc: confirmOrder.total_buc || 1,
                              pret_total: confirmOrder.pret_total || "0",
                              order_total_formatted: confirmOrder.order_total_formatted || "0 lei",
                              items: confirmOrder.produse_finale.map((produs, index) => ({
                                order_item_id: index + 1,
                                order_item_name: produs.nume,
                                order_item_type: "line_item",
                                order_id: confirmOrder.ID,
                                order_item_meta: [
                                  {
                                    meta_id: index * 10 + 1,
                                    order_item_id: index + 1,
                                    meta_key: "_product_id",
                                    meta_value: produs.id_produs || ""
                                  },
                                  {
                                    meta_id: index * 10 + 2,
                                    order_item_id: index + 1,
                                    meta_key: "_qty",
                                    meta_value: produs.quantity || "1"
                                  },
                                  {
                                    meta_id: index * 10 + 3,
                                    order_item_id: index + 1,
                                    meta_key: "_line_total",
                                    meta_value: produs.pret || "0"
                                  }
                                ]
                              })).concat(confirmOrder.shipping_details ? [{
                                order_item_id: 99999,
                                order_item_name: "Transport",
                                order_item_type: "shipping",
                                order_id: confirmOrder.ID,
                                order_item_meta: [
                                  {
                                    meta_id: 999991,
                                    order_item_id: 99999,
                                    meta_key: "method_id",
                                    meta_value: "flat_rate"
                                  },
                                  {
                                    meta_id: 999992,
                                    order_item_id: 99999,
                                    meta_key: "cost",
                                    meta_value: "17.00"
                                  }
                                ]
                              }] : [])
                            }}
                          />
                        )}
                      </div>

                      {/*<Button className="w-full">*/}
                      {/*  Actualizează*/}
                      {/*</Button>*/}
                    </div>
                  </div>
                </Card>
              </div>

            </div>

            {/* Notes and SMS column (25%) - Order notes and SMS */}
            <div ref={scrollContainerRef} className="no-scrollbar h-full col-span-2 space-y-4 overflow-y-auto relative">
              <Card className="h-full flex flex-col border-0 shadow-none p-0">
                <div className="p-4 flex flex-col flex-grow">


                  {/* Tabs for Notes and SMS */}
                  <div className="sticky top-0 z-10 bg-background flex border-b border-border mb-4">
                    <button
                      type="button"
                      onClick={() => setActiveNotesTab('notite')}
                      className={`px-3 py-2 text-sm font-medium flex items-center gap-1 ${
                        activeNotesTab === 'notite'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <FileText className="h-4 w-4" />

                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNotesTab('sms');
                        // Fetch SMS messages when SMS tab is clicked
                        if (confirmOrder?.billing_details?._billing_phone) {
                          fetchSmsMessages(confirmOrder.billing_details._billing_phone);
                        }
                      }}
                      className={`px-3 py-2 text-sm font-medium flex items-center gap-1 ${
                        activeNotesTab === 'sms'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNotesTab('puncte');
                        // Fetch points history when Puncte tab is clicked
                        if (confirmOrder?.customer_user) {
                          fetchPuncteHistory(confirmOrder.customer_user);
                        }
                      }}
                      className={`px-3 py-2 text-sm font-medium flex items-center gap-1 ${
                        activeNotesTab === 'puncte'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Puncte
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNotesTab('persoane');
                      }}
                      className={`px-3 py-2 text-sm font-medium flex items-center gap-1 ${
                        activeNotesTab === 'persoane'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Users className="h-4 w-4" />

                    </button>
                  </div>

                  {/* Notes tab content */}
                  {activeNotesTab === 'notite' && (
                    <>
                      {/* Error and Success Messages */}
                      {noteError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                          {noteError}
                        </div>
                      )}
                      {noteSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4">
                          {noteSuccess}
                        </div>
                      )}

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
                            onClick={addNote}
                            disabled={addingNote || !noteText.trim()}
                          >
                            {addingNote ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3 overflow-y-auto flex-grow min-h-0">
                        {localNotes.length > 0 ? (
                            localNotes.map((note, idx) => (
                                <div key={idx} className="border border-border rounded-md p-3">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm">Admin</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(note.comment_date).toLocaleDateString('ro-RO', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                          if (note.comment_ID) {
                                            deleteNote(note.comment_ID, idx);
                                          } else {
                                            // For newly added notes without comment_ID, just remove from local state
                                            setLocalNotes(prevNotes => prevNotes.filter((_, index) => index !== idx));
                                          }
                                        }}
                                        disabled={note.comment_ID ? deletingNote === note.comment_ID : false}
                                        title="Șterge notița"
                                      >
                                        {note.comment_ID && deletingNote === note.comment_ID ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <X className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm">{note.comment_content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">Nu există notițe pentru această comandă.</div>
                        )}
                      </div>
                    </>
                  )}

                  {/* SMS tab content */}
                  {activeNotesTab === 'sms' && (
                    <div className="flex flex-col flex-grow">
                      {/*<div className="mb-4">*/}
                      {/*  <div className="text-sm text-muted-foreground">*/}
                      {/*    {selectedSmsPhone ? (*/}
                      {/*      <span>Telefon selectat: {selectedSmsPhone}</span>*/}
                      {/*    ) : (*/}
                      {/*      <span className="text-red-500">Număr de telefon lipsă</span>*/}
                      {/*    )}*/}
                      {/*  </div>*/}
                      {/*</div>*/}

                      {/* Error message */}
                      {smsError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                          {smsError}
                        </div>
                      )}

                      {/* SMS sending form - moved to top */}
                      <div className="flex flex-col space-y-2 mb-4">

                        {/* Phone number selection */}
                        <div className="flex items-center gap-2">
                          <Select value={selectedSmsPhone} onValueChange={setSelectedSmsPhone}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selectează numărul de telefon" />
                            </SelectTrigger>
                            <SelectContent>
                              {confirmOrder?.billing_details?._billing_phone && (
                                <SelectItem value={confirmOrder.billing_details._billing_phone}>
                                  Facturare: {confirmOrder.billing_details._billing_phone}
                                </SelectItem>
                              )}
                              {confirmOrder?.shipping_details?._shipping_phone && 
                               confirmOrder.shipping_details._shipping_phone !== confirmOrder?.billing_details?._billing_phone && (
                                <SelectItem value={confirmOrder.shipping_details._shipping_phone}>
                                  Livrare: {confirmOrder.shipping_details._shipping_phone}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <textarea
                          id="smsMessage"
                          className="w-full p-2 border border-border rounded-md min-h-[80px] resize-none"
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
                            disabled={loadingSms || !smsText.trim() || !selectedSmsPhone}
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

                      {/* SMS messages table with scroll */}
                      <div className="border border-border rounded-md overflow-hidden flex-grow min-h-0">
                        <div className="overflow-y-auto h-full">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
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
                      </div>
                    </div>
                  )}

                  {/* Puncte tab content */}
                  {activeNotesTab === 'puncte' && (
                    <div className="flex flex-col flex-grow">
                      {/* Error and Success Messages */}
                      {puncteHistoryError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                          {puncteHistoryError}
                        </div>
                      )}
                      {puncteAddError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                          {puncteAddError}
                        </div>
                      )}
                      {puncteAddSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4">
                          {puncteAddSuccess}
                        </div>
                      )}

                      {/* Total Points Display */}
                      <div className="mb-4  bg-muted/20 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total puncte:</span>
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            {puncteHistory.reduce((total, item) => total + item.points, 0)}
                          </Badge>
                        </div>
                      </div>

                      {/* Add Points Form */}
                      <div className="flex flex-col space-y-2 mb-4">
                        {/* Input fields on one row */}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              id="puncteInput"
                              type="number"
                              className="w-full p-2 border border-border rounded-md"
                              placeholder="Numărul de puncte..."
                              value={puncteInput}
                              onChange={(e) => setPuncteInput(e.target.value)}
                              disabled={addingPuncte}
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              id="motivInput"
                              type="text"
                              className="w-full p-2 border border-border rounded-md"
                              placeholder="Motivul..."
                              value={motivInput}
                              onChange={(e) => setMotivInput(e.target.value)}
                              disabled={addingPuncte}
                            />
                          </div>
                        </div>
                        {/* Send button on next row, full width */}
                        <Button
                          onClick={addPuncte}
                          disabled={addingPuncte || !puncteInput.trim() || !motivInput.trim()}
                          className="w-full"
                        >
                          {addingPuncte ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Se adaugă...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Points history table with scroll */}
                      <div className="border border-border rounded-md overflow-hidden flex-grow min-h-0">
                        <div className="overflow-y-auto h-full">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                              <tr>

                                <th className="py-2 px-3 text-center font-medium">Puncte</th>
                                <th className="py-2 px-3 text-center font-medium">Comandă</th>
                                <th className="py-2 px-3 text-right font-medium">Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loadingPuncteHistory ? (
                                <tr className="border-t border-border">
                                  <td colSpan={5} className="py-8 text-center">
                                    <div className="flex items-center justify-center">
                                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                                      <span className="text-muted-foreground">Se încarcă istoricul punctelor...</span>
                                    </div>
                                  </td>
                                </tr>
                              ) : puncteHistory.length > 0 ? (
                                puncteHistory.map((item) => (
                                  <tr key={item.id} className="border-t border-border hover:bg-muted/50">

                                    <td className="py-2 px-3 text-center">
                                      <Badge variant={item.points > 0 ? 'success' : 'destructive'}>
                                        {item.points > 0 ? '+' : ''}{item.points}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3">
                                      {item.order_id && (
                                          <span className="font-mono text-xs">
                                        <a href={`https://darurialese.com/wp-admin/post.php?post=${item.order_id}&action=edit`} target="_blank" className="text-primary hover:underline">
                                          #{item.order_id}
                                        </a> <br></br>
                                        </span>
                                      )}

                                      <div className="text-[12px] px-2 py-1 bg-muted rounded w-full">
                                        {item.type}
                                      </div>
                                    </td>

                                    <td className="py-2 px-3 text-right text-xs ">
                                      <div className="flex flex-col items-end gap-1">
                                        <div>
                                          {new Date(item.date).toLocaleDateString('ro-RO', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                          })}
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {new Date(item.date).toLocaleTimeString('ro-RO', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </Badge>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr className="border-t border-border">
                                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                                    Nu există istoric de puncte pentru acest client.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Persoane tab content */}
                  {activeNotesTab === 'persoane' && (
                    <div className="flex flex-col flex-grow">
                      <div className="bg-muted/20 p-4 rounded-md mb-4">
                        <h3 className="text-base font-medium mb-2">Persoane apropiate</h3>
                        <p className="text-sm text-muted-foreground">
                          Adăugați persoane apropiate clientului pentru a ține evidența evenimentelor și preferințelor acestora.
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 mb-4">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              className="w-full p-2 border border-border rounded-md"
                              placeholder="Nume persoană..."
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              className="w-full p-2 border border-border rounded-md"
                              placeholder="Relație (soț/soție/copil)..."
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="date"
                              className="w-full p-2 border border-border rounded-md"
                              placeholder="Data nașterii..."
                            />
                          </div>
                          <Button className="whitespace-nowrap">
                            <Plus className="h-4 w-4 mr-2" />
                            Adaugă
                          </Button>
                        </div>
                      </div>

                      <div className="border border-border rounded-md overflow-hidden flex-grow min-h-0">
                        <div className="p-8 text-center text-muted-foreground">
                          Nu există persoane adăugate pentru acest client.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Scroll to top button */}
              {showScrollToTop && (
                <Button
                  onClick={scrollToTop}
                  className="fixed bottom-4 right-4 z-20 rounded-full w-10 h-10 p-0 shadow-lg bg-primary hover:bg-primary/90"
                  title="Scroll to top"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        {/*<div className="sticky bottom-0 z-10 bg-background border-t border-border p-4 flex items-center justify-between">*/}
        {/*  <div className="text-sm text-muted-foreground">*/}
        {/*    <span className="text-green-500 animate-pulse">✓ Salvat automat</span>*/}
        {/*    <button className="ml-3 text-primary hover:underline">Jurnal modificări</button>*/}
        {/*  </div>*/}
        {/*  <div className="flex items-center gap-2">*/}
        {/*    <Button variant="outline" onClick={() => setShowConfirmModal(false)}>*/}
        {/*      Închide*/}
        {/*    </Button>*/}

        {/*    <Button variant="default" onClick={() => {*/}
        {/*      // Here you would implement the confirmation logic*/}
        {/*      alert('Comandă confirmată!');*/}
        {/*      setShowConfirmModal(false);*/}
        {/*    }}>*/}
        {/*      Confirma comanda*/}
        {/*    </Button>*/}
        {/*  </div>*/}
        {/*</div>*/}
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
