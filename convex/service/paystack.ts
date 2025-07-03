'use node';
import { v } from 'convex/values';
import { internalAction } from './../_generated/server';
import { createHmac } from 'node:crypto'; // import hmacSHA512 from 'crypto-js/hmac-sha512';

export const validateWebhook = internalAction({
  args: {
    body: v.string(),
  },
  handler: async (_, args) => {
    return createHmac('sha512', process.env.PAYSTACK_TEST_SECRET_KEY!)
      .update(args.body)
      .digest('hex');
  },
});
