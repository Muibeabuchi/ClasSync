import { z } from 'zod';
import { lecturerPlanSchema, zodAction } from './lib/zod-helpers';
import {
  paystack,
  PAYSTACK_SECRET_KEY,
  ROOT_PAYSTACK_URL,
} from './service/paystack';
import { action } from './_generated/server';
import { v } from 'convex/values';

const now = new Date();

export const subscribeLecturer = zodAction({
  args: {
    subscriber_email: z.string().email().min(6, 'must be valid email '),
    plan: lecturerPlanSchema,
  },
  async handler(ctx, args) {
    const response = await paystack.subscription.create({
      customer: args.subscriber_email,
      plan: args.plan,
      start_date: now,
    });
  },
});

export const verifyBankAccount = action({
  args: {
    account_number: v.string(),
    bank_code: v.string(),
  },
  async handler(_ctx, args) {
    const { account_number, bank_code } = args;
    const response = await fetch(
      `${ROOT_PAYSTACK_URL}/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    return response.json();
  },
});
