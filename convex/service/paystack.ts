'use node';

import { Paystack } from 'paystack-sdk';
import { v } from 'convex/values';
import { internalAction, action } from './../_generated/server';
import crypto from 'crypto';
import { lecturerPlanSchema, zodAction } from '../lib/zod-helpers';
import { z } from 'zod';

export const ROOT_PAYSTACK_URL = 'https://api.paystack.co';
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY!;
export const paystack = new Paystack(PAYSTACK_SECRET_KEY);

// const lecturerPlanSchema =

// export const initializePaymentAction = action({
//   async handler() {
//     return await initialize();
//   },
// });

export const validateWebhook = internalAction({
  args: {
    body: v.string(),
  },
  handler: async (_, args) => {
    return crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(args.body)
      .digest('hex');
  },
});
