// import { z } from 'zod';
import { lecturerPlanSchema, zodAction } from './lib/zodHelpers';
// import { action } from './_generated/server';
import {
  ConvexError,
  v,
  //  v
} from 'convex/values';
import { api } from './_generated/api';
import { payment_plans, PAYSTACK_TEST_SECRET_KEY } from './constants/payment';
import { Paystack } from 'paystack-sdk';
import {
  action,
  internalMutation,
  // internalAction
} from './_generated/server';
// import { ensureIsLecturer } from './models/userprofileModel';
import { planMapper } from './lib/helpers';

export const paystack = new Paystack(PAYSTACK_TEST_SECRET_KEY);

// ?? ==================== ACTIONS ======================== //
export const fetchSubscription = action({
  args: {
    // subscriptionCode: v.string(),
  },
  async handler() {
    const subscription = await paystack.subscription.fetch(
      'SUB_aom4fmbza4oln7u',
    );
    console.log({ message: subscription.message });
    console.log({ subscription });
  },
});

// ?? This action will be called for first time subscribers
// This will be derived from the subscription table. If a lecturer has no subscription then they they are subscribing for the first time
export const initializeSubscription = zodAction({
  args: {
    plan: lecturerPlanSchema,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
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

// ?? ========================== MUTATIONS ==================== //

export const createSubscription = internalMutation({
  args: {
    subscriptionCode: v.string(),
    planCode: v.string(),
    nextPaymentDate: v.string(),
    PayStackCustomerId: v.string(),
    lecturerEmail: v.string(),
  },
  async handler(
    ctx,
    {
      subscriptionCode,
      lecturerEmail,
      planCode,
      PayStackCustomerId,
      nextPaymentDate,
    },
  ) {
    // await ensureIsLecturer(ctx);

    // grab the lecturer's userProfile info using the email
    const lecturerInfo = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', lecturerEmail))
      .unique();
    if (!lecturerInfo) throw new ConvexError('Lecturer email does not exist');
    // check and ensure this is the lecturers only subscription

    const lecturerId = lecturerInfo._id;

    const lecturerSubscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_lecturerId', (q) => q.eq('lecturerId', lecturerId))
      .unique();

    if (lecturerSubscription)
      throw new ConvexError('Lecturer cannot have more than one Subscription');
    // create a lecturers subscription
    await ctx.db.insert('subscriptions', {
      subscriptionCode,
      planCode,
      nextPaymentDate,
      lecturerId,
      PayStackCustomerId,
    });
    // update the lecturers userProfile subscription status
    await ctx.db.patch(lecturerId, {
      lecturerCurrentPlan: {
        isActive: true,
        plan: planMapper(planCode),
      },
    });
    // TODO: create a notification for  the lecturer
  },
});
