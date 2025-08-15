// src/components/content/OrderSummary.tsx
import React, { useState } from "react";
import { Comanda, Produs } from "@/types/dashboard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface OrderSummaryProps {
  orderData: {
    ID: number;
    customer_user: string;
    order_currency: string;
    _cart_discount: string;
    _order_shipping: string;
    total_buc: number;
    pret_total: string;
    order_total_formatted: string;
    items: Array<{
      order_item_id: number;
      order_item_name: string;
      order_item_type: string;
      order_id: number;
      order_item_meta: Array<{
        meta_id: number;
        order_item_id: number;
        meta_key: string;
        meta_value: string;
      }>;
    }>;
  };
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderData }) => {
  // State to control collapsible sections
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Define type for order item
  type OrderItem = {
    order_item_id: number;
    order_item_name: string;
    order_item_type: string;
    order_id: number;
    order_item_meta: Array<{
      meta_id: number;
      order_item_id: number;
      meta_key: string;
      meta_value: string;
    }>;
  };

  // Helper function to get meta value by key
  const getMetaValue = (item: OrderItem, key: string): string => {
    if (!item.order_item_meta) return "";
    const meta = item.order_item_meta.find((m) => m.meta_key === key);
    return meta ? meta.meta_value : "";
  };

  return (
    <div className="border border-border rounded-md p-4 space-y-4 print:shadow-none print:border-none">
      {/* Header with toggle button */}
      <div 
        className="text-center border-b border-border pb-2 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-left flex-1">
          <h3 className="font-medium text-lg">Detalii Comandă</h3>
          <p className="text-sm text-muted-foreground">Comandă #{orderData.ID}</p>
        </div>
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <>
          {/* Items section */}
          <div className="space-y-3">
            <h4 className="font-medium border-b border-border pb-1 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 p-1 w-5 h-5 flex items-center justify-center text-xs">
                {orderData.items.filter(item => item.order_item_type === "line_item").length}
              </span>
              Produse
            </h4>
            {orderData.items
              .filter(item => item.order_item_type === "line_item")
              .map((item) => {
                const quantity = getMetaValue(item, "_qty");
                const lineTotal = getMetaValue(item, "_line_total");
                const productId = getMetaValue(item, "_product_id");
                
                return (
                  <div key={item.order_item_id} className="flex justify-between py-2 border-b border-border/50 text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{item.order_item_name}</div>
                      <div className="text-xs text-muted-foreground flex gap-2">
                        <span>Cantitate: {quantity}</span>
                        <span>•</span>
                        <span>ID: {productId}</span>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      {parseFloat(lineTotal).toFixed(2)} {orderData.order_currency}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Shipping section */}
          <div className="space-y-1">
            <h4 className="font-medium border-b border-border pb-1">Transport</h4>
            {orderData.items
              .filter(item => item.order_item_type === "shipping")
              .map((item) => {
                const cost = getMetaValue(item, "cost");
                const method = getMetaValue(item, "method_id");
                
                return (
                  <div key={item.order_item_id} className="flex justify-between py-1 text-sm">
                    <div>
                      <span>{item.order_item_name}</span>
                      {method && <span className="text-xs text-muted-foreground ml-2">({method})</span>}
                    </div>
                    <span className="font-medium">{parseFloat(cost).toFixed(2)} {orderData.order_currency}</span>
                  </div>
                );
              })}
          </div>

          {/* Discount section - if applicable */}
          {parseFloat(orderData._cart_discount) > 0 && (
            <div className="flex justify-between py-1 text-sm">
              <span>Discount</span>
              <span className="text-green-600">-{parseFloat(orderData._cart_discount).toFixed(2)} {orderData.order_currency}</span>
            </div>
          )}
        </>
      )}

      {/* Total section - Always visible */}
      <div className="border-t border-border pt-3 mt-2">
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>Subtotal produse:</span>
          <span>{parseFloat(orderData.pret_total) - parseFloat(orderData._order_shipping)} {orderData.order_currency}</span>
        </div>
        <div className="flex justify-between font-medium text-base">
          <span>Total</span>
          <span className="text-primary">{orderData.order_total_formatted}</span>
        </div>
      </div>

      {/* Footer note - Always visible */}
      {/*<div className="text-xs text-muted-foreground text-center border-t border-border pt-2">*/}
      {/*  Bon de comandă generat la {new Date().toLocaleDateString('ro-RO')} • {orderData.ID}*/}
      {/*</div>*/}
    </div>
  );
};

export default OrderSummary;