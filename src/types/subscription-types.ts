export type SubscriptionStatus =
  | 'active'
  | 'non-renewing'
  | 'attention'
  | 'completed'
  | 'cancelled';

export interface Subscription_Create_Event {
  event: 'subscription.create';
  data: Create_Event_Data;
}

interface Create_Event_Data {
  id: number;
  domain: string;
  status: SubscriptionStatus;
  subscription_code: string;
  email_token: string;
  amount: number;
  cron_expression: string;
  next_payment_date: string;
  open_invoice: any;
  createdAt: string;
  integration: number;
  plan: Plan;
  authorization: Create_Event_Authorization;
  customer: Customer;
  invoice_limit: number;
  split_code: any;
  most_recent_invoice: any;
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

interface Create_Event_Authorization {
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
}

export interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  metadata: Metadata;
  risk_action: string;
}

// ! Beware of this type
type Metadata = Record<string, unknown> & {
  lecturerId: string;
};

export interface Subscription_Disable_Event {
  event: 'subscription.disable';
  data: Disabled_Event_Data;
}

export interface Disabled_Event_Data {
  domain: string;
  status: SubscriptionStatus;
  subscription_code: string;
  email_token: string;
  amount: number;
  cron_expression: string;
  next_payment_date: string;
  open_invoice: any;
  plan: Plan;
  authorization: DisabledEventAuthorization;
  customer: Customer;
  created_at: string;
}

// ^ 10 fields
export interface DisabledEventAuthorization {
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

export interface Not_Renew_Event_Type {
  event: 'subscription.not_renew';
  data: Not_Renew_Event_Data;
}

export interface Not_Renew_Event_Data {
  id: number;
  domain: string;
  status: SubscriptionStatus;
  subscription_code: string;
  email_token: string;
  amount: number;
  cron_expression: string;
  next_payment_date: any;
  open_invoice: any;
  integration: number;
  plan: Plan;
  authorization: Not_Renew_Event_Authorization;
  customer: Not_Renew_Event_Customer;
  invoices: any[];
  invoices_history: any[];
  invoice_limit: number;
  split_code: any;
  most_recent_invoice: any;
  created_at: string;
}

export interface Not_Renew_Event_Authorization {
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
}

export interface Not_Renew_Event_Customer {
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

export interface EXPIRING_CARDS_EVENT_TYPES {
  event: 'subscription.expiring_cards';
  data: EXPIRING_CARDS_EVENT_DATA[];
}

export interface EXPIRING_CARDS_EVENT_DATA {
  expiry_date: string;
  description: string;
  brand: string;
  subscription: EXPIRING_CARDS_EVENT_SUBSCRIPTION;
  customer: EXPIRING_CARDS_EVENT_CUSTOMER;
}

export interface EXPIRING_CARDS_EVENT_SUBSCRIPTION {
  id: number;
  subscription_code: string;
  amount: number;
  next_payment_date: string;
  plan: EXPIRING_CARDS_EVENT_PLAN;
}

export interface EXPIRING_CARDS_EVENT_PLAN {
  interval: string;
  id: number;
  name: string;
  plan_code: string;
}

export interface EXPIRING_CARDS_EVENT_CUSTOMER {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
}
