import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info, Package, AlertTriangle, ShoppingCart, Eye, Printer, Gift, Database, ChevronDown, ChevronUp, Download, ChevronLeft, ChevronRight, MessageSquare, Send, PhoneCall, CalendarClock, Layers, BadgeCheck, Plus, Mail, MessageCircle, ImageOff, Cog } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { ProblemDialog, GalleryDialog, StudiuDialog, InventoryDialog, ConfirmOrderDialog } from "@/components/layout/dialogs";

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
  // Add WP note modal state (UI only for now)
  const [showAddWpNoteModal, setShowAddWpNoteModal] = useState(false);
  const [addWpNoteText, setAddWpNoteText] = useState('');
  const [addWpNoteVisibleToCustomer, setAddWpNoteVisibleToCustomer] = useState(true);
  const [addWpNoteSubmitting, setAddWpNoteSubmitting] = useState(false);
  const [addWpNoteError, setAddWpNoteError] = useState<string | null>(null);
  const [addNoteOrderId, setAddNoteOrderId] = useState<number | null>(null);
  // Status filter for backlines
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<Comanda | null>(null);
  const [activeAddressTab, setActiveAddressTab] = useState<'shipping' | 'billing'>('shipping');
  const [activeConfirmTab, setActiveConfirmTab] = useState<'confirmare' | 'sms' | 'notite' | 'puncte' | 'persoane'>('confirmare');
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
  const [awbTicketTo, setAwbTicketTo] = useState<string>("backline@dpd.ro");
  const [awbTicketCc, setAwbTicketCc] = useState<string>("valentina.botan@dpd.ro, manager@darurialese.ro");
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

  // State for inline product annex panel (expanded under status row)
  const [expandedProdPanel, setExpandedProdPanel] = useState<{
    orderId: number;
    productIndex: number;
  } | null>(null);

  // Form state for problem reporting
  const [problemZone, setProblemZone] = useState<string>("");
  const [problemProduct, setProblemProduct] = useState<string>("");
  const [problemDescription, setProblemDescription] = useState<string>("");

  // State for tracking which command is being moved or started
  const [movingCommandId, setMovingCommandId] = useState<number | null>(null);
  const [startingCommandId, setStartingCommandId] = useState<number | null>(null);

  // Backlines tasks: checked IDs per day+zone, persisted in localStorage
  const [taskCheckedIds, setTaskCheckedIds] = useState<number[]>([]);
  const getTodayStr = () => {
    try {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return '';
    }
  };
  const getTasksKey = (zone: string) => `tasks:${getTodayStr()}:${(zone || '').toLowerCase()}`;
  const loadTasksFromStorage = (zone: string) => {
    try {
      const raw = localStorage.getItem(getTasksKey(zone));
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'number');
    } catch {}
    return [];
  };
  const saveTasksToStorage = (zone: string, ids: number[]) => {
    try {
      localStorage.setItem(getTasksKey(zone), JSON.stringify(ids));
    } catch {}
  };
  useEffect(() => {
    // Load when zone changes
    setTaskCheckedIds(loadTasksFromStorage(zonaActiva));
  }, [zonaActiva]);
  const isTaskChecked = (id: number) => taskCheckedIds.includes(id);
  const toggleTaskChecked = (id: number) => {
    setTaskCheckedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      // Persist per day+zone
      saveTasksToStorage(zonaActiva, next);
      return next;
    });
  };

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
  const [chatInput, setChatInput] = useState('');
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
  }, [comenzi, selectedProductId, selectedShippingData, searchTerm, formatDate, movingCommandId, filterTipGrafica, zonaActiva, selectedStatus]);


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

          {/* Cache/Live status indicator - always visible on all screen sizes */}
          {/*<div className="border-2 border-green-500 rounded-lg p-2 flex items-center justify-center col-span-1 sm:col-span-1">*/}
          {/*  {isLoadingStatus ? (*/}
          {/*    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>*/}
          {/*  ) : (*/}
          {/*    <div className="flex items-center">*/}
          {/*      <div */}
          {/*        className={`w-4 h-4 rounded-full mr-2 ${*/}
          {/*          isFromCache */}
          {/*            ? 'bg-green-500 animate-pulse' */}
          {/*            : 'bg-red-500 animate-pulse'*/}
          {/*        }`}*/}
          {/*      ></div>*/}
          {/*      <span className="text-xs font-medium">{isFromCache ? 'Cache' : 'Live'}</span>*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}
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




        {isLoading && <div className="p-4">Se încarcă statisticile...</div>}

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

            {/* Backlines tasks summary */}
          {zonaActiva === 'backlines' && displayedComenzi.length > 0 && (
            (() => {
              const checked = displayedComenzi.filter((c) => isTaskChecked(c.ID)).length;
              const total = displayedComenzi.length;
              const remaining = Math.max(0, total - checked);
              const nextNames = displayedComenzi.filter((c) => !isTaskChecked(c.ID)).slice(0, 5).map((c) => {
                const first = c.billing_details?._billing_first_name || c.shipping_details._shipping_first_name || '';
                const last = c.billing_details?._billing_last_name || c.shipping_details._shipping_last_name || '';
                return `${first} ${last}`.trim() || `#${c.ID}`;
              });
              return (
                <div className="p-2 border border-border rounded-md bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-xs sm:text-sm">
                    <span className="mr-3"><span className="text-muted-foreground">Bifate azi:</span> <span className="font-semibold">{checked}</span></span>
                    <span><span className="text-muted-foreground">Rămase:</span> <span className="font-semibold">{remaining}</span></span>
                  </div>
                  {nextNames.length > 0 && (
                    <div className="text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">Urmează:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {nextNames.map((n, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-accent text-accent-foreground border border-border">
                            {n}
                          </span>
                        ))}
                        {remaining > nextNames.length && (
                          <span className="text-muted-foreground">+{remaining - nextNames.length} altele</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
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

          {/* Orders table (replaces old grid) */}
            {displayedComenzi.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {zonaActiva === 'backlines' && (
                        <TableHead className="w-10">
                          <span className="sr-only">Task</span>
                        </TableHead>
                      )}
                      <TableHead>ID</TableHead>
                      {zonaActiva === 'backlines' && (
                        <TableHead>Curier</TableHead>
                      )}
                      <TableHead>Nume</TableHead>
                      <TableHead>Data comandă</TableHead>
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
                      const motivesObj: any = (c as any).motive_comanda_neconfirmata || {};
                      const motivesActiveCount = Object.keys(motivesObj || {}).filter((k) => {
                        const v = motivesObj[k]?.meta_value;
                        return v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                      }).length;
                      const totalCols = isBacklines ? 7 : 6;
                      return (
                        <TableRow key={`${c.ID}-main`} className={`${(highlightedOrderId === c.ID || isTaskChecked(c.ID) || isPreOneDay) ? 'bg-green-100' : ''}`}>
                          {zonaActiva === 'backlines' && (
                            <TableCell className="w-10">
                              <input
                                type="checkbox"
                                className="h-4 w-4 align-middle"
                                checked={isTaskChecked(c.ID)}
                                onChange={() => toggleTaskChecked(c.ID)}
                                title={isTaskChecked(c.ID) ? 'Debifează task' : 'Bifează task'}
                              />
                            </TableCell>
                          )}
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
                                        <span className="text-xs text-muted-foreground">{courierText}</span>
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
                                      <span className="truncate">{primaryName || '-'}</span>
                                      {(() => {
                                        const v: any = (c as any).fara_factura_in_colet;
                                        const isGift = v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                                        return isGift ? (
                                          <Gift className="w-4 h-4 text-pink-600 shrink-0" title="Acest colet este oferit cadou" />
                                        ) : null;
                                      })()}
                                    </div>
                                    {showSecondary && secondaryName && (
                                      <div className="mt-0.5 text-[11px] text-muted-foreground truncate" title={secondaryName}>
                                        {secondaryName}
                                      </div>
                                    )}
                                    {(() => {
                                      const comp = (c.billing_details?._billing_numefirma || '').trim();
                                      return comp ? (
                                        <div className="mt-0.5 text-[11px] text-muted-foreground truncate" title={comp}>
                                          Firma: <span className="font-medium text-foreground">{comp}</span>
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
                                const motives = (c as any).motive_comanda_neconfirmata || {};
                                const ids = Object.keys(motives || {});
                                const activeCount = ids.filter((k) => {
                                  const v = motives[k]?.meta_value;
                                  return v === 1 || v === '1' || v === true || String(v || '').trim() === '1';
                                }).length;
                                const checked = Math.min(3, activeCount);
                                return (
                                  <div className="flex items-center gap-2" title={ids.length ? `Motive: ${ids.join(', ')}` : 'Fără motive'}>
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
                            ) : (
                              <div className="flex gap-2">
                                {zonaActiva === 'precomanda' ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => { setAddWpNoteText('Lipsa poze'); setAddWpNoteError(null); setAddWpNoteVisibleToCustomer(true); setAddNoteOrderId(c.ID); setShowAddWpNoteModal(true); }}
                                      title="Lipsa poze"
                                      aria-label="Lipsa poze"
                                    >
                                      Lipsa poze
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaProcesareClick(c.ID)}
                                      title="Procesare"
                                      aria-label="Procesare"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se procesează...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Procesare</span>
                                          <Cog className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleMutaAnulareClick(c.ID)}
                                      title="Anulează"
                                      aria-label="Anulează"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          <span>Se anulează...</span>
                                        </div>
                                      ) : (
                                        <X className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </>
                                ) : (zonaActiva === 'platainasteptare' || zonaActiva === 'inasteptare') ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaPrecomandaClick(c.ID)}
                                      title="Precomanda"
                                      aria-label="Precomanda"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se procesează...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Precomanda</span>
                                          <CalendarClock className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaLipsaPozeClick(c.ID)}
                                      title="Lipsa poza"
                                      aria-label="Lipsa poza"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se mută...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Lipsa poza</span>
                                          <ImageOff className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaProcesareClick(c.ID)}
                                      title="Procesare"
                                      aria-label="Procesare"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se procesează...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Procesare</span>
                                          <Cog className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleMutaAnulareClick(c.ID)}
                                      title="Anulează"
                                      aria-label="Anulează"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          <span>Se anulează...</span>
                                        </div>
                                      ) : (
                                        <X className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => { setConfirmOrder(c); setShowConfirmModal(true); }}
                                      title="Confirmare"
                                      aria-label="Confirmare"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                                                  </>
                                                                ) : (zonaActiva === 'neconfirmate' || zonaActiva === 'desunat' || zonaActiva === 'procesare') ? (
                                                                  <>
                                                                    <Button
                                                                      variant="outline"
                                                                      size="sm"
                                                                      onClick={() => handleMutaPrecomandaClick(c.ID)}
                                                                      title="Precomanda"
                                                                      aria-label="Precomanda"
                                                                      disabled={movingCommandId === c.ID}
                                                                    >
                                                                      {movingCommandId === c.ID ? (
                                                                        <div className="flex items-center">
                                                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                                                          <span>Se procesează...</span>
                                                                        </div>
                                                                      ) : (
                                                                        <>
                                                                          <span>Precomanda</span>
                                                                          <CalendarClock className="w-4 h-4 ml-1" />
                                                                        </>
                                                                      )}
                                                                    </Button>
                                                                    <Button
                                                                      variant="outline"
                                                                      size="sm"
                                                                      onClick={() => handleMutaLipsaPozeClick(c.ID)}
                                                                      title="Lipsa poza"
                                                                      aria-label="Lipsa poza"
                                                                      disabled={movingCommandId === c.ID}
                                                                    >
                                                                      {movingCommandId === c.ID ? (
                                                                        <div className="flex items-center">
                                                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                                                          <span>Se mută...</span>
                                                                        </div>
                                                                      ) : (
                                                                        <>
                                                                          <span>Lipsa poza</span>
                                                                          <ImageOff className="w-4 h-4 ml-1" />
                                                                        </>
                                                                      )}
                                                                    </Button>
                                                                    {(zonaActiva !== 'neconfirmate' || motivesActiveCount >= 3) && (
                                                                      <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleMutaAnulareClick(c.ID)}
                                                                        title="Anulează"
                                                                        aria-label="Anulează"
                                                                        disabled={movingCommandId === c.ID}
                                                                      >
                                                                        {movingCommandId === c.ID ? (
                                                                          <div className="flex items-center">
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                            <span>Se anulează...</span>
                                                                          </div>
                                                                        ) : (
                                                                          <X className="w-4 h-4" />
                                                                        )}
                                                                      </Button>
                                                                    )}
                                                                    <Button
                                                                      variant="default"
                                                                      size="sm"
                                                                      onClick={() => { setConfirmOrder(c); setShowConfirmModal(true); }}
                                                                      title="Confirmare"
                                                                      aria-label="Confirmare"
                                                                    >
                                                                      <Check className="w-4 h-4" />
                                                                    </Button>
                                                                  </>
                                                                ) : (zonaActiva === 'aprobare' || zonaActiva === 'aprobareclient') ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRetrimitereGraficaClick(c.ID)}
                                      title="Retrimitere grafica"
                                      aria-label="Retrimitere grafica"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se retrimite...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Retrimitere grafica</span>
                                          <Send className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaProductieClick(c.ID)}
                                      title="Productie"
                                      aria-label="Productie"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se procesează...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Productie</span>
                                          <Layers className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaGraficaGresitaClick(c.ID)}
                                      title="Grafica gresita"
                                      aria-label="Grafica gresita"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se mută...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Grafica gresita</span>
                                          <AlertTriangle className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleMutaAnulareClick(c.ID)}
                                      title="Anulează"
                                      aria-label="Anulează"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          <span>Se anulează...</span>
                                        </div>
                                      ) : (
                                        <X className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </>
                                ) : zonaActiva === 'lipsapoze' ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => { setFollowUpOrder(c); setFollowUpEmailMessage('Sa nu uite sa trimita poza'); setShowFollowUpEmailModal(true); }}
                                      title="Trimite email Follow up"
                                      aria-label="Trimite email Follow up"
                                      className="inline-flex items-center gap-1"
                                    >
                                      <Mail className="w-4 h-4" />
                                      <span>Follow up</span>
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        try {
                                          const sp = (c.shipping_details as any)?._shipping_phone || '';
                                          const bp = (c.billing_details as any)?._billing_phone || '';
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
                                          const first = c.billing_details?._billing_first_name || c.shipping_details._shipping_first_name || '';
                                          const last = c.billing_details?._billing_last_name || c.shipping_details._shipping_last_name || '';
                                          const nume = `${first} ${last}`.trim();
                                          const msg = `Bună ziua${nume ? ' ' + nume : ''}, vă rugăm să ne trimiteți poza pentru comanda #${c.ID}. Mulțumim!`;
                                          const url = `https://wa.me/${s}?text=${encodeURIComponent(msg)}`;
                                          window.open(url, '_blank');
                                        } catch (e) {
                                          alert('Nu s-a putut deschide WhatsApp.');
                                        }
                                      }}
                                      title="Cere poza pe WhatsApp"
                                      aria-label="Cere poza pe WhatsApp"
                                      className="inline-flex items-center gap-1"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                      <span>WhatsApp</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaPrecomandaClick(c.ID)}
                                      title="Precomanda"
                                      aria-label="Precomanda"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se procesează...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Precomanda</span>
                                          <CalendarClock className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMutaProcesareClick(c.ID)}
                                      title="Procesare"
                                      aria-label="Procesare"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                          <span>Se procesează...</span>
                                        </div>
                                      ) : (
                                        <>
                                          <span>Procesare</span>
                                          <Cog className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleMutaAnulareClick(c.ID)}
                                      title="Anulează"
                                      aria-label="Anulează"
                                      disabled={movingCommandId === c.ID}
                                    >
                                      {movingCommandId === c.ID ? (
                                        <div className="flex items-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          <span>Se anulează...</span>
                                        </div>
                                      ) : (
                                        <X className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </>
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
            {showNotesPanel && (
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
            )}

            {/* Add WP Note modal (UI only) */}
            {showAddWpNoteModal && (
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
            )}

            {/* Retrimitere grafică modal */}
            {showResendGraphicModal && (
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
                        <textarea id="resend-msg" className="mt-1 w-full min-h-[140px] p-2 border rounded bg-background text-foreground border-input text-sm" placeholder="Scrie mesajul care va fi trimis..." value={resendMessage} onChange={(e) => setResendMessage(e.target.value)} disabled={resendSubmitting} />
                      </div>
                    </div>
                    <div className="p-3 border-t border-border flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { if (!resendSubmitting) { setShowResendGraphicModal(false); setResendOrder(null); } }}>Renunță</Button>
                      <Button size="sm" onClick={() => { if (resendSubmitting) return; setResendSubmitting(true); setTimeout(() => { setResendSubmitting(false); setShowResendGraphicModal(false); setResendOrder(null); }, 300); }}>
                        {resendSubmitting ? 'Se trimite…' : 'Trimite'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email compose modal (UI only) */}
            {showEmailSendModal && (
              <div className="fixed inset-0 z-[60]">
                {/* Backdrop closes only this modal */}
                <div className="absolute inset-0 bg-black/50" onClick={() => { if (!emailSubmitting) { setShowEmailSendModal(false); setEmailTo(''); setEmailFrom(''); setEmailSubject(''); setEmailMessage(''); } }} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-[96vw] sm:w-[640px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#020817] border border-border rounded-md shadow-xl">
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <div className="font-semibold">Trimite email</div>
                      <Button variant="ghost" size="sm" onClick={() => { if (!emailSubmitting) { setShowEmailSendModal(false); setEmailTo(''); setEmailFrom(''); setEmailSubject(''); setEmailMessage(''); } }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-3 space-y-3 text-sm">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor="email-to" className="text-sm">Către</Label>
                          <input id="email-to" type="text" className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} disabled={emailSubmitting} />
                        </div>
                        <div>
                          <Label htmlFor="email-from" className="text-sm">De la</Label>
                          <input id="email-from" type="text" className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} disabled={emailSubmitting} />
                        </div>
                        <div>
                          <Label htmlFor="email-subject" className="text-sm">Subiect</Label>
                          <input id="email-subject" type="text" className="mt-1 w-full h-9 px-2 border rounded bg-background text-foreground border-input text-sm" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} disabled={emailSubmitting} />
                        </div>
                        <div>
                          <Label htmlFor="email-message" className="text-sm">Mesaj</Label>
                          <textarea id="email-message" className="mt-1 w-full min-h-[160px] p-2 border rounded bg-background text-foreground border-input text-sm" placeholder="Scrie mesajul aici..." value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} disabled={emailSubmitting} />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-border flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { if (!emailSubmitting) { setShowEmailSendModal(false); setEmailTo(''); setEmailFrom(''); setEmailSubject(''); setEmailMessage(''); } }}>Renunță</Button>
                      <Button size="sm"
                        disabled={emailSubmitting || !isLikelyValidEmail(emailTo) || !isLikelyValidEmail(emailFrom)}
                        onClick={() => {
                          if (emailSubmitting) return;
                          setEmailSubmitting(true);
                          setTimeout(() => {
                            setEmailSubmitting(false);
                            setShowEmailSendModal(false);
                            setEmailTo(''); setEmailFrom(''); setEmailSubject(''); setEmailMessage('');
                          }, 300);
                        }}
                      >
                        {emailSubmitting ? 'Se trimite…' : 'Trimite'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AWB Ticket modal (DPD backline) */}
            {showAwbTicketModal && (
              <div className="fixed inset-0 z-[60]">
                {/* Backdrop closes only this modal */}
                <div className="absolute inset-0 bg-black/50" onClick={() => { if (!sendTicketSubmitting) { setShowAwbTicketModal(false); setAwbTicketMessage(""); setAwbTicketGenerating(false); } }} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-[96vw] sm:w-[680px] md:w-[760px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#020817] border border-border rounded-md shadow-xl">
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <div className="font-semibold">Trimite tichet DPD</div>
                      <Button variant="ghost" size="sm" onClick={() => { if (!sendTicketSubmitting) { setShowAwbTicketModal(false); setAwbTicketMessage(""); setAwbTicketGenerating(false); } }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-3 space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground w-16">Către</div>
                        <input 
                          type="text" 
                          className="flex-1 p-1 border rounded text-sm" 
                          value={awbTicketTo} 
                          onChange={(e) => setAwbTicketTo(e.target.value)}
                          disabled={sendTicketSubmitting}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground w-16">CC</div>
                        <input 
                          type="text" 
                          className="flex-1 p-1 border rounded text-sm" 
                          value={awbTicketCc} 
                          onChange={(e) => setAwbTicketCc(e.target.value)}
                          disabled={sendTicketSubmitting}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground w-16">Subiect</div>
                        <input 
                          type="text" 
                          className="flex-1 p-1 border rounded text-sm" 
                          value={awbTicketSubject || (() => {
                            const first = awbOrder?.billing_details?._billing_first_name || awbOrder?.shipping_details._shipping_first_name || '';
                            const last = awbOrder?.billing_details?._billing_last_name || awbOrder?.shipping_details._shipping_last_name || '';
                            const nm = `${first} ${last}`.trim() || '-';
                            const id = awbOrder?.ID ? `#${awbOrder.ID}` : '';
                            const awb = awbInfo?.awb || 'AWB';
                            return `${awb} - Problema comanda ${nm} ${id}`;
                          })()}
                          onChange={(e) => setAwbTicketSubject(e.target.value)}
                          disabled={sendTicketSubmitting}
                        />
                      </div>

                      {/* Mesaj */}
                      <div>
                        <Label className="text-sm">Mesaj</Label>
                        {/* Toolbar */}
                        <div className="mt-1 mb-2 flex flex-wrap gap-1">
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('bold'); }}>B</Button>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2 italic" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('italic'); }}>I</Button>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2 underline" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('underline'); }}>U</Button>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('insertUnorderedList'); }}>• Listă</Button>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('insertOrderedList'); }}>1. Listă</Button>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('formatBlock', false, 'h2'); }}>H2</Button>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('formatBlock', false, 'h3'); }}>H3</Button>
                          <select
                            className="h-7 px-2 border border-input rounded text-xs bg-background text-foreground"
                            disabled={sendTicketSubmitting}
                            defaultValue="normal"
                            onChange={(e) => {
                              awbEditorRef.current?.focus();
                              if (e.target.value === 'normal') {
                                document.execCommand('removeFormat');
                              } else if (e.target.value === 'small') {
                                document.execCommand('fontSize', false, '2');
                              } else if (e.target.value === 'medium') {
                                document.execCommand('fontSize', false, '3');
                              } else if (e.target.value === 'large') {
                                document.execCommand('fontSize', false, '5');
                              }
                            }}
                          >
                            <option value="normal">Text</option>
                            <option value="small">Mic</option>
                            <option value="medium">Mediu</option>
                            <option value="large">Mare</option>
                          </select>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={sendTicketSubmitting}
                                  onClick={() => { awbEditorRef.current?.focus(); document.execCommand('removeFormat'); }}>Curăță</Button>
                        </div>
                        {/* Editor */}
                        <div
                          ref={awbEditorRef}
                          className="min-h-[200px] p-2 border rounded bg-background text-foreground border-input text-sm focus:outline-none"
                          contentEditable={!sendTicketSubmitting}
                          onInput={(e) => setAwbTicketMessage((e.target as HTMLDivElement).innerHTML)}
                          dangerouslySetInnerHTML={{ __html: awbTicketMessage || '' }}
                        />
                        <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={sendTicketSubmitting || awbTicketGenerating}
                              onClick={() => {
                                try {
                                  setAwbTicketGenerating(true);
                                  const awb = awbInfo?.awb || '-';
                                  const courier = awbInfo?.courier || 'DPD';
                                  const first = awbOrder?.billing_details?._billing_first_name || awbOrder?.shipping_details._shipping_first_name || '';
                                  const last = awbOrder?.billing_details?._billing_last_name || awbOrder?.shipping_details._shipping_last_name || '';
                                  const nume = `${first} ${last}`.trim() || '-';
                                  const id = awbOrder?.ID ? `#${awbOrder.ID}` : '';
                                  const cur = (awbData as any)?.current_status || '-';
                                  const html = [
                                    `<p>Bună ziua,</p>`,
                                    `<p>Vă rog sprijin pentru AWB <strong>${awb}</strong> (${courier}).</p>`,
                                    `<p>Comandă: <strong>${id}</strong> • Client: <strong>${nume}</strong>.</p>`,
                                    `<p>Status curent: <em>${cur}</em>.</p>`,
                                    `<p>Descriere problemă: <span style="color:#666">[vă rugăm completați aici detaliile]</span>.</p>`,
                                    `<p>Mulțumesc!</p>`
                                  ].join('');
                                  setAwbTicketMessage(html);
                                } finally {
                                  setAwbTicketGenerating(false);
                                }
                              }}
                            >
                              {awbTicketGenerating ? 'Se generează…' : 'Generează cu AI'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={sendTicketSubmitting || awbTicketGenerating || !awbTicketMessage}
                              onClick={() => {
                                try {
                                  setAwbTicketGenerating(true);
                                  // Simulate AI correction - in a real implementation, this would call an API
                                  setTimeout(() => {
                                    setAwbTicketGenerating(false);
                                  }, 500);
                                } catch {
                                  setAwbTicketGenerating(false);
                                }
                              }}
                            >
                              Corectează cu AI
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={sendTicketSubmitting || awbTicketGenerating || !awbTicketMessage}
                              onClick={() => {
                                try {
                                  setAwbTicketGenerating(true);
                                  // Simulate AI completion - in a real implementation, this would call an API
                                  setTimeout(() => {
                                    setAwbTicketGenerating(false);
                                  }, 500);
                                } catch {
                                  setAwbTicketGenerating(false);
                                }
                              }}
                            >
                              Completează cu AI
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-border flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { if (!sendTicketSubmitting) { setShowAwbTicketModal(false); setAwbTicketMessage(""); setAwbTicketGenerating(false); } }}>Renunță</Button>
                      <Button size="sm" onClick={() => { if (sendTicketSubmitting) return; setSendTicketSubmitting(true); setTimeout(() => { setSendTicketSubmitting(false); setShowAwbTicketModal(false); setAwbTicketMessage(""); setAwbTicketGenerating(false); }, 300); }}>
                        {sendTicketSubmitting ? 'Se trimite…' : 'Trimite'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AWB tracking off-canvas (right, full height) */}
            {showAwbModal && (
              <div className="fixed inset-0 z-50">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/30"
                  onClick={() => { setShowAwbModal(false); setAwbError(null); setAwbData(null); setAwbInfo(null); setAwbOrder(null); setHighlightedOrderId(null); setShowAddWpNoteModal(false); setAddNoteOrderId(null); setShowAwbTicketModal(false); }}
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
                              const v: any = (awbOrder as any)?.fara_factura_in_colet;
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
                        onClick={() => { setShowAwbModal(false); setAwbError(null); setAwbData(null); setAwbInfo(null); setAwbOrder(null); setHighlightedOrderId(null); setShowAddWpNoteModal(false); setAddNoteOrderId(null); setShowAwbTicketModal(false); }}
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
                              { key: 'order', label: 'A dat comanda', sub: awbOrder?.post_date ? formatDate(awbOrder.post_date) : null },
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
                    <Button variant="outline" size="sm" onClick={() => { setShowAwbModal(false); setAwbError(null); setAwbData(null); setAwbInfo(null); setAwbOrder(null); setHighlightedOrderId(null); }}>Închide</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Old grid disabled per new requirements */}
            {displayedComenzi.length > 0 && false && (
                <div
                    className={`${desktopCols === 2
                        ? 'md:columns-2'
                        : desktopCols === 4
                            ? 'md:columns-4'
                            : 'md:columns-3'
                    } columns-1 gap-x-6`}
                >
                    {displayedComenzi.map((comanda) => (
                        <Card
                            key={comanda.ID}
                            className={`p-4 bg-card relative mb-6 break-inside-avoid block ${comanda.logprogravare ? 'blue-shadow-pulse' : ''}`}
                        >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {comanda.shipping_details._shipping_first_name} {comanda.shipping_details._shipping_last_name}{" "}
                        <a 
                          href={`https://darurialese.com/wp-admin/post.php?post=${comanda.ID}&action=edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          #{comanda.ID}
                        </a>
                      </h3>
                    </div>
                    <div className="flex flex-col items-end space-y-1 bg-white p-1 rounded-3xl">
                      {comanda.ramburs === "FanCurier 0" ? (
                        <div className="courier-card">
                          <img src="/curieri/fan.jpg" alt="fan" className="w-10 h-6 object-contain" />
                        </div>
                      ) : comanda.ramburs === "FanCurier" ? (
                        <div className="courier-card">
                          <img src="/curieri/fan.jpg" alt="FAN Courier" className="w-10 h-6 object-contain" />
                        </div>
                      ) : comanda.ramburs === "DPD 0" ? (
                        <div className="courier-card">
                          <img src="/curieri/dpd.jpg" alt="dpd Courier" className="w-10 h-6 object-contain" />
                        </div>
                      ) : comanda.ramburs === "DPD" ? (
                        <div className="courier-card">
                          <img src="/curieri/dpd.jpg" alt="DPD" className="w-10 h-6 object-contain" />
                        </div>
                      ) : (
                       <>
                       </>
                      )}
                    </div>
                  </div>

                  {/* Alert: Anexe diferite - ascuns conform cerinței */}
                  {false && (() => {
                    const ad: any = (comanda as any)?.anexe_diferite_comanda;
                    const flag = (ad && (ad.anexe_diferite_comanda === '1' || ad.anexe_diferite_comanda === 1 || ad.anexe_diferite_comanda === true))
                      || ad === '1' || ad === 1 || ad === true;
                    if (!flag) return null;
                    return (
                      <div className="w-full mb-3">
                        <div className="w-full rounded-md border px-3 py-2 text-xs font-medium bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700">
                          Atentie: Anexe diferite!
                        </div>
                      </div>
                    );
                  })()}

                  {/* Alerte: Anexe diferite / Cantitate diferita / Atentie Pix */}
                  {(() => {
                    // Anexe diferite flag (existing logic)
                    const ad: any = (comanda as any)?.anexe_diferite_comanda;
                    const hasAnexeDiferite = (ad && (ad.anexe_diferite_comanda === '1' || ad.anexe_diferite_comanda === 1 || ad.anexe_diferite_comanda === true))
                      || ad === '1' || ad === 1 || ad === true;

                    // Cantitate diferita: any product has quantity > 1
                    const hasCantitateDiferita = Array.isArray(comanda.produse_finale)
                      && comanda.produse_finale.some((p: any) => {
                        const q = typeof p?.quantity === 'string' ? parseFloat(p.quantity) : p?.quantity;
                        return Number(q) > 1;
                      });

                    // Atenție Pix: atentie_pix = 1/true/'1'
                    const ap: any = (comanda as any)?.atentie_pix;
                    const hasAtentiePix = ap === '1' || ap === 1 || ap === true;

                    if (!hasAnexeDiferite && !hasCantitateDiferita && !hasAtentiePix) return null;

                    return (
                      <div className="w-full mb-3">
                        <div className=" gap-2">
                          {hasAnexeDiferite && (
                            <div className="mb-2 rounded-md border px-3 py-2 text-xs font-medium bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700">
                              Atentie: Anexe diferite!
                            </div>
                          )}
                          {hasCantitateDiferita && (
                            <div className="mb-2 rounded-md border px-3 py-2 text-xs font-medium bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700">
                              Atentie: Cantitate diferita!
                            </div>
                          )}
                          {hasAtentiePix && (
                            <div className="rounded-md border px-3 py-2 text-xs font-medium bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700">
                              Atentie: Pix!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Alert: Refacut - motiv afișat când refacut = 1 */}
                  {(() => {
                    const rf: any = (comanda as any)?.refacut;
                    const isRefacut = rf === '1' || rf === 1 || rf === true;
                    const motiv = (comanda as any)?.motiv_refacut;
                    const motivText = typeof motiv === 'string' ? motiv.trim() : '';
                    if (!isRefacut || !motivText) return null;
                    return (
                      <div className="w-full mb-3">
                        <div className="rounded-md border px-3 py-2 text-xs font-medium bg-red-50 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700">
                          Motiv refăcut: {motivText}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="bg-muted/30 p-2 rounded-md mb-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-xs">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Expediere</span>
                        <span 
                          className={`font-semibold ${
                            selectedShippingData === formatDate(comanda.expediere).split(' ')[0].replace(',', '') 
                              ? 'bg-blue-100 text-blue-800 px-1 rounded' 
                              : ''
                          }`}
                        >
                          {formatDate(comanda.expediere).split(' ')[0].replace(',', '')}
                        </span>
                      </div>
                      <div className="flex flex-col border-l border-border pl-2">
                        <span className="text-muted-foreground">Intrat pe</span>
                        <span className="font-semibold">{formatDate(comanda.post_date).split(' ')[0]}</span>
                      </div>
                      <div className="flex flex-col border-l border-border pl-2">
                        <span className="text-muted-foreground">Bucăți</span>
                        <span className="font-semibold">{comanda.total_buc}</span>
                      </div>
                      <div className="flex flex-col border-l border-border pl-2  rounded-r">
                        <span className="text-muted-foreground">Preț</span>
                        <span className="font-bold">{comanda.order_total_formatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:hidden w-full flex justify-between items-center bg-muted/20 p-2 rounded-md mb-3">
                    <span className="text-xs font-medium">Detalii</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => toggleSection(comanda.ID)}
                    >
                      {expandedSections[comanda.ID] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Combined collapsible content - always visible on desktop, collapsible on mobile */}
                  <div className={`${expandedSections[comanda.ID] ? 'block' : 'hidden'} md:block space-y-3`}>
                    {/* Gravare/Print section */}
                    <div className="flex items-center bg-muted/20 p-2 rounded-md">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground"><span className="md:inline hidden">Gravare:</span><span className="md:hidden inline">Grav.:</span></span>
                        {comanda.gravare ? (
                          <div className="w-6 h-6 bg-muted border border-border rounded-md flex items-center justify-center text-black dark:text-white">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center space-x-1 ml-3">
                        <span className="text-xs text-muted-foreground"><span className="md:inline hidden">Printare:</span><span className="md:hidden inline">Print.:</span></span>
                        {comanda.printare ? (
                          <div className="w-6 h-6 bg-muted border border-border rounded-md flex items-center justify-center text-black dark:text-white">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>

                      <div className="ml-auto flex items-center space-x-1.5 justify-end">
                        {/*<a */}
                        {/*  href={`https://crm.actium.ro/api/generare-bon-debitare/${comanda.ID}`}*/}
                        {/*  target="_blank"*/}
                        {/*  rel="noopener noreferrer"*/}
                        {/*  className="w-7 h-7 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center cursor-pointer"*/}
                        {/*>*/}
                        {/*  <Eye className="w-4 h-4 text-muted-foreground" />*/}
                        {/*</a>*/}
                        {/*<a */}
                        {/*  href={`https://crm.actium.ro/api/generare-bon-debitare/${comanda.ID}`}*/}
                        {/*  target="_blank"*/}
                        {/*  rel="noopener noreferrer"*/}
                        {/*  className="w-7 h-7 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center cursor-pointer"*/}
                        {/*>*/}
                        {/*  <Printer className="w-4 h-4 text-muted-foreground" />*/}
                        {/*</a>*/}
                        {comanda.previzualizare_galerie && comanda.previzualizare_galerie.length > 0 && (
                          <div 
                            className="w-7 h-7 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              setGalleryImages(comanda.previzualizare_galerie || []);
                              setShowGalleryModal(true);
                            }}
                            title="Previzualizare galerie"
                          >
                            <Gift className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div 
                          className="w-7 h-7 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center cursor-pointer"
                          onClick={() => {
                            setCurrentOrder(comanda);
                            setShowProblemModal(true);
                          }}
                        >
                          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Panoul inline din card a fost mutat sus, sub statusurile mari */}
                    {null}

                    {/* Product images section - grid cu maxim 6 rânduri */}
                    <div className="grid grid-cols-6  gap-2">
                      {comanda.produse_finale.map((produs, idx) => (
                        <div key={idx} className="flex items-center space-x-2 bg-muted/10 rounded">
                          <div className="relative">
                            <img
                              src={produs.poza ? `https://darurialese.com/wp-content/uploads/${produs.poza}` : "/api/placeholder/48/48"}
                              alt="Product"
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {produs.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                      {comanda.produse_finale.length === 1 && (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={`ph-${i}`} className="flex items-center space-x-2">
                            <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-900 animate-pulse" />
                          </div>
                        ))
                      )}
                    </div>

                    {/* Graphic files section (grouped by Gravare and Printare; shown when logprogravare and files exist) */}
                    {comanda.logprogravare && Array.isArray(comanda.download_fisiere_grafica) && (
                      (() => {
                        // Group files by type based on extension
                        const gravareExt = ['svg', 'ai', 'dxf'];
                        const printExt = ['eps', 'pdf']; // include pdf as print candidate if present

                        const gravareFiles = comanda.download_fisiere_grafica.filter((file: any) => {
                          if (typeof file !== 'string') return false;
                          const fileName = file.includes('/') ? file.split('/').pop() : file;
                          const ext = (fileName?.split('.').pop() || '').toLowerCase();
                          return gravareExt.includes(ext);
                        });

                        const printFiles = comanda.download_fisiere_grafica.filter((file: any) => {
                          if (typeof file !== 'string') return false;
                          const fileName = file.includes('/') ? file.split('/').pop() : file;
                          const ext = (fileName?.split('.').pop() || '').toLowerCase();
                          return printExt.includes(ext);
                        });


                        const renderFileChip = (file: string, colorClass: string) => {
                          const fileName = file.includes('/') ? file.split('/').pop() || '' : file;
                          const baseName = fileName.replace(/\.[^.]+$/, ''); // remove extension
                          const downloadHref = `https://crm.actium.ro/api/download/${encodeToBase64(`https://darurialese.ro/wp-content/uploads/${file}`)}`;
                          return (
                            <a
                              key={file}
                              href={downloadHref}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center gap-1 ${colorClass} px-2 py-2 rounded text-xs transition-colors w-full`}
                              title={`Descarcă fișier ${fileName}`}
                            >
                              <span className="w-4 h-4  rounded flex items-center justify-center text-white text-xs font-bold">🡇</span>

                            </a>
                          );
                        };

                        return (
                          <div className="bg-muted/10 p-2 rounded grid grid-cols-2 gap-2 border border-1 border-gray-300 dark:border-gray-800">

                            {(() => {
                              const gc = gravareFiles.length === 1 ? 'grid-cols-1' : gravareFiles.length === 2 ? 'grid-cols-2' : gravareFiles.length === 4 ? 'grid-cols-4' : 'grid-cols-3';
                              return (
                                <div className="mb-2">
                                  <div className="text-xs font-semibold mb-1">Gravare ({gravareFiles.length})</div>
                                  <div className={`grid gap-2 ${gc}`}>
                                    {gravareFiles.length > 0 ? (
                                      gravareFiles.map((f: string) => (
                                        <div key={f} className="min-w-0">{renderFileChip(f, 'bg-gray-700')}</div>
                                      ))
                                    ) : (
                                      Array.from({ length: 4 }).map((_, i) => (
                                        <div key={`grav-sk-${i}`} className="min-w-0">
                                          <div className="h-8  rounded  w-full" />
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {(() => {
                              const pc = printFiles.length === 1 ? 'grid-cols-1' : printFiles.length === 2 ? 'grid-cols-2' : printFiles.length === 4 ? 'grid-cols-4' : 'grid-cols-3';
                              return (
                                <div>
                                  <div className="text-xs font-semibold mb-1">Printare ({printFiles.length})</div>
                                  <div className={`grid gap-2 ${pc}`}>
                                    {printFiles.length > 0 ? (
                                      printFiles.map((f: string) => (
                                        <div key={f} className="min-w-0">{renderFileChip(f, 'bg-green-600')}</div>
                                      ))
                                    ) : (
                                      Array.from({ length: 4 }).map((_, i) => (
                                        <div key={`print-sk-${i}`} className="min-w-0">
                                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()
                    )}

                    {/* Action buttons section */}
                    <div>
                      {comanda.logprogravare ? (
                        <div className="text-xs text-muted-foreground">
                          {/* Only show the button for production, dpd, fan, and client approval - hide for gravare and legatorie */}
                          {(zonaActiva !== 'productie' && zonaActiva !== 'legatorie') && (
                            <Button 
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-base"
                              onClick={() => handleMutaClick(comanda.ID)}
                              disabled={movingCommandId === comanda.ID}
                            >
                              {movingCommandId === comanda.ID ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Se procesează...
                                </div>
                              ) : (
                                "Muta ➦"
                              )}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div>
                          {/* Only show the button for production, dpd, fan, and client approval */}
                          {(zonaActiva === 'gravare' || zonaActiva === 'dpd' || zonaActiva === 'fan' ) && (
                            <Button 
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-base"
                              onClick={() => handleIncepeDebitareClick(comanda.ID)}
                              disabled={startingCommandId === comanda.ID}
                            >
                              {startingCommandId === comanda.ID ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Se procesează...
                                </div>
                              ) : (
                                "Incepe procesul ➦"
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
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

      {/* Docked Chat cu Grafica */}
      {showChat && (
        <div className="fixed inset-y-0 right-0 z-[80] w-[15vw]">
          <Card className="w-full h-full shadow-lg border border-border bg-card flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border bg-secondary text-secondary-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-semibold">Chat Grafica</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowChat(false)} aria-label="Închide chat">
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Messages */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-background/60">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'eu' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.from === 'eu' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} px-3 py-2 rounded-2xl max-w-[220px] text-xs shadow-sm`}>
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    <div className="text-[10px] opacity-70 mt-1 text-right">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Input */}
            <form
              className="p-2 border-t border-border bg-card flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const text = chatInput.trim();
                if (!text) return;
                const mine = { from: 'eu' as const, text, time: nowTime() };
                setChatMessages((prev) => [...prev, mine]);
                setChatInput('');
                // Fake reply from Grafica
                setTimeout(() => {
                  setChatMessages((prev) => [
                    ...prev,
                    { from: 'grafica', text: 'Am notat. Revin în 2-3 minute cu fișierul actualizat. ✅', time: nowTime() },
                  ]);
                }, 1200);
              }}
            >
              <input
                type="text"
                className="flex-1 text-sm bg-background text-foreground border border-input rounded px-2 py-2 outline-none"
                placeholder="Scrie un mesaj..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button type="submit" size="sm" className="h-9 px-3">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
          {/* Subtle side toggle on left border */}
          <button
            className="absolute left-0 top-3/4 -translate-y-1/2 -translate-x-1/2 z-[81] w-9 h-9 rounded-full bg-secondary text-secondary-foreground shadow border border-border hover:opacity-90"
            onClick={() => setShowChat(false)}
            aria-label="Ascunde chat"
            title="Ascunde chat"
            type="button"
          >
            <MessageSquare className="w-4 h-4 m-auto" />
          </button>
        </div>
      )}
      {/* Floating toggle button (hidden when chat is open) */}
      {/*{!showChat && (*/}
      {/*  <Button*/}
      {/*    className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 p-0 shadow-lg bg-primary text-primary-foreground hover:opacity-90"*/}
      {/*    onClick={() => setShowChat(true)}*/}
      {/*    aria-label="Deschide chat Grafica"*/}
      {/*    title="Chat Grafica"*/}
      {/*  >*/}
      {/*    <MessageSquare className="w-6 h-6" />*/}
      {/*  </Button>*/}
      {/*)}*/}

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
        />


    </>
  );
};
