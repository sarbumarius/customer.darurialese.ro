// src/types/dashboard.ts

// Basic user used in DashboardProps
export interface BasicUser {
  id: number;
  name?: string;
  email?: string;
}

export interface DashboardProps {
  user: BasicUser;
  onLogout: () => void;
}

// Status card item
export interface StatItem {
  title: string;
  value: number;
  icon?: any; // Lucide icon component type
  color?: string;
  group?: string;
}

// Time tracking / pontaj
export interface PontajData {
  pontaj_pornit: boolean;
  minute: number;
  // Other fields can be added as needed
}

export interface WorkHistoryItem {
  date?: string;
  minutes?: number;
  hours?: number;
  // Extend with exact fields when available
}

// Product within an order
export interface Produs {
  id_produs: string;
  nume: string;
  quantity: string; // API delivers string quantities
  poza: string;
  pret?: string;
  pret_formatted?: string;
  item?: number;
  dificultate?: number;
  alpha?: number;
  anexe?: Record<string, string>;
  anexe_alpha?: Record<string, string>;
}

export interface OrderNote {
  comment_ID?: number; // Comment ID for deletion
  comment_content: string;
  comment_date: string;
}

// Unified order type used across the UI
export interface Comanda {
  // Reasons for unconfirmed order (API: motive_comanda_neconfirmata). New structure with count and motives array.
  motive_comanda_neconfirmata?: {
    count?: string | number;
    motives?: Array<{
      motiv_neconfirmare: string;
      data_si_ora: string;
    }>;
  } | Record<string, { meta_id?: number; post_id?: number; meta_key?: string; meta_value?: string | number | boolean }>; // Support both old and new structure
  ID: number;
  id_comanda?: string; // convenience string id for UI
  data_comanda?: string; // convenience date/time for UI
  awb_curier?: string; // AWB (tracking) code from API
  fara_factura_in_colet?: number | string | boolean; // 1 => cadou (gift), show icon in UI

  shipping_details: {
    _shipping_first_name: string;
    _shipping_last_name: string;
    _shipping_phone?: string;
    _shipping_city?: string;
    _shipping_state?: string;
    _shipping_address_1?: string;
    _shipping_address_2?: string;
    _shipping_postcode?: string;
  };
  billing_details?: {
    _billing_first_name?: string;
    _billing_last_name?: string;
    _billing_email?: string;
    _billing_phone?: string;
    _billing_numefirma?: string;
    _billing_cuifirma?: string;
    _billing_city?: string;
    _billing_state?: string;
    _billing_address_1?: string;
    _billing_address_2?: string;
    _billing_postcode?: string;
  };

  ramburs?: string;
  metodatransportcustom?: string;
  post_status?: string;
  expediere?: string;
  post_date?: string;

  // Payment information
  payment_method?: string; // Payment method code (e.g., 'cod', 'netopiapayments')
  payment_method_title?: string; // Payment method display name
  currency?: string; // Currency code (e.g., 'RON')
  date_paid_unix?: string; // Unix timestamp of payment date

  total_buc?: number;
  pret_total?: string;
  order_total_formatted?: string;
  confirmare_comanda?: string;

  notes?: OrderNote[];

  // Products: UI expects produse_finale; map from API "produse"
  produse_finale: Produs[];
  produse?: Produs[]; // keep raw if present

  // Legacy/extended fields used by the UI in some places – keep optional
  logdebitare?: string;
  logprodebitare?: string;
  loggravare?: string;
  fisieregrafica?: any[];
  download_fisiere_grafica?: any[];
  previzualizare_galerie?: (string | null)[];
  anexe_diferite_comanda?: { anexe_diferite_comanda: string } | string | null;
  refacut?: number;
  motiv_refacut?: string;
  gravare?: boolean;
  printare?: boolean;
  bon_zebra?: boolean;
  bon_old?: boolean;
  lipsuri?: string[];
  nr?: number;
  dificultate?: number; // Difficulty level of the order
}
