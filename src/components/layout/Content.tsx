import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info, AlertTriangle, ShoppingCart, Gift, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MessageSquare, Send, PhoneCall, CalendarClock, Layers, BadgeCheck, Plus, Mail, ImageOff, Cog } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Comanda, Produs, StatItem } from "@/types/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BacklinesZoneActions,
  DeSunatZoneActions,
  ProcesareZoneActions,
  NeconfirmateZoneActions,
  InAsteptareZoneActions,
  PlataInAsteptareZoneActions,
  AprobareZoneActions,
  GresiteZoneActions,
  LipsaPozeZoneActions,
  PrecomandaZoneActions,
  ConfirmateZoneActions
} from "@/components/layout/zone";

interface ContentProps {
  statsData: StatItem[];
  isLoading: boolean;
  isLoadingComenzi: boolean;
  isLoadingStatus: boolean;
  isFromCache: boolean;
  comenzi: Comanda[];
  setComenzi: React.Dispatch<React.SetStateAction<Comanda[]>>;
  zonaActiva: string;
  formatDate: (dateString: string) => string;
  selecteazaZona: (zona: string) => void;
  selectedProductId: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedShippingData: string | null;
  setSelectedShippingData: (data: string | null) => void;
  userId: number;
  refreshComenzi: () => void;
}

import { isRomanianPhoneNumber, isLikelyValidEmail } from "@/utils/validation";


import AwbTimeline from "@/components/content/AwbTimeline";
import { 
  ProblemDialog, 
  GalleryDialog, 
  StudiuDialog, 
  InventoryDialog, 
  ConfirmOrderDialog,
  NotesOffCanvas,
  AddWpNoteModal,
  RetrimitereGraficaModal,
  EmailComposeModal,
  AwbTicketModal,
  AwbTrackingOffCanvas
} from "@/components/layout/dialogs";

export const Content = ({
  statsData,
  isLoading,
  isLoadingComenzi,
  isLoadingStatus,
  isFromCache,
  comenzi,
  setComenzi,
  zonaActiva,
  formatDate,
  selecteazaZona,
  selectedProductId,
  searchTerm,
  setSearchTerm,
  selectedShippingData,
  setSelectedShippingData,
  userId,
  refreshComenzi
}: ContentProps) => {
  // State for problem reporting modal
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Comanda | null>(null);
  // Notes off-canvas state
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [notesOrder, setNotesOrder] = useState<Comanda | null>(null);
  
  const refreshUserData = async (orderId: number) => {
    try {
      console.log(`🔄 Refreshing user data for order ${orderId}`);
      // Use the correct API endpoint format - this endpoint expects an order ID
      const response = await fetch(`https://crm.actium.ro/api/comenzi-daruri-alese-customer-id/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Normalize the data format, similar to Dashboard.tsx
        const processedData = data.map((o: any) => {
          const produseFinale = Array.isArray(o.produse) ? o.produse : (Array.isArray(o.produse_finale) ? o.produse_finale : []);
          const idComanda = o.id_comanda ?? (o.ID != null ? String(o.ID) : undefined);
          const dataComanda = o.data_comanda ?? o.post_date ?? undefined;
          return {
            ...o,
            id_comanda: idComanda,
            data_comanda: dataComanda,
            produse_finale: produseFinale,
            // Safe defaults for optional arrays used in UI
            notes: Array.isArray(o.notes) ? o.notes : [],
            fisieregrafica: Array.isArray(o.fisieregrafica) ? o.fisieregrafica : [],
            download_fisiere_grafica: Array.isArray(o.download_fisiere_grafica) ? o.download_fisiere_grafica : [],
            previzualizare_galerie: Array.isArray(o.previzualizare_galerie) ? o.previzualizare_galerie : [],
            lipsuri: Array.isArray(o.lipsuri) ? o.lipsuri : [],
          };
        });
        
        // Update the specific order in the comenzi array
        setComenzi(prevComenzi => {
          return prevComenzi.map(comanda => {
            if (comanda.ID === orderId) {
              return processedData[0];
            }
            return comanda;
          });
        });
        
        // Update confirmOrder if it's the current order being viewed
        if (confirmOrder?.ID === orderId) {
          setConfirmOrder(processedData[0]);
        }
        
        console.log(`✅ User data refreshed successfully for order ${orderId}`);
      } else {
        console.error(`No data returned or invalid data format for order ${orderId}`);
      }
    } catch (error) {
      console.error(`❌ Error refreshing user data for order ${orderId}:`, error);
    }
  };
  // Add WP note modal state (UI only for now)
  const [showAddWpNoteModal, setShowAddWpNoteModal] = useState(false);
  const [addWpNoteText, setAddWpNoteText] = useState('');
  const [addWpNoteVisibleToCustomer, setAddWpNoteVisibleToCustomer] = useState(true);
  const [addWpNoteSubmitting, setAddWpNoteSubmitting] = useState(false);
  const [addWpNoteError, setAddWpNoteError] = useState<string | null>(null);
  const [addNoteOrderId, setAddNoteOrderId] = useState<number | null>(null);
  // Status filter for backlines
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  // Payment method filter
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<Comanda | null>(null);
  const [activeAddressTab, setActiveAddressTab] = useState<'shipping' | 'billing'>('shipping');
  const [activeConfirmTab, setActiveConfirmTab] = useState<'confirmare' | 'puncte' | 'persoane'>('confirmare');
  // AWB tracking modal state
  const [showAwbModal, setShowAwbModal] = useState(false);
  const [awbLoading, setAwbLoading] = useState(false);
  const [awbError, setAwbError] = useState<string | null>(null);
  const [awbData, setAwbData] = useState<any | null>(null);
  const [awbInfo, setAwbInfo] = useState<{ awb?: string; courier?: string } | null>(null);
  const [awbOrder, setAwbOrder] = useState<Comanda | null>(null);

  // State for gallery modal
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Ticket modal for AWB (DPD backline)
  const [showAwbTicketModal, setShowAwbTicketModal] = useState(false);
  const [sendTicketSubmitting, setSendTicketSubmitting] = useState(false);
  const [awbTicketMessage, setAwbTicketMessage] = useState<string>("");
  const [awbTicketGenerating, setAwbTicketGenerating] = useState<boolean>(false);
  const [awbTicketTo, setAwbTicketTo] = useState<string>("probleme@darurialese.ro");
  const [awbTicketCc, setAwbTicketCc] = useState<string>("office@darurialese.ro, manager@darurialese.ro");
  const [awbTicketSubject, setAwbTicketSubject] = useState<string>("");
  const awbEditorRef = useRef<HTMLDivElement | null>(null);

  // Follow up email modal (Lipsa poze)
  const [showFollowUpEmailModal, setShowFollowUpEmailModal] = useState(false);
  const [followUpEmailMessage, setFollowUpEmailMessage] = useState<string>("Sa nu uite sa trimita poza");
  const [followUpEmailSubmitting, setFollowUpEmailSubmitting] = useState(false);
  const [followUpOrder, setFollowUpOrder] = useState<Comanda | null>(null);

  // Retrimitere grafică modal state (UI only)
  const [showResendGraphicModal, setShowResendGraphicModal] = useState(false);
  const [resendOrder, setResendOrder] = useState<Comanda | null>(null);
  const [resendViaEmail, setResendViaEmail] = useState<boolean>(true);
  const [resendViaSMS, setResendViaSMS] = useState<boolean>(false);
  const [resendViaWhatsApp, setResendViaWhatsApp] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>("");
  const [resendSubmitting, setResendSubmitting] = useState<boolean>(false);

  // Email compose modal state (UI only)
  const [showEmailSendModal, setShowEmailSendModal] = useState(false);
  const [emailTo, setEmailTo] = useState<string>("");
  const [emailFrom, setEmailFrom] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [emailSubmitting, setEmailSubmitting] = useState<boolean>(false);


  // Form state for problem reporting
  const [problemZone, setProblemZone] = useState<string>("");
  const [problemProduct, setProblemProduct] = useState<string>("");
  const [problemDescription, setProblemDescription] = useState<string>("");

  // State for tracking which command is being moved or started
  const [movingCommandId, setMovingCommandId] = useState<number | null>(null);
  const [startingCommandId, setStartingCommandId] = useState<number | null>(null);


  // Highlight the order row that opened AWB history
  const [highlightedOrderId, setHighlightedOrderId] = useState<number | null>(null);

  // State for inventory modal
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newStockValues, setNewStockValues] = useState<{[key: number]: number}>({});
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");

  // State for studiu modal
  const [showStudiuModal, setShowStudiuModal] = useState(false);
  const [studiuData, setStudiuData] = useState<any[]>([]);
  const [isLoadingStudiu, setIsLoadingStudiu] = useState(false);
  const [studiuError, setStudiuError] = useState<string | null>(null);
  const [studiuMarkLoading, setStudiuMarkLoading] = useState<Record<number, boolean>>({});

  // Orders grid columns on desktop (2/3/4), default 3, synced with Header select
  const [desktopCols, setDesktopCols] = useState<number>(3);

  // State for mobile status expansion
  const [areStatusesExpanded, setAreStatusesExpanded] = useState(false);

  // Filter: All | Cu gravare | Cu printare (default All)
  const [filterTipGrafica, setFilterTipGrafica] = useState<'all' | 'gravare' | 'printare'>('all');

  // Floating chat state (Chat cu Grafica)
  type ChatMsg = { from: 'eu' | 'grafica'; text: string; time: string };
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { from: 'grafica', text: 'Salut! Cu ce te pot ajuta la fișierul de gravare?', time: '09:12' },
    { from: 'eu', text: 'Salut! Putem mări textul cu 10% și să-l centram?', time: '09:13' },
    { from: 'grafica', text: 'Da, fac acum și revin cu fișierul actualizat.', time: '09:14' },
  ]);

  const nowTime = () => {
    try {
      const d = new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Notify other components (Header) when chat visibility changes
  useEffect(() => {
    try {
      // @ts-ignore CustomEvent detail is boolean
      window.dispatchEvent(new CustomEvent('chat-visibility-change', { detail: showChat }));
    } catch (e) {}
  }, [showChat]);

    // State for tracking expanded sections in mobile view
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

    // Function to toggle a section's expanded state for a specific command
    const toggleSection = (commandId: number) => {
      setExpandedSections(prev => ({
        ...prev,
        [commandId]: !prev[commandId]
      }));
    };

  // Function to encode URL to base64
  const encodeToBase64 = useCallback((url: string) => {
    // In browser environment, btoa() is used for base64 encoding
    return btoa(url);
  }, []);

  // Filter orders if a product is selected, shipping data is selected, or search term is entered
  const displayedComenzi = React.useMemo(() => {
    let filtered = comenzi;

    // Filter by selected product
    if (selectedProductId) {
      filtered = filtered.filter(comanda => 
        comanda.produse_finale.some(produs => produs.id_produs === selectedProductId)
      );
    }

    // Filter by selected shipping data
    if (selectedShippingData) {
      filtered = filtered.filter(comanda => 
        formatDate(comanda.expediere).split(' ')[0].replace(',', '') === selectedShippingData
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(comanda => {
        // Search by name
        const fullName = `${comanda.shipping_details._shipping_first_name} ${comanda.shipping_details._shipping_last_name}`.toLowerCase();
        if (fullName.includes(term)) return true;

        // Search by order ID
        if (comanda.ID.toString().includes(term)) return true;

        return false;
      });
    }

    // Filter by status for backlines
    if (selectedStatus && zonaActiva === 'backlines') {
      filtered = filtered.filter(comanda => comanda.post_status === selectedStatus);
    }

    // Filter by payment method
    if (selectedPaymentMethod) {
      filtered = filtered.filter(comanda => comanda.payment_method_title === selectedPaymentMethod);
    }

    // Filter by tip grafica (gravare/printare/all)
    if (filterTipGrafica === 'gravare') {
      filtered = filtered.filter(comanda => !!comanda.gravare);
    } else if (filterTipGrafica === 'printare') {
      filtered = filtered.filter(comanda => !!comanda.printare);
    }

    // Filter out commands that are being moved
    if (movingCommandId !== null) {
      filtered = filtered.filter(comanda => comanda.ID !== movingCommandId);
    }

    // We don't filter out commands that are being started
    // This allows the command to remain visible while processing

    if (zonaActiva === 'backlines') {
      // Sort oldest first by data_comanda (fallback to post_date). Missing dates go to bottom.
      filtered = [...filtered].sort((a, b) => {
        const da = a.data_comanda || a.post_date || '';
        const db = b.data_comanda || b.post_date || '';
        const ta = da ? new Date(da).getTime() : Number.POSITIVE_INFINITY;
        const tb = db ? new Date(db).getTime() : Number.POSITIVE_INFINITY;
        return ta - tb;
      });
    } else {
      // Default sort: prioritize items with logprogravare
      filtered = [...filtered].sort((a, b) => {
        if (a.logprogravare && !b.logprogravare) return -1;
        if (!a.logprogravare && b.logprogravare) return 1;
        return 0;
      });
    }

    return filtered;
  }, [comenzi, selectedProductId, selectedShippingData, searchTerm, formatDate, movingCommandId, filterTipGrafica, zonaActiva, selectedStatus, selectedPaymentMethod]);


  // Extract unique shipping dates
  const uniqueShippingDates = React.useMemo(() => {
    const dates = new Set<string>();
    comenzi.forEach(comanda => {
      const shippingDate = formatDate(comanda.expediere).split(' ')[0].replace(',', '');
      dates.add(shippingDate);
    });
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [comenzi, formatDate]);

  // Extract unique statuses with counts for backlines
  const statusesWithCounts = React.useMemo(() => {
    if (zonaActiva !== 'backlines') return [];

    const statusMap = new Map<string, number>();

    // Count occurrences of each status
    comenzi.forEach(comanda => {
      const status = comanda.post_status || 'Unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    // Convert to array of objects
    return Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [comenzi, zonaActiva]);

  // Extract unique payment methods with counts
  const paymentMethodsWithCounts = React.useMemo(() => {
    const paymentMethodMap = new Map<string, number>();

    // Count occurrences of each payment method
    comenzi.forEach(comanda => {
      const paymentMethod = comanda.payment_method_title || 'Necunoscut';
      paymentMethodMap.set(paymentMethod, (paymentMethodMap.get(paymentMethod) || 0) + 1);
    });

    // Convert to array of objects
    return Array.from(paymentMethodMap.entries())
      .map(([paymentMethod, count]) => ({ paymentMethod, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [comenzi]);

  // Keyboard navigation for gallery (left/right)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!showGalleryModal || !selectedImage || galleryImages.length < 2) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const len = galleryImages.length;
        let idx = selectedImageIndex ?? galleryImages.findIndex((img) => `https://darurialese.ro/wp-content/uploads/${img}` === selectedImage);
        if (idx < 0) idx = 0;
        const next = e.key === 'ArrowRight' ? (idx + 1) % len : (idx - 1 + len) % len;
        setSelectedImage(`https://darurialese.ro/wp-content/uploads/${galleryImages[next]}`);
        setSelectedImageIndex(next);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showGalleryModal, selectedImage, selectedImageIndex, galleryImages]);

  // Reset movingCommandId and selectedStatus when zone changes
  useEffect(() => {
    setMovingCommandId(null);
    setStartingCommandId(null);
    setSelectedStatus(null);
    setSelectedPaymentMethod(null);
  }, [zonaActiva]);

  // Init desktop cols from localStorage and listen for changes from Header
  useEffect(() => {
    try {
      const saved = localStorage.getItem('desktopOrderCols');
      const parsed = saved ? parseInt(saved, 10) : 3;
      setDesktopCols(parsed === 2 || parsed === 4 ? parsed : 3);
    } catch (e) {}
    const handler = (e: Event) => {
      const anyEvent = e as CustomEvent<number>;
      const val = anyEvent?.detail;
      if (val === 2 || val === 3 || val === 4) {
        setDesktopCols(val);
      }
    };
    window.addEventListener('order-cols-change', handler as EventListener);
    return () => {
      window.removeEventListener('order-cols-change', handler as EventListener);
    };
  }, []);

  // Function to fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setIsLoadingInventory(true);
      setIsEditMode(false);
      setNewStockValues({});
      setInventorySearchTerm("");

      const response = await fetch('https://actium.ro/api/financiar/lista-raport-stocuri/sistem:customer');

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const data = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      alert('A apărut o eroare la încărcarea datelor de inventar. Vă rugăm să încercați din nou.');
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Function to fetch studiu data
  const fetchStudiuData = async () => {
    try {
      setIsLoadingStudiu(true);
      setStudiuError(null);
      setStudiuData([]);

      const response = await fetch('https://crm.actium.ro/api/studiu', {
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Eroare la încărcarea studiului');
      }

      const json = await response.json();
      const items = Array.isArray(json?.data) ? json.data : [];
      // Filter out items that have already been debited (true, 1, or '1')
      const filtered = items.filter((it: any) => {
        // Filter out items where am_gravat is true, 1, or '1'
        if (it?.am_gravat === true || it?.am_gravat === 1 || it?.am_gravat === '1') {
          return false;
        }

        // Also filter out items where all three fields are null
        if (it?.am_gravat === null && it?.am_debitat === null && it?.am_printat === null) {
          return false;
        }

        return true;
      });
      setStudiuData(filtered);
    } catch (error) {
      console.error('Error fetching studiu data:', error);
      setStudiuError('A apărut o eroare la încărcarea studiului. Vă rugăm să încercați din nou.');
      alert('A apărut o eroare la încărcarea studiului. Vă rugăm să încercați din nou.');
    } finally {
      setIsLoadingStudiu(false);
    }
  };

  // Mark a studiu item as debitat
  const handleMarkStudiuDebitat = async (id: number) => {
    try {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: true }));

      // Try POST first
      let response = await fetch(`https://crm.actium.ro/api/studiu/debitat/${id}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      });

      // If POST is not allowed, fallback to GET
      if (!response.ok && response.status === 405) {
        response = await fetch(`https://crm.actium.ro/api/studiu/debitat/${id}`, {
          method: 'GET',
          headers: { 'accept': 'application/json' }
        });
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Eroare la marcarea ca debitat');
      }

      // On success, remove item from list (since am_debitat === true should be filtered out)
      setStudiuData(prev => prev.filter((it: any) => it?.id !== id));
    } catch (e) {
      console.error('Eroare la marcarea ca debitat:', e);
      alert('A apărut o eroare la marcarea ca debitat. Încercați din nou.');
    } finally {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Mark a studiu item as printat
  const handleMarkStudiuPrintat = async (id: number) => {
    try {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: true }));

      // Try POST first
      let response = await fetch(`https://crm.actium.ro/api/studiu/printat/${id}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      });

      // If POST is not allowed, fallback to GET
      if (!response.ok && response.status === 405) {
        response = await fetch(`https://crm.actium.ro/api/studiu/printat/${id}`, {
          method: 'GET',
          headers: { 'accept': 'application/json' }
        });
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Eroare la marcarea ca printat');
      }

      // On success, remove item from list (since am_printat === true should be filtered out)
      setStudiuData(prev => prev.filter((it: any) => it?.id !== id));
    } catch (e) {
      console.error('Eroare la marcarea ca printat:', e);
      alert('A apărut o eroare la marcarea ca printat. Încercați din nou.');
    } finally {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Mark a studiu item as gravat
  const handleMarkStudiuGravat = async (id: number) => {
    try {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: true }));

      // Try POST first
      let response = await fetch(`https://crm.actium.ro/api/studiu/gravat/${id}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      });

      // If POST is not allowed, fallback to GET
      if (!response.ok && response.status === 405) {
        response = await fetch(`https://crm.actium.ro/api/studiu/gravat/${id}`, {
          method: 'GET',
          headers: { 'accept': 'application/json' }
        });
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Eroare la marcarea ca gravat');
      }

      // On success, remove item from list (since am_gravat === true should be filtered out)
      setStudiuData(prev => prev.filter((it: any) => it?.id !== id));
    } catch (e) {
      console.error('Eroare la marcarea ca gravat:', e);
      alert('A apărut o eroare la marcarea ca gravat. Încercați din nou.');
    } finally {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Mark a studiu item as produs fizic
  const handleMarkStudiuProdusFizic = async (id: number) => {
    try {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: true }));

      // Try POST first
      let response = await fetch(`https://crm.actium.ro/api/studiu/produsfizic/${id}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      });

      // If POST is not allowed, fallback to GET
      if (!response.ok && response.status === 405) {
        response = await fetch(`https://crm.actium.ro/api/studiu/produsfizic/${id}`, {
          method: 'GET',
          headers: { 'accept': 'application/json' }
        });
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Eroare la marcarea ca produs fizic');
      }

      // On success, remove item from list
      setStudiuData(prev => prev.filter((it: any) => it?.id !== id));
    } catch (e) {
      console.error('Eroare la marcarea ca produs fizic:', e);
      alert('A apărut o eroare la marcarea ca produs fizic. Încercați din nou.');
    } finally {
      setStudiuMarkLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Function to handle saving stock values
  const handleSaveStockValues = async () => {
    try {
      setIsSavingStock(true);

      // Prepare data for submission
      const stockUpdates = Object.entries(newStockValues).map(([itemId, newValue]) => ({
        id: parseInt(itemId),
        numar_stoc: newValue
      }));

      // Log the data that would be sent to the API
      console.log('Stock updates to be sent:', stockUpdates);

      // Since the API endpoint doesn't exist yet, we'll just simulate a successful response
      // In a real implementation, you would make an API call here
      // const response = await fetch('https://actium.ro/api/financiar/update-stocuri', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(stockUpdates),
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the local inventory data with the new values
      const updatedInventoryData = inventoryData.map(item => {
        if (newStockValues[item.id] !== undefined) {
          return {
            ...item,
            numar_stoc: newStockValues[item.id]
          };
        }
        return item;
      });

      setInventoryData(updatedInventoryData);
      setIsEditMode(false);
      setNewStockValues({});

      // Show success message
      alert('Stocurile au fost actualizate cu succes!');

    } catch (error) {
      console.error('Error saving stock values:', error);
      alert('A apărut o eroare la salvarea stocurilor. Vă rugăm să încercați din nou.');
    } finally {
      setIsSavingStock(false);
    }
  };

  // Function to handle stock value change
  const handleStockValueChange = (itemId: number, value: string) => {
    const numericValue = parseInt(value);

    if (!isNaN(numericValue) && numericValue >= 0) {
      setNewStockValues(prev => ({
        ...prev,
        [itemId]: numericValue
      }));
    } else if (value === '') {
      // Allow empty input for better UX
      setNewStockValues(prev => {
        const newValues = { ...prev };
        delete newValues[itemId];
        return newValues;
      });
    }
  };

  // Function to handle form submission
  const handleSubmitProblem = () => {
    // Build situation message for chat
    try {
      const orderId = currentOrder?.ID ? `#${currentOrder.ID}` : '(fără ID)';
      const zona = problemZone || 'Grafica';
      let produsNume = '';
      if (currentOrder && Array.isArray(currentOrder.produse_finale)) {
        const found = currentOrder.produse_finale.find((p: any) => String(p?.id_produs) === String(problemProduct));
        produsNume = found?.nume || (problemProduct ? `Produs ${problemProduct}` : 'Produs nespecificat');
      }
      const descriere = problemDescription?.trim() || '(fără descriere)';
      const msg = `Problema comandă ${orderId}\nZona: ${zona}\nProdus: ${produsNume}\nDescriere: ${descriere}`;
      const mine = { from: 'eu' as const, text: msg, time: nowTime() };
      setChatMessages((prev) => [...prev, mine]);
      setShowChat(true);
      // Fake acknowledgement from Grafica
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { from: 'grafica' as const, text: 'Am preluat problema comenzii. Revin cu un update în curând. 🛠️', time: nowTime() },
        ]);
      }, 900);
    } catch (e) {
      // no-op if chat state unavailable
    }

    // Reset form and close modal
    setProblemZone("");
    setProblemProduct("");
    setProblemDescription("");
    setShowProblemModal(false);
  };

  // Function to handle "Muta" button click
  const handleMutaClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/muta-gravare/${comandaId}/${userId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la mutarea comenzii');
      }

      // Handle successful response
      console.log('Comanda mutată cu succes:', data);

      // Refresh the data to reflect the changes
      //refreshComenzi();

    } catch (error) {
      console.error('Eroare la mutarea comenzii:', error);
      alert('A apărut o eroare la mutarea comenzii. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      //setMovingCommandId(null);
    }
  };

  // Function to handle "Muta Lipsa Poze" button click
  const handleMutaLipsaPozeClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/mutaLipsaPoze/${comandaId}`, {
        method: 'GET',
        headers: { 
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la mutarea comenzii în Lipsa Poze');
      }

      // Handle successful response
      console.log('Comanda mutată în Lipsa Poze cu succes:', data);

      // Refresh the data to reflect the changes
      refreshComenzi();

    } catch (error) {
      console.error('Eroare la mutarea comenzii în Lipsa Poze:', error);
      alert('A apărut o eroare la mutarea comenzii în Lipsa Poze. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      setMovingCommandId(null);
    }
  };

  // Function to handle "Muta Procesare" button click
  const handleMutaProcesareClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/mutaProcesare/${comandaId}`, {
        method: 'GET',
        headers: { 
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la mutarea comenzii în Procesare');
      }

      // Handle successful response
      console.log('Comanda mutată în Procesare cu succes:', data);

      // Refresh the data to reflect the changes
      refreshComenzi();

    } catch (error) {
      console.error('Eroare la mutarea comenzii în Procesare:', error);
      alert('A apărut o eroare la mutarea comenzii în Procesare. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      setMovingCommandId(null);
    }
  };

  // Function to handle "Muta Precomanda" button click
  const handleMutaPrecomandaClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/mutaPrecomanda/${comandaId}`, {
        method: 'GET',
        headers: { 
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la mutarea comenzii în Precomandă');
      }

      // Handle successful response
      console.log('Comanda mutată în Precomandă cu succes:', data);

      // Refresh the data to reflect the changes
      refreshComenzi();

    } catch (error) {
      console.error('Eroare la mutarea comenzii în Precomandă:', error);
      alert('A apărut o eroare la mutarea comenzii în Precomandă. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      setMovingCommandId(null);
    }
  };

  // Function to handle "Muta Anulare" button click
  const handleMutaAnulareClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/mutaAnulare/${comandaId}`, {
        method: 'GET',
        headers: { 
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la mutarea comenzii în Anulare');
      }

      // Handle successful response
      console.log('Comanda mutată în Anulare cu succes:', data);

      // Refresh the data to reflect the changes
      refreshComenzi();

    } catch (error) {
      console.error('Eroare la mutarea comenzii în Anulare:', error);
      alert('A apărut o eroare la mutarea comenzii în Anulare. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      setMovingCommandId(null);
    }
  };

  // Function to handle "Muta Grafica Gresita" button click
  const handleMutaGraficaGresitaClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/mutaGraficaGresita/${comandaId}`, {
        method: 'GET',
        headers: { 
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la mutarea comenzii în Grafică Greșită');
      }

      // Handle successful response
      console.log('Comanda mutată în Grafică Greșită cu succes:', data);

      // Refresh the data to reflect the changes
      refreshComenzi();

    } catch (error) {
      console.error('Eroare la mutarea comenzii în Grafică Greșită:', error);
      alert('A apărut o eroare la mutarea comenzii în Grafică Greșită. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      setMovingCommandId(null);
    }
  };

  // Function to handle "Retrimitere Grafica" button click
  const handleRetrimitereGraficaClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/retrimitereGrafica/${comandaId}`, {
        method: 'GET',
        headers: { 
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la retrimiterea graficii');
      }

      // Handle successful response
      console.log('Grafica retrimisă cu succes:', data);

      // Refresh the data to reflect the changes
      refreshComenzi();

    } catch (error) {
      console.error('Eroare la retrimiterea graficii:', error);
      alert('A apărut o eroare la retrimiterea graficii. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      setMovingCommandId(null);
    }
  };

  // Function to handle "Muta Productie" button click
  const handleMutaProductieClick = async (comandaId: number) => {
    try {
      // Set the moving command ID to show loading state
      setMovingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/mutaProductie/${comandaId}`, {
        method: 'GET',
        headers: { 
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la mutarea comenzii în Producție');
      }

      // Handle successful response
      console.log('Comanda mutată în Producție cu succes:', data);

      // Refresh the data to reflect the changes
      refreshComenzi();

    } catch (error) {
      console.error('Eroare la mutarea comenzii în Producție:', error);
      alert('A apărut o eroare la mutarea comenzii în Producție. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the moving command ID regardless of success or failure
      setMovingCommandId(null);
    }
  };

  // Handlers stubs pentru upload/replace/ștergere anexe (vor fi conectate când primim API)
  const handleUploadAnnex = async (
    orderId: number,
    productIndex: number,
    key: string,
    file: File,
    useAlpha: boolean
  ) => {
    try {
      // TODO: conectare API upload/replace
      alert(`Upload anexa ${key} (${useAlpha ? 'alpha' : 'normal'}) pentru comanda ${orderId}, produs #${productIndex + 1} (API în curs de configurare)`);
    } catch (e) {
      console.error('Eroare upload anexa', e);
    }
  };

  const handleDeleteAnnex = async (
    orderId: number,
    productIndex: number,
    key: string,
    useAlpha: boolean
  ) => {
    try {
      // TODO: conectare API delete
      alert(`Șterge anexa ${key} (${useAlpha ? 'alpha' : 'normal'}) pentru comanda ${orderId}, produs #${productIndex + 1} (API în curs de configurare)`);
    } catch (e) {
      console.error('Eroare ștergere anexa', e);
    }
  };

  // AWB tracking: open modal and fetch history for DPD
  const handleOpenAwbModal = async (order: Comanda, courierText: string) => {
    try {
      const awb = (order.awb_curier || '').toString().trim();
      const courier = (courierText || '').toString().trim();
      setAwbOrder(order);
      setAwbInfo({ awb, courier });
      setAwbError(null);
      setAwbData(null);
      setHighlightedOrderId(order?.ID || null);
      setShowAwbModal(true);
      if (!awb) {
        setAwbError('Nu există AWB pentru această comandă.');
        return;
      }
      const isDPD = courier.toLowerCase().includes('dpd');
      if (!isDPD) {
        setAwbError('Tracking disponibil doar pentru DPD în acest moment.');
        return;
      }
      setAwbLoading(true);
      const res = await fetch(`https://crm.actium.ro/api/dpd-istoric-awb/${encodeURIComponent(awb)}`, {
        headers: { accept: 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Eroare la preluarea istoricului AWB');
      }
      setAwbData(json);
    } catch (e: any) {
      setAwbError(e?.message || 'Eroare necunoscută');
    } finally {
      setAwbLoading(false);
    }
  };

  // Function to handle "Incepe Debitare" button click
  const handleIncepeDebitareClick = async (comandaId: number) => {
    try {
      // Set the starting command ID to show loading state
      setStartingCommandId(comandaId);

      const response = await fetch(`https://crm.actium.ro/api/incepe-gravare/${comandaId}/${userId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'accept': 'application/json',
        }
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la începerea debitării');
      }

      // Handle successful response
      console.log('Debitare începută cu succes:', data);

      // Update the command locally to show the "Muta" button instead of refreshing
      setComenzi(prevComenzi => 
        prevComenzi.map(comanda => 
          comanda.ID === comandaId 
            ? { ...comanda, logprogravare: true }
            : comanda
        )
      );

    } catch (error) {
      console.error('Eroare la începerea debitării:', error);
      alert('A apărut o eroare la începerea debitării. Vă rugăm să încercați din nou.');
    } finally {
      // Clear the starting command ID regardless of success or failure
      setStartingCommandId(null);
    }
  };

  // Helper: days until a given YYYY-MM-DD or date-like string (midnight-based)
  const daysUntil = (dateStr?: string | null): number | null => {
    try {
      if (!dateStr) return null;
      const s = String(dateStr).trim();
      if (!s) return null;
      // Normalize common formats to a Date at local midnight
      let d: Date | null = null;
      // Try YYYY-MM-DD first
      const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m2) {
        d = new Date(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]));
      } else {
        // Fallback: try Date constructor (replace space with T to avoid timezone surprises)
        const tmp = new Date(s.replace(' ', 'T'));
        if (!isNaN(tmp.getTime())) {
          d = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate());
        }
      }
      if (!d) return null;
      const today = new Date();
      const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const ms = d.getTime() - t0.getTime();
      return Math.round(ms / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  return (
    <>
      <main className={`${showChat ? 'pr-[15vw]' : ''} ml-32 mt-20 flex-1 backgroundculiniute pb-20`}>
        <div className="sticky top-20 z-40 grid grid-cols-1 sm:grid-cols-8 gap-2 relative p-3 border border-b-1 border-border bg-white dark:bg-[#020817] shadow-sm">
          {/* Mobile toggle button for expanding/collapsing statuses */}
          <div className="sm:hidden w-full mb-2 flex justify-center -mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAreStatusesExpanded(!areStatusesExpanded)}
              className="flex items-center gap-1 text-xs"
            >
              {areStatusesExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Ascunde statusuri</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Arată toate statusurile</span>
                </>
              )}
            </Button>
          </div>

          {/* Status cards */}
          {statsData.map((stat, idx) => {
            // On mobile, only show "Productie" by default or if statuses are expanded
            const isProduction = stat.title === "Productie";
            // Hide these three from the top row; they move to the bottom fixed bar
            const hiddenTop = ['precomanda','backlines','confirmare'];
            const statKey = (stat.title || '').toLowerCase().replace(/\s+/g, '');
            if (hiddenTop.includes(statKey)) return null;

            return (
              <Card
                key={idx}
                className={`p-2 cursor-pointer whitespace-nowrap transition-colors ${
                  zonaActiva === stat.title.toLowerCase().replace(/\s+/g, '')
                    ? 'border-2 border-green-500'
                    : ''
                } ${
                  // Hide non-production statuses on mobile when not expanded
                  !isProduction ? 'hidden sm:block' : ''
                } ${
                  // Show all statuses when expanded (on mobile only)
                  !isProduction && areStatusesExpanded ? '!block sm:block' : ''
                } ${
                  // Low opacity when value is 0
                  stat.value === 0 ? 'opacity-40' : ''
                }`}
                onClick={() => selecteazaZona(stat.title)}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const t = (stat.title || '').toLowerCase();
                    if (t === 'dpd') {
                      return (
                        <div className="w-12 h-7 bg-white rounded flex items-center justify-center">
                          <img src="/curieri/dpd.jpg" alt="dpd  Courier" className="w-10 h-6 object-contain" />
                        </div>
                      );
                    }
                    if (t === 'fan' || t === 'fan courier' || t === 'fancurier') {
                      return (
                        <div className="w-12 h-7 bg-white rounded flex items-center justify-center">
                          <img src="/curieri/fan.jpg" alt="FAN Courier" className="w-10 h-6 object-contain" />
                        </div>
                      );
                    }
                    return stat.icon ? (
                      <div className={`w-6 h-6 ${stat.color} rounded flex items-center justify-center`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                    ) : null;
                  })()}
                  <span className="text-xs">{stat.title}</span>
                  <span className="ml-auto font-bold">{stat.value}</span>
                </div>
              </Card>
            );
          })}


        </div>

        {/* Panou global anexe produs - ascuns conform cerinței */}
        {false && expandedProdPanel && (() => {
          const selOrder = comenzi.find((c) => c.ID === expandedProdPanel.orderId);
          const prod = selOrder?.produse_finale?.[expandedProdPanel.productIndex];
          if (!selOrder || !prod) return null;
          const annexCols = [
            { header: 'Alpha', key: 'alpha' },
            { header: 'Wenge', key: 'wenge' },
            { header: 'Alb', key: 'alb' },
            { header: 'Natur', key: 'natur' },
            { header: 'Plexi', key: 'plexi' },
            { header: 'Print', key: 'print' },
            { header: 'Gold', key: 'gold' },
            { header: 'Plexi Alb', key: 'plexi_alb' },
            { header: 'Plexi A.Satin', key: 'plexi_alb_satin' },
            { header: 'Plexi Negru', key: 'plexi_negru' },
            { header: 'Vop.Argintiu', key: 'argintiu' },
            { header: 'G.Alb', key: 'gravarealb' },
            { header: 'G.Wenge', key: 'gravarewenge' },
            { header: 'Plexi Gold', key: 'plexi_gold' }
          ];
          const hasAnyAlpha = (prod as any)?.anexe_alpha && Object.keys((prod as any).anexe_alpha).length > 0;
          const getFile = (k: string) => {
            const a = (prod as any)?.anexe_alpha?.[k];
            const n = (prod as any)?.anexe?.[k];
            return { file: a || n, useAlpha: !!a };
          };
          return (
            <div className="border border-border w-full rounded-md bg-card/50 mb-4 " style={{ width: '100%', overflow: 'auto' }}>
              <div className="relative overflow-x-auto">
                <Table className="w-full text-xs min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      {annexCols.map((col, i) => (
                        <TableHead key={i} className="text-center align-middle">
                          {col.key === 'alpha' ? (
                            <button type="button" className={`text-center w-full cursor-pointer text-xs font-medium rounded border px-2 py-0.5 ${hasAnyAlpha ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-700 dark:text-green-100' : 'bg-secondary text-secondary-foreground border-border'}`}>Alpha</button>
                          ) : (
                            col.header
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-background">
                      {annexCols.map((col, i) => {
                        if (col.key === 'alpha') {
                          return (
                            <TableCell key={i} className="text-center align-top">
                              <div className="flex flex-col items-center">
                                <img
                                  onClick={() => setExpandedProdPanel(null)}
                                  style={{ width: 70 }}
                                  className="rounded-xl m-auto mb-2 cursor-pointer"
                                  src={prod.poza ? `https://darurialese.com/wp-content/uploads/${prod.poza}` : '/api/placeholder/70/70'}
                                  alt="produs"
                                />
                              </div>
                            </TableCell>
                          );
                        }
                        const { file, useAlpha } = getFile(col.key);
                        const hasFile = !!file;
                        return (
                          <TableCell key={i} className="text-center align-top p-1">
                            <div className="flex flex-col items-center justify-center w-full">
                              <label className={`flex flex-col items-center justify-center w-full border-2 ${hasFile ? 'border-green-300 bg-green-50 dark:bg-gray-700' : 'border-gray-300 bg-gray-50 dark:bg-gray-700'} border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}>
                                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                  <svg className={`mt-2 w-8 h-8 mb-1 ${hasFile ? 'text-green-500' : 'text-gray-500'} dark:text-gray-400 m-auto`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"></path>
                                  </svg>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleUploadAnnex(selOrder.ID, expandedProdPanel.productIndex, col.key, f, useAlpha);
                                    e.currentTarget.value = '';
                                  }}
                                />
                              </label>
                            </div>
                            <div className="mt-2">
                              {hasFile ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAnnex(selOrder.ID, expandedProdPanel.productIndex, col.key, useAlpha)}
                                  className="mt-1 text-center w-full bg-red-100 text-red-800 cursor-pointer text-xs font-medium rounded dark:bg-red-700 dark:text-red-400 border border-red-500"
                                  title="Șterge anexa"
                                >
                                  <svg className="w-4 h-4 text-center m-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="opacity-20 mt-1 w-full bg-gray-100 text-gray-800 cursor-default text-xs font-medium rounded border border-gray-500"
                                  title="Fără anexa"
                                  disabled
                                >
                                  <svg className="w-4 h-4 text-center m-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>
                                </button>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })()}




        {/*{isLoading && <div className="p-4">Se încarcă statisticile...</div>}*/}

        {isLoadingComenzi && (
          <div className="fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-md z-50 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <p className="text-sm">Se actualizează...</p>
          </div>
        )}

        <div className="space-y-4 ">
          {comenzi.length === 0 && !isLoadingComenzi && (
            <Card className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nu există comenzi pentru zona selectată</p>
            </Card>
          )}

          {comenzi.length > 0 && displayedComenzi.length === 0 && (
            <Card className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {selectedProductId && selectedShippingData
                  ? "Nu există comenzi cu produsul selectat și data de expediere selectată"
                  : selectedShippingData
                    ? "Nu există comenzi cu data de expediere selectată"
                    : "Nu există comenzi cu produsul selectat"}
              </p>
            </Card>
          )}


          {/* Backlines status filters */}
          {zonaActiva === 'backlines' && statusesWithCounts.length > 0 && (
            <div className="mt-2 p-2 border border-border rounded-md bg-white">
              <div className="flex items-center gap-2 mb-1">
                {selectedStatus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setSelectedStatus(null)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Resetează filtrul
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {statusesWithCounts.map(({ status, count }) => (
                  <Badge
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  >
                    {status.startsWith("wc-")
                      ? status.substring(3).split(/[-\s]+/).map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                      : status} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Payment method filters */}
          {paymentMethodsWithCounts.length > 0 && (
            <div className="mt-2 p-2 border border-border rounded-md bg-white">
              <div className="flex items-center gap-2 mb-1">
                {/*<span className="text-sm font-medium text-muted-foreground">Filtrează după metodă de plată:</span>*/}
                {selectedPaymentMethod && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setSelectedPaymentMethod(null)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Resetează filtrul
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {paymentMethodsWithCounts.map(({ paymentMethod, count }) => (
                  <Badge
                    key={paymentMethod}
                    variant={selectedPaymentMethod === paymentMethod ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === paymentMethod ? null : paymentMethod)}
                  >
                    {paymentMethod} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Orders table (replaces old grid) */}
            {displayedComenzi.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      {zonaActiva === 'backlines' && (
                        <TableHead>Curier</TableHead>
                      )}
                      <TableHead>Nume</TableHead>
                      <TableHead>Data comandă</TableHead>
                      <TableHead>Metodă plată</TableHead>
                      {zonaActiva === 'precomanda' && (
                        <>
                          <TableHead>Data expediere</TableHead>
                          <TableHead>Zile până la expediere</TableHead>
                        </>
                      )}
                      <TableHead>Telefon Billing / Shipping</TableHead>
                      <TableHead>Email</TableHead>
                      {zonaActiva === 'backlines' && (
                        <TableHead>Status</TableHead>
                      )}
                      {zonaActiva === 'neconfirmate' && (
                        <TableHead>Motive</TableHead>
                      )}
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedComenzi.map((c) => {
                      const first = c.billing_details?._billing_first_name || c.shipping_details._shipping_first_name || '';
                      const last = c.billing_details?._billing_last_name || c.shipping_details._shipping_last_name || '';
                      const name = `${first} ${last}`.trim();
                      const rawDate = c.data_comanda || c.post_date || '';
                      const phone = c.billing_details?._billing_phone || '';
                      const email = c.billing_details?._billing_email || '';
                      // Prepare courier and avatar/notes info for separate row
                      const r = (c.ramburs || '').toString().trim();
                      const mtc = (c.metodatransportcustom || '').toString().trim();
                      const token = r ? r.split(/\s+/)[0] : '';
                      const courierText = (token || mtc || '').trim();
                      const lower = courierText.toLowerCase();
                      const isDPD = lower.includes('dpd');
                      const isFAN = lower.includes('fan');
                      const notesCount = Array.isArray(c.notes) ? c.notes.length : 0;
                      const initials = (first || last) ? `${(first||'').charAt(0)}${(last||'').charAt(0)}`.toUpperCase() : '#';
                      const isBacklines = zonaActiva === 'backlines';
                      const expStr = c.expediere || '';
                      const daysUntilExp = daysUntil(expStr);
                      const isPreOneDay = zonaActiva === 'precomanda' && daysUntilExp === 1;
                      const isPreToday = zonaActiva === 'precomanda' && daysUntilExp === 0;
                      const motivesData: any = (c as any).motive_comanda_neconfirmata;
                      let motivesActiveCount = 0;

                      if (motivesData) {
                        // Check if it's the new structure with count and motives array
                        if ('count' in motivesData && 'motives' in motivesData) {
                          motivesActiveCount = motivesData.motives?.length || 0;
                        } else {
                          // Old structure - count active motives
                          const motivesObj = motivesData || {};
                          motivesActiveCount = Object.keys(motivesObj).filter((k) => {
                            const v = motivesObj[k]?.meta_value;
                            return v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                          }).length;
                        }
                      }
                      const totalCols = isBacklines ? 7 : 6;
                      return (
                        <TableRow key={`${c.ID}-main`} className={`${(highlightedOrderId === c.ID || isPreOneDay) ? 'bg-green-100' : ''}`}>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://darurialese.com/wp-admin/post.php?post=${c.ID}&action=edit`, '_blank')}
                              title={`Deschide comanda #${c.ID}`}
                            >
                              #{c.ID}
                            </Button>
                          </TableCell>
                          {zonaActiva === 'backlines' && (
                            <TableCell>
                              {(() => {
                                const r = (c.ramburs || '').toString().trim();
                                const mtc = (c.metodatransportcustom || '').toString().trim();
                                const token = r ? r.split(/\s+/)[0] : '';
                                const courierText = (token || mtc || '').trim();
                                const lower = courierText.toLowerCase();
                                const isDPD = lower.includes('dpd');
                                const isFAN = lower.includes('fan');
                                return (
                                  <div className="flex items-center gap-2 min-w-[260px]">
                                    {courierText ? (
                                      <>
                                        {isDPD && (
                                          <img src="/curieri/dpd.jpg" alt="DPD" className="w-6 h-4 object-contain rounded bg-white" />
                                        )}
                                        {isFAN && (
                                          <img src="/curieri/fan.jpg" alt="FAN Courier" className="w-6 h-4 object-contain rounded bg-white" />
                                        )}
                                        {/*<span className="text-xs text-muted-foreground">{courierText}</span>*/}
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                    <input
                                      type="text"
                                      value={c.awb_curier || ''}
                                      readOnly
                                      placeholder="AWB curier"
                                      className="h-7 px-2 py-1 text-xs border rounded w-[180px] bg-background text-foreground border-input"
                                      title={c.awb_curier || ''}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 px-2"
                                      onClick={() => handleOpenAwbModal(c, courierText)}
                                      disabled={!c.awb_curier}
                                      title={c.awb_curier ? `Istoric AWB ${c.awb_curier}` : 'Fără AWB'}
                                      aria-label={c.awb_curier ? `Istoric AWB ${c.awb_curier}` : 'Fără AWB'}
                                    >
                                      <Info className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })()}
                            </TableCell>
                          )}
                          <TableCell>
                            {(() => {
                              const notesCount = Array.isArray(c.notes) ? c.notes.length : 0;
                              const bFirst = (c.billing_details?._billing_first_name || '').trim();
                              const bLast = (c.billing_details?._billing_last_name || '').trim();
                              const sFirst = (c.shipping_details._shipping_first_name || '').trim();
                              const sLast = (c.shipping_details._shipping_last_name || '').trim();
                              const billingName = `${bFirst} ${bLast}`.trim();
                              const shippingName = `${sFirst} ${sLast}`.trim();
                              // Primary display: prefer billing name if available, else shipping
                              const primaryName = billingName || shippingName || '';
                              // Compare names case-insensitive without extra spaces
                              const norm = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();
                              const showSecondary = billingName && shippingName && norm(billingName) !== norm(shippingName);
                              const secondaryName = billingName && shippingName
                                ? (primaryName === billingName ? shippingName : billingName)
                                : '';
                              return (
                                <div className="flex items-start gap-2 min-w-0">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-base sm:text-lg font-semibold leading-none truncate flex items-center gap-1" title={primaryName || '-' }>
                                      <button 
                                        className="truncate text-left hover:text-primary hover:underline cursor-pointer"
                                        onClick={() => { setConfirmOrder(c); setShowConfirmModal(true); }}
                                        title="Click pentru a deschide dialogul de confirmare"
                                      >
                                        {primaryName || '-'}
                                      </button>
                                      {(() => {
                                        const v: any = (c as any).comandaCadou;
                                        // Check if v is explicitly false - need to handle this specific case
                                        const isGift = v !== false && (v === 1 || v === '1' || v === true || String(v || '').trim() === '1');
                                        return isGift ? (
                                          <Gift className="w-4 h-4 text-pink-600 shrink-0" title="Acest colet este oferit cadou" />
                                        ) : null;
                                      })()}
                                    </div>
                                    {showSecondary && secondaryName && (
                                      <div className="mt-0.5 text-[11px] text-muted-foreground truncate" title={secondaryName}>
                                        <button 
                                          className="text-muted-foreground hover:text-primary hover:underline cursor-pointer truncate"
                                          onClick={() => { setConfirmOrder(c); setShowConfirmModal(true); }}
                                          title="Click pentru a deschide dialogul de confirmare"
                                        >
                                          {secondaryName}
                                        </button>
                                      </div>
                                    )}
                                    {(() => {
                                      const comp = (c.billing_details?._billing_numefirma || '').trim();
                                      return comp ? (
                                        <div className="mt-0.5 text-[11px] text-muted-foreground truncate" title={comp}>
                                          Firma: <button 
                                            className="font-medium text-foreground hover:text-primary hover:underline cursor-pointer"
                                            onClick={() => { setConfirmOrder(c); setShowConfirmModal(true); }}
                                            title="Click pentru a deschide dialogul de confirmare"
                                          >
                                            {comp}
                                          </button>
                                        </div>
                                      ) : null;
                                    })()}
                                    {isPreOneDay && (
                                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-400" title="Poate fi sunat – pleacă mâine">
                                        <PhoneCall className="w-3 h-3" />
                                        <span>Poate fi sunat – pleacă mâine</span>
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 ml-1 flex items-center gap-1 shrink-0"
                                    onClick={() => { setNotesOrder(c); setShowNotesPanel(true); }}
                                    title={notesCount > 0 ? `Vezi notițe (${notesCount})` : 'Fără notițe'}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-xs">{notesCount}</span>
                                  </Button>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>{rawDate ? formatDate(rawDate) : '-'}</TableCell>
                          <TableCell>{c.payment_method_title || '-'}</TableCell>
                          {zonaActiva === 'precomanda' && (
                            <>
                              <TableCell>{(c.expediere && String(c.expediere).trim()) || '-'}</TableCell>
                              <TableCell>{(daysUntilExp ?? null) !== null ? (isPreToday ? (
                                <div className="flex items-center gap-2">
                                  <span>Azi</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => alert('Mută în producție – în curând')}
                                    title="Muta in productie"
                                    aria-label="Muta in productie"
                                  >
                                    <span>Muta in productie</span>
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </div>
                              ) : daysUntilExp) : '-'}</TableCell>
                            </>
                          )}
                          <TableCell>
                            {(() => {
                              const shippingPhone = (c.shipping_details as any)?._shipping_phone || '';
                              const billingPhone = (c.billing_details as any)?._billing_phone || '';
                              const telHref = (v: string) => `tel:${String(v).replace(/[^+\d]/g, '')}`;
                              const renderPhone = (label: string, val: string) => {
                                const invalid = !isRomanianPhoneNumber(val);
                                return (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground">{label}:</span>
                                    {invalid ? (
                                      <span className="inline-flex items-center gap-1 text-red-600 text-sm" title="Telefon invalid – format greșit">
                                        <AlertTriangle className="w-4 h-4" />
                                        <a href={telHref(val)} className="text-red-600 hover:underline">{val}</a>
                                      </span>
                                    ) : (
                                      <a href={telHref(val)} className="text-blue-600 hover:underline text-sm">{val}</a>
                                    )}
                                  </div>
                                );
                              };
                              if (!shippingPhone && !billingPhone) return '-';
                              // Always show both entries when at least one exists; use '-' placeholder if one is missing
                              const bp = String(billingPhone || '').trim();
                              const sp = String(shippingPhone || '').trim();
                              const phonesDifferent = !!bp && !!sp && bp !== sp;
                              return (
                                <div className={`${phonesDifferent ? 'relative border border-red-500 rounded p-1 bg-red-50/40' : ''} flex flex-col gap-0.5`}>
                                  {phonesDifferent && (
                                    <AlertTriangle className="absolute -top-2 -right-2 w-4 h-4 text-red-600 bg-white rounded-full border border-red-500" title="Numere diferite Billing vs Shipping" />
                                  )}
                                  {billingPhone ? (
                                    renderPhone('Billing', billingPhone)
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-muted-foreground">Billing:</span>
                                      <span className="text-sm">-</span>
                                    </div>
                                  )}
                                  {shippingPhone ? (
                                    renderPhone('Shipping', shippingPhone)
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-muted-foreground">Shipping:</span>
                                      <span className="text-sm">-</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const e = String(email || '').trim();
                              if (!e) return '-';
                              const valid = isLikelyValidEmail(e);
                              return (
                                <div className={`flex items-center justify-between gap-2 border rounded px-2 py-1 ${valid ? 'border-input bg-background' : 'border-red-500 bg-red-50/40'}`}>
                                  <div className="min-w-0">
                                    {valid ? (
                                      <a href={`mailto:${e}`} className="text-blue-600 hover:underline truncate block" title={e}>{e}</a>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-red-600 truncate" title="Email invalid – lipsă @ sau terminație greșită (ex: .con)">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{e}</span>
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 shrink-0"
                                    title="Trimite email"
                                    aria-label="Trimite email"
                                    onClick={() => {
                                      try {
                                        const stored = localStorage.getItem('userData');
                                        let from = 'office@darurialese.ro';
                                        if (stored) {
                                          const ud = JSON.parse(stored);
                                          if (ud && typeof ud.email === 'string' && ud.email.trim()) from = ud.email.trim();
                                        }
                                        setEmailTo(e);
                                        setEmailFrom(from);
                                        setEmailSubject(`Mesaj comanda #${c.ID}`);
                                        setEmailMessage('');
                                        setShowEmailSendModal(true);
                                      } catch {
                                        setEmailTo(e);
                                        setEmailFrom('office@darurialese.ro');
                                        setEmailSubject(`Mesaj comanda #${c.ID}`);
                                        setEmailMessage('');
                                        setShowEmailSendModal(true);
                                      }
                                    }}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })()}
                          </TableCell>
                          {zonaActiva === 'backlines' && (
                            <TableCell>
                              {c.post_status ? (
                                <Badge variant="secondary">{c.post_status}</Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          )}
                          {zonaActiva === 'neconfirmate' && (
                            <TableCell>
                              {(() => {
                                const motivesData = (c as any).motive_comanda_neconfirmata;
                                let activeCount = 0;
                                let motiveTitles: string[] = [];

                                if (motivesData) {
                                  // Check if it's the new structure with count and motives array
                                  if ('count' in motivesData && 'motives' in motivesData) {
                                    const motives = motivesData.motives || [];
                                    activeCount = motives.length;
                                    motiveTitles = motives.map((m: any) => m.motiv_neconfirmare || '');
                                  } else {
                                    // Old structure - count active motives
                                    const motivesObj = motivesData || {};
                                    const ids = Object.keys(motivesObj);
                                    activeCount = ids.filter((k) => {
                                      const v = motivesObj[k]?.meta_value;
                                      return v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                                    }).length;
                                    motiveTitles = ids.map(k => motivesObj[k]?.meta_key?.replace('_motive_comanda_neconfirmata_', '') || k);
                                  }
                                }

                                const checked = Math.min(3, activeCount);
                                return (
                                  <div className="flex items-center gap-2" title={motiveTitles.length ? `Motive: ${motiveTitles.join(', ')}` : 'Fără motive'}>
                                    {[0,1,2].map((i) => (
                                      <input key={i} type="checkbox" className="h-4 w-4" checked={i < checked} readOnly />
                                    ))}
                                    <span className="text-[11px] text-muted-foreground">{activeCount}/3</span>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                );
                              })()}
                            </TableCell>
                          )}
                          <TableCell>
                            {zonaActiva === 'backlines' ? (
                              <BacklinesZoneActions
                                order={c}
                                phone={phone}
                                onAddMention={(order) => { setCurrentOrder(order); setShowProblemModal(true); }}
                              />
                            ) : zonaActiva === 'precomanda' ? (
                              <PrecomandaZoneActions
                                order={c}
                                onMarkLipsaPoze={(order) => { setAddWpNoteText('Lipsa poze'); setAddWpNoteError(null); setAddWpNoteVisibleToCustomer(true); setAddNoteOrderId(order.ID); setShowAddWpNoteModal(true); }}
                                onProcesare={handleMutaProcesareClick}
                                onAnulare={handleMutaAnulareClick}
                                movingCommandId={movingCommandId}
                              />
                            ) : (
                              <div className="flex gap-2">
                                {zonaActiva === 'platainasteptare' ? (
                                  <PlataInAsteptareZoneActions
                                    order={c}
                                    movingCommandId={movingCommandId}
                                    onPrecomanda={handleMutaPrecomandaClick}
                                    onLipsaPoze={handleMutaLipsaPozeClick}
                                    onProcesare={handleMutaProcesareClick}
                                    onAnulare={handleMutaAnulareClick}
                                    onConfirmareOpen={(order) => { setConfirmOrder(order); setShowConfirmModal(true); }}
                                  />
                                ) : zonaActiva === 'inasteptare' ? (
                                  <InAsteptareZoneActions
                                    order={c}
                                    movingCommandId={movingCommandId}
                                    onPrecomanda={handleMutaPrecomandaClick}
                                    onLipsaPoze={handleMutaLipsaPozeClick}
                                    onProcesare={handleMutaProcesareClick}
                                    onAnulare={handleMutaAnulareClick}
                                    onConfirmareOpen={(order) => { setConfirmOrder(order); setShowConfirmModal(true); }}
                                  />
                                ) : zonaActiva === 'neconfirmate' ? (
                                  <NeconfirmateZoneActions
                                    order={c}
                                    movingCommandId={movingCommandId}
                                    motivesActiveCount={motivesActiveCount}
                                    onPrecomanda={handleMutaPrecomandaClick}
                                    onLipsaPoze={handleMutaLipsaPozeClick}
                                    onAnulare={handleMutaAnulareClick}
                                    onConfirmareOpen={(order) => { setConfirmOrder(order); setShowConfirmModal(true); }}
                                  />
                                ) : zonaActiva === 'desunat' ? (
                                  <DeSunatZoneActions
                                    order={c}
                                    movingCommandId={movingCommandId}
                                    onPrecomanda={handleMutaPrecomandaClick}
                                    onLipsaPoze={handleMutaLipsaPozeClick}
                                    onAnulare={handleMutaAnulareClick}
                                    onConfirmareOpen={(order) => { setConfirmOrder(order); setShowConfirmModal(true); }}
                                  />
                                ) : zonaActiva === 'procesare' ? (
                                  <ProcesareZoneActions
                                    order={c}
                                    movingCommandId={movingCommandId}
                                    onPrecomanda={handleMutaPrecomandaClick}
                                    onLipsaPoze={handleMutaLipsaPozeClick}
                                    onAnulare={handleMutaAnulareClick}
                                    onConfirmareOpen={(order) => { setConfirmOrder(order); setShowConfirmModal(true); }}
                                  />
                                ) : (zonaActiva === 'aprobare' || zonaActiva === 'aprobareclient') ? (
                                  <AprobareZoneActions
                                    order={c}
                                    movingCommandId={movingCommandId}
                                    onRetrimitereGrafica={handleRetrimitereGraficaClick}
                                    onProductie={handleMutaProductieClick}
                                    onGraficaGresita={handleMutaGraficaGresitaClick}
                                    onAnulare={handleMutaAnulareClick}
                                  />
                                ) : zonaActiva === 'lipsapoze' ? (
                                  <LipsaPozeZoneActions
                                    order={c}
                                    onFollowUpEmail={(order) => { setFollowUpOrder(order); setFollowUpEmailMessage('Sa nu uite sa trimita poza'); setShowFollowUpEmailModal(true); }}
                                    onOpenWhatsApp={(order) => {
                                      try {
                                        const sp = (order.shipping_details as any)?._shipping_phone || '';
                                        const bp = (order.billing_details as any)?._billing_phone || '';
                                        const pick = String(sp || bp || '').trim();
                                        if (!pick) { alert('Nu există telefon pentru WhatsApp.'); return; }
                                        let s = pick.replace(/\D/g, '');
                                        if (s.startsWith('00')) s = s.slice(2);
                                        if (s.startsWith('40')) {
                                          // OK
                                        } else if (s.startsWith('0')) {
                                          s = '4' + s; // 0XXXXXXXXX -> 4XXXXXXXXX (becomes 40... once prefixed)
                                          if (!s.startsWith('40')) s = '40' + s.slice(1);
                                        } else if (s.startsWith('7') && s.length === 9) {
                                          s = '40' + s;
                                        } else if (s.startsWith('+' )) {
                                          s = s.slice(1);
                                        }
                                        const first = order.billing_details?._billing_first_name || order.shipping_details._shipping_first_name || '';
                                        const last = order.billing_details?._billing_last_name || order.shipping_details._shipping_last_name || '';
                                        const nume = `${first} ${last}`.trim();
                                        const msg = `Bună ziua${nume ? ' ' + nume : ''}, vă rugăm să ne trimiteți poza pentru comanda #${order.ID}. Mulțumim!`;
                                        const url = `https://wa.me/${s}?text=${encodeURIComponent(msg)}`;
                                        window.open(url, '_blank');
                                      } catch (e) {
                                        alert('Nu s-a putut deschide WhatsApp.');
                                      }
                                    }}
                                  />
                                ) : zonaActiva === 'confirmate' ? (
                                  <ConfirmateZoneActions
                                    order={c}
                                  />
                                ) : zonaActiva === 'gresite' ? (
                                  <GresiteZoneActions
                                    order={c}
                                  />
                                ) : (
                                  <>
                                    {isDPD && c.awb_curier && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        title="Trimite tichet DPD"
                                        aria-label="Trimite tichet DPD"
                                        onClick={() => {
                                          setAwbOrder(c);
                                          const awb = (c.awb_curier || '').toString().trim();
                                          setAwbInfo({ awb, courier: courierText });

                                          const first = c.billing_details?._billing_first_name || c.shipping_details._shipping_first_name || '';
                                          const last = c.billing_details?._billing_last_name || c.shipping_details._shipping_last_name || '';
                                          const nm = `${first} ${last}`.trim() || '-';
                                          const id = c.ID ? `#${c.ID}` : '';
                                          const subject = `${awb} - Problema comanda ${nm} ${id}`;

                                          setAwbTicketMessage("");
                                          setAwbTicketGenerating(false);
                                          setAwbTicketSubject(subject);
                                          setShowAwbTicketModal(true);
                                        }}
                                      >
                                        <Send className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => phone && (window.location.href = `tel:${phone}`)}
                                      title="Sună"
                                      aria-label="Sună"
                                    >
                                      <PhoneCall className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" title="Precomandă" aria-label="Precomandă">
                                      <CalendarClock className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaLipsaPozeClick(c.ID)}
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se mută...</span>
                                        </div>
                                      ) : (
                                        "Lipsa poze"
                                      )}
                                    </Button>
                                    <Button variant="destructive" size="sm" title="Anulează" aria-label="Anulează">
                                      <X className="w-4 h-4" />
                                    </Button>
                                    {zonaActiva !== 'confirmare' && (
                                      <Button variant="default" size="sm" title="Confirmă" aria-label="Confirmă">
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Notes off-canvas */}
            <NotesOffCanvas
              showNotesPanel={showNotesPanel}
              notesOrder={notesOrder}
              setShowNotesPanel={setShowNotesPanel}
              setNotesOrder={setNotesOrder}
              setAddWpNoteText={setAddWpNoteText}
              setAddWpNoteError={setAddWpNoteError}
              setAddWpNoteVisibleToCustomer={setAddWpNoteVisibleToCustomer}
              setAddNoteOrderId={setAddNoteOrderId}
              setShowAddWpNoteModal={setShowAddWpNoteModal}
            />

            {/* Add WP Note modal (UI only) */}
            <AddWpNoteModal
              showAddWpNoteModal={showAddWpNoteModal}
              addWpNoteText={addWpNoteText}
              addWpNoteVisibleToCustomer={addWpNoteVisibleToCustomer}
              addWpNoteSubmitting={addWpNoteSubmitting}
              addWpNoteError={addWpNoteError}
              addNoteOrderId={addNoteOrderId}
              notesOrder={notesOrder}
              awbOrder={awbOrder}
              setShowAddWpNoteModal={setShowAddWpNoteModal}
              setAddWpNoteText={setAddWpNoteText}
              setAddWpNoteVisibleToCustomer={setAddWpNoteVisibleToCustomer}
              setAddWpNoteSubmitting={setAddWpNoteSubmitting}
              setAddWpNoteError={setAddWpNoteError}
              setAddNoteOrderId={setAddNoteOrderId}
              setNotesOrder={setNotesOrder}
              setAwbOrder={setAwbOrder}
            />

            {/* Retrimitere grafică modal */}
            <RetrimitereGraficaModal
              showResendGraphicModal={showResendGraphicModal}
              resendOrder={resendOrder}
              resendSubmitting={resendSubmitting}
              resendViaEmail={resendViaEmail}
              resendViaSMS={resendViaSMS}
              resendViaWhatsApp={resendViaWhatsApp}
              resendMessage={resendMessage}
              setShowResendGraphicModal={setShowResendGraphicModal}
              setResendOrder={setResendOrder}
              setResendSubmitting={setResendSubmitting}
              setResendViaEmail={setResendViaEmail}
              setResendViaSMS={setResendViaSMS}
              setResendViaWhatsApp={setResendViaWhatsApp}
              setResendMessage={setResendMessage}
            />

            {/* Email compose modal (UI only) */}
            <EmailComposeModal
              showEmailSendModal={showEmailSendModal}
              emailSubmitting={emailSubmitting}
              emailTo={emailTo}
              emailFrom={emailFrom}
              emailSubject={emailSubject}
              emailMessage={emailMessage}
              setShowEmailSendModal={setShowEmailSendModal}
              setEmailSubmitting={setEmailSubmitting}
              setEmailTo={setEmailTo}
              setEmailFrom={setEmailFrom}
              setEmailSubject={setEmailSubject}
              setEmailMessage={setEmailMessage}
            />

            {/* AWB Ticket modal (DPD backline) */}
            <AwbTicketModal
              showAwbTicketModal={showAwbTicketModal}
              sendTicketSubmitting={sendTicketSubmitting}
              awbTicketMessage={awbTicketMessage}
              awbTicketGenerating={awbTicketGenerating}
              awbTicketTo={awbTicketTo}
              awbTicketCc={awbTicketCc}
              awbTicketSubject={awbTicketSubject}
              awbEditorRef={awbEditorRef}
              orderId={awbOrder?.ID}
              awbData={awbData}
              awbOrder={awbOrder}
              setShowAwbTicketModal={setShowAwbTicketModal}
              setSendTicketSubmitting={setSendTicketSubmitting}
              setAwbTicketMessage={setAwbTicketMessage}
              setAwbTicketGenerating={setAwbTicketGenerating}
            />

            {/* AWB tracking off-canvas (right, full height) */}
            <AwbTrackingOffCanvas
              showAwbModal={showAwbModal}
              awbLoading={awbLoading}
              awbError={awbError}
              awbData={awbData}
              awbInfo={awbInfo}
              awbOrder={awbOrder}
              setShowAwbModal={setShowAwbModal}
              setAwbError={setAwbError}
              setAwbData={setAwbData}
              setAwbInfo={setAwbInfo}
              setAwbOrder={setAwbOrder}
              setHighlightedOrderId={setHighlightedOrderId}
              setShowAddWpNoteModal={setShowAddWpNoteModal}
              setAddNoteOrderId={setAddNoteOrderId}
              setShowAwbTicketModal={setShowAwbTicketModal}
              setAwbTicketMessage={setAwbTicketMessage}
              setAwbTicketGenerating={setAwbTicketGenerating}
              setAwbTicketSubject={setAwbTicketSubject}
            />



        </div>
      </main>

      {/* Fixed bottom toolbar: search + quick status buttons */}
      <div className="fixed bottom-0 left-32 right-0 z-40 bg-white dark:bg-[#020817] border-t border-border">
        <div className="flex items-center gap-2 p-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={zonaActiva === 'precomanda' ? 'default' : 'outline'}
              onClick={() => selecteazaZona('Precomanda')}
              className="flex items-center gap-1"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Precomandă</span>
              <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-muted px-1 text-xs text-black ">
                {statsData.find(s => s.title === 'Precomanda')?.value ?? 0}
              </span>
            </Button>
            <Button
              size="sm"
              variant={zonaActiva === 'backlines' ? 'default' : 'outline'}
              onClick={() => selecteazaZona('Backlines')}
              className="flex items-center gap-1"
            >
              <Layers className="w-4 h-4" />
              <span>Backlines</span>
              <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-muted px-1 text-xs text-black">
                {statsData.find(s => s.title === 'Backlines')?.value ?? 0}
              </span>
            </Button>
            <Button
              size="sm"
              variant={zonaActiva === 'confirmare' ? 'default' : 'outline'}
              onClick={() => selecteazaZona('Confirmare')}
              className="flex items-center gap-1"
            >
              <BadgeCheck className="w-4 h-4" />
              <span>Confirmate</span>
              <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-muted px-1 text-xs text-black">
                {statsData.find(s => s.title === 'Confirmare')?.value ?? 0}
              </span>
            </Button>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută comenzi după nume sau ID..."
            className="ml-2 p-2 border rounded-md w-full text-sm bg-background text-foreground border-input placeholder:text-muted-foreground"
          />
        </div>
      </div>



      {/* Problem reporting modal */}
      <ProblemDialog
        open={showProblemModal}
        onOpenChange={setShowProblemModal}
        currentOrder={currentOrder}
        problemZone={problemZone}
        setProblemZone={setProblemZone}
        problemProduct={problemProduct}
        setProblemProduct={setProblemProduct}
        problemDescription={problemDescription}
        setProblemDescription={setProblemDescription}
        onSubmit={handleSubmitProblem}
      />

      {/* Gallery modal */}
      <GalleryDialog
        open={showGalleryModal}
        onOpenChange={setShowGalleryModal}
        galleryImages={galleryImages}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        selectedImageIndex={selectedImageIndex}
        setSelectedImageIndex={setSelectedImageIndex}
      />

        <StudiuDialog
            open={showStudiuModal}
            onOpenChange={setShowStudiuModal}
            isLoading={false}
            items={[]}
            markLoading={{}}
            onMarkPrintat={(id) => console.log('Mark printat', id)}
            onMarkGravat={(id) => console.log('Mark gravat', id)}
            onMarkDebitat={(id) => console.log('Mark debitat', id)}
            />

        <InventoryDialog 
            open={showInventoryModal} 
            onOpenChange={setShowInventoryModal}
            isLoading={false}
            isEditMode={false}
            setIsEditMode={() => {}}
            onSave={() => {}}
            isSaving={false}
            newStockValues={{}}
            setNewStockValues={() => {}}
            inventoryData={[]}
            inventorySearchTerm=""
            setInventorySearchTerm={() => {}}
        />

        <ConfirmOrderDialog 
            open={showConfirmModal} 
            onOpenChange={setShowConfirmModal}
            confirmOrder={confirmOrder}
            activeConfirmTab='confirmare'
            setActiveConfirmTab={setActiveConfirmTab}
            activeAddressTab={activeAddressTab}
            setActiveAddressTab={setActiveAddressTab}
            refreshUserData={refreshUserData}
        />


    </>
  );
};
