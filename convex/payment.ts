// import { z } from 'zod';
import { lecturerPlanSchema, zodAction } from './lib/zodHelpers';
// import { action } from './_generated/server';
import {
  ConvexError,
  //  v
} from 'convex/values';
import { api } from './_generated/api';
import { payment_plans, PAYSTACK_TEST_SECRET_KEY } from './constants/payment';
import { Paystack } from 'paystack-sdk';

export const paystack = new Paystack(PAYSTACK_TEST_SECRET_KEY);

export const initializePayment = zodAction({
  args: {
    plan: lecturerPlanSchema,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    // // For now the id type requires an assertion
    // const userIdFromCtx = identity.subject as Id<'userProfiles'>;
    const userInfo = await ctx.runQuery(api.userProfile.getAuthenticatedUser);
    if (!userInfo) throw new ConvexError('Unauthorized');
    // ensure the user is a lecturer
    if (!userInfo.isOnboarded)
      throw new ConvexError('Unauthorized: User must be onboarded');
    if (userInfo.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must be a lecturer');
    const { email } = userInfo;

    // ! Extra checks has to be made to handle lecturers downgrading their plan or changing subscription plans

    const transaction = await paystack.transaction.initialize({
      email,
      plan: payment_plans[args.plan],
      // This will be overriden by the plan
      amount: '0000',
      channels: ['card'],
      callback_url: 'http://localhost:3000/dashboard/lecturer',
    });
    if (transaction.status) {
      // handle successful transaction
      // ? return the payment url
      return {
        success: true,
        data: transaction.data?.authorization_url as string,
      };
    } else {
      return {
        success: false,
        data: transaction.message,
      };
    }
  },
});

// export const verifyBankAccount = action({
//   args: {
//     account_number: v.string(),
//     bank_code: v.string(),
//   },
//   async handler(_ctx, args) {
//     const { account_number, bank_code } = args;
//     const response = await fetch(
//       `${ROOT_PAYSTACK_URL}/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_TEST_SECRET_KEY}`,
//         },
//       },
//     );
//     return response.json();
//   },
// });
