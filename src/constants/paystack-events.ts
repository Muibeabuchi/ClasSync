export const subscription_events = {
  create: 'subscription.create',
  disabled: 'subscription.disable',
  no_renew: 'subscription.not_renew',
  expiring_cards: 'subscription.expiring_cards',
};

export const invoice_events = {
  update: 'invoice.update',
  paymentFailed: 'invoice.payment_failed',
};

export const transaction_events = {
  success: 'charge.success',
};
