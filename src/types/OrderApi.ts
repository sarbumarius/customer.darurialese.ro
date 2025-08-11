// src/types/OrderApi.ts
export interface OrderApiResponse {
    ID: number;
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
    ramburs: string;
    metodatransportcustom: string;
    post_status: string;
    expediere: string;
    post_date: string;
    total_buc: number;
    pret_total: string;
    order_total_formatted: string;
    logdebitare: string;
    logprodebitare: string;
    loggravare: string;
    fisieregrafica: any[];
    download_fisiere_grafica: any[];
    previzualizare_galerie: (string | null)[];
    anexe_diferite_comanda: { anexe_diferite_comanda: string };
    refacut: number;
    motiv_refacut: string;
    gravare: boolean;
    printare: boolean;
    bon_zebra: boolean;
    bon_old: boolean;
    produse_finale: Array<{
        id_produs: string;
        nume: string;
        item: number;
        poza: string;
        quantity: string;
        dificultate: number;
        alpha: number;
        anexe: Record<string, string>;
        anexe_alpha: Record<string, string>;
    }>;
    lipsuri: string[];
    nr: number;
}
