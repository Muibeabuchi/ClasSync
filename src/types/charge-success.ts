export interface ChargeSuccessType {
  body: Body;
}

export interface Body {
  event: 'charge.success';
  data: Data;
}

interface Data {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: any;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Metadata;
  fees_breakdown: any;
  log: any;
  fees: number;
  fees_split: any;
  authorization: Authorization;
  customer: Customer;
  plan: Plan;
  subaccount: Subaccount;
  split: Split;
  order_id: any;
  paidAt: string;
  requested_amount: number;
  pos_transaction_data: any;
  source: Source;
}

interface Metadata {
  referrer: string;
}

interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: any;
  receiver_bank_account_number: any;
  receiver_bank: any;
}

interface Customer {
  id: number;
  first_name: any;
  last_name: any;
  email: string;
  customer_code: string;
  phone: any;
  metadata: any;
  risk_action: string;
  international_format_phone: any;
}

interface Plan {
  id: number;
  name: string;
  plan_code: string;
  description: string;
  amount: number;
  interval: string;
  send_invoices: number;
  send_sms: number;
  currency: string;
}

type Subaccount = Record<string, unknown>;

type Split = Record<string, unknown>;

interface Source {
  type: string;
  source: string;
  entry_point: string;
  identifier: any;
}
