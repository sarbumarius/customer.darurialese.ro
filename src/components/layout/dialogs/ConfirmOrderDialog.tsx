import React, { useState } from "react";
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
import { Gift, CalendarClock, PhoneCall, X, ImageOff, Cog } from "lucide-react";
import type { Comanda } from "@/types/dashboard";

export interface ConfirmOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmOrder: Comanda | null;
  activeConfirmTab: 'confirmare' | 'sms' | 'notite' | 'puncte' | 'persoane';
  setActiveConfirmTab: (t: 'confirmare' | 'sms' | 'notite' | 'puncte' | 'persoane') => void;
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
      <DialogContent className="fixed inset-0 w-full h-full max-w-none p-0 m-0 rounded-none translate-x-0 translate-y-0 overflow-hidden flex flex-col">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-2">
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

        {/* Main content area with 3 columns */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1800px] mx-auto">
            {/* Left column (28%) - Client data & logistics */}
            <div className="lg:col-span-3 space-y-4">
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

            {/* Center column (44%) - Confirmation & production options */}
            <div className="lg:col-span-5 space-y-4">
              <Card>
                <div className="p-4">
                  <div className="flex border-b border-border mb-4">
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeConfirmTab === 'confirmare'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveConfirmTab('confirmare')}
                    >
                      Confirmare
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeConfirmTab === 'sms'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveConfirmTab('sms')}
                    >
                      SMS
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeConfirmTab === 'notite'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveConfirmTab('notite')}
                    >
                      Notite
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeConfirmTab === 'puncte'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveConfirmTab('puncte')}
                    >
                      Puncte
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeConfirmTab === 'persoane'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveConfirmTab('persoane')}
                    >
                      Persoane apropiate
                    </button>
                  </div>

                  {/* Gifts slider/list under sub-tabs: shows ~6 visible, rest scroll */}
                  <GiftsSlider />

                  <div className="space-y-4">
                    {/* Status icons row */}
                    <StatusBadgesRow />

                    {/* Toggle switches */}
                    <ToggleOptionsGrid />

                    {/* Confirmation selects */}
                    <ConfirmationSelects />

                    <Button variant="outline" size="sm">
                      Adaugă motiv neconfirmare
                    </Button>

                    <div className="space-y-1">
                      <Label htmlFor="date">Data</Label>
                      <input
                        id="date"
                        className="w-full p-2 border border-border rounded-md"
                        placeholder="Notă rapidă pentru dată"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right column (28%) - Product personalization & dynamic fields */}
            <div className="lg:col-span-4 space-y-4">
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Detalii produs & personalizare</h3>
                    <Badge variant="outline">
                      {confirmOrder?.order_total_formatted || confirmOrder?.pret_total || "-"} /
                      {confirmOrder?.payment_method === 'cod' ? ' neplătit' : ' plătit'}
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
            <Button onClick={() => {
              // Here you would implement the confirmation logic
              alert('Comandă confirmată!');
              setShowConfirmModal(false);
            }}>
              Salvează
            </Button>
            <Button variant="default">
              Procesează
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrderDialog;