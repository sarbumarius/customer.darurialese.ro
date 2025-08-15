// src/components/content/OrderSummaryExample.tsx
import React from "react";
import OrderSummary from "./OrderSummary";

// Sample data based on the provided API response
const sampleOrderData = {
  ID: 1008187,
  customer_user: "13249",
  order_currency: "RON",
  _cart_discount: "0",
  _order_shipping: "17",
  total_buc: 1,
  pret_total: "112.00",
  order_total_formatted: "112.00 lei",
  items: [
    {
      order_item_id: 220099,
      order_item_name: "Trofeu Personalizat - Special pentru nasii de botez",
      order_item_type: "line_item",
      order_id: 1008187,
      order_item_meta: [
        {
          meta_id: 2043788,
          order_item_id: 220099,
          meta_key: "_product_id",
          meta_value: "194159"
        },
        {
          meta_id: 2043789,
          order_item_id: 220099,
          meta_key: "_variation_id",
          meta_value: "0"
        },
        {
          meta_id: 2043790,
          order_item_id: 220099,
          meta_key: "_qty",
          meta_value: "1"
        },
        {
          meta_id: 2043791,
          order_item_id: 220099,
          meta_key: "_tax_class",
          meta_value: ""
        },
        {
          meta_id: 2043792,
          order_item_id: 220099,
          meta_key: "_line_subtotal",
          meta_value: "95"
        },
        {
          meta_id: 2043793,
          order_item_id: 220099,
          meta_key: "_line_subtotal_tax",
          meta_value: "0"
        },
        {
          meta_id: 2043794,
          order_item_id: 220099,
          meta_key: "_line_total",
          meta_value: "95"
        },
        {
          meta_id: 2043795,
          order_item_id: 220099,
          meta_key: "_line_tax",
          meta_value: "0"
        },
        {
          meta_id: 2043796,
          order_item_id: 220099,
          meta_key: "_line_tax_data",
          meta_value: "a:2:{s:5:\"total\";a:0:{}s:8:\"subtotal\";a:0:{}}"
        },
        {
          meta_id: 2043797,
          order_item_id: 220099,
          meta_key: "_tmdata",
          meta_value: "a:1:{i:0;a:8:{s:16:\"tmcp_post_fields\";a:7:{s:16:\"tmcp_textfield_0\";s:0:\"\";s:16:\"tmcp_textfield_1\";s:0:\"\";s:15:\"tmcp_textarea_3\";s:0:\"\";s:16:\"tmcp_textfield_4\";s:0:\"\";s:16:\"tmcp_textfield_5\";s:0:\"\";s:13:\"tmcp_upload_6\";s:0:\"\";s:15:\"tmcp_textarea_7\";s:0:\"\";}s:10:\"product_id\";i:194159;s:19:\"per_product_pricing\";b:1;s:17:\"cpf_product_price\";s:2:\"95\";s:12:\"variation_id\";b:0;s:11:\"form_prefix\";s:0:\"\";s:20:\"tc_added_in_currency\";s:3:\"RON\";s:19:\"tc_default_currency\";s:3:\"RON\";}}"
        }
      ]
    },
    {
      order_item_id: 220100,
      order_item_name: "Courier",
      order_item_type: "shipping",
      order_id: 1008187,
      order_item_meta: [
        {
          meta_id: 2043798,
          order_item_id: 220100,
          meta_key: "method_id",
          meta_value: "flat_rate"
        },
        {
          meta_id: 2043799,
          order_item_id: 220100,
          meta_key: "instance_id",
          meta_value: "2"
        },
        {
          meta_id: 2043800,
          order_item_id: 220100,
          meta_key: "cost",
          meta_value: "17.00"
        },
        {
          meta_id: 2043801,
          order_item_id: 220100,
          meta_key: "total_tax",
          meta_value: "0"
        },
        {
          meta_id: 2043802,
          order_item_id: 220100,
          meta_key: "taxes",
          meta_value: "a:1:{s:5:\"total\";a:0:{}}"
        },
        {
          meta_id: 2043803,
          order_item_id: 220100,
          meta_key: "Elemente",
          meta_value: "Trofeu Personalizat - Special pentru nasii de botez &times; 1"
        }
      ]
    }
  ]
};

const OrderSummaryExample: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Detalii de Personalizare - Desfășurător Comandă</h2>
      <OrderSummary orderData={sampleOrderData} />
    </div>
  );
};

export default OrderSummaryExample;