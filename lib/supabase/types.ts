export type TransactionType = "income" | "expense";
export type TransactionSource = "manual" | "shopify" | "invoice";
export type InvoiceStatus = "draft" | "sent" | "paid";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  occurred_on: string;
  source: TransactionSource;
  shopify_order_id: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  position: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  notes: string;
  tax_rate: number;
  transaction_id: string | null;
  created_at: string;
  invoice_items?: InvoiceItem[];
}

export interface ShopifySettings {
  user_id: string;
  shop_domain: string;
  access_token: string;
  last_synced_at: string | null;
  created_at: string;
}
