export interface SubscriptionUpdateEvent {
  event: 'invoice.update';
  data: Data;
}

interface Data {
  domain: string;
  invoice_code: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  paid: boolean;
  paid_at: string;
  description: any;
  authorization: Authorization;
  subscription: Subscription;
  customer: Customer;
  transaction: Transaction;
  created_at: string;
}

interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  account_name: string;
}

interface Subscription {
  status: string;
  subscription_code: string;
  amount: number;
  cron_expression: string;
  next_payment_date: string;
  open_invoice: any;
}

interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  metadata: Metadata;
  risk_action: string;
}

type Metadata = Record<string, string>;

interface Transaction {
  reference: string;
  status: string;
  amount: number;
  currency: string;
}
