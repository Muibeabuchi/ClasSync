import { transaction_events } from './../src/constants/paystack-events';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HonoWithConvex, HttpRouterWithHono } from 'convex-helpers/server/hono';
import { ActionCtx } from './_generated/server';
import { createAuth } from './auth';
import { internal } from './_generated/api';
import { paystackEvents } from './constants/payment';

import { type Subscription_Create_Event } from './../src/types/subscription-types';

const app: HonoWithConvex<ActionCtx> = new Hono();
const http = new HttpRouterWithHono(app);

app.use(
  '/api/auth/*',
  cors({
    origin: process.env.SITE_URL!,
    allowHeaders: ['Content-Type', 'Authorization', 'Better-Auth-Cookie'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'Set-Better-Auth-Cookie'],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Redirect root well-known to api well-known
app.get('/.well-known/openid-configuration', async (c) => {
  return c.redirect('/api/auth/convex/.well-known/openid-configuration');
});

// ? ========== HTTP-ACTIONS =================   //

app.post('/paystackwebhook', async (c) => {
  const body = await c.req.json();
  const headers = c.req.raw.headers;
  // c.req.valid('json');
  const hash = await c.env.runAction(
    internal.service.paystack.validateWebhook,
    {
      body: JSON.stringify(body),
    },
  );

  const validWebhook = hash === headers.get('x-paystack-signature');

  if (validWebhook) {
    // code that confirms the order as paid for goes here

    console.log({
      event: body,
    });

    if (body.event === transaction_events.success) {
      console.log('customer has been successfully charged');

      // ? call a mutation that handles payment charge
    }

    if (body.event === paystackEvents.create_subscription) {
      const event: Subscription_Create_Event = body;
      console.log('subscription created');

      // No need to check the amount paid since it will always be equal to the amount in the plan
      // ? Store the lecturers subscriptionCode,planCode,paystackCustomerId,nextPaymentDate
      // ? Update the lecturers currentPlan and set the subscriptionStatus to "active"
      try {
        await c.env.runMutation(internal.payment.createSubscription, {
          authorizationCode: event.data.authorization.authorization_code,
          lecturerEmail: event.data.customer.email,
          emailToken: event.data.email_token,
          nextPaymentDate: event.data.next_payment_date,
          PayStackCustomerId: event.data.customer.customer_code,
          // TODO: Validate the plan code
          planCode: event.data.plan.plan_code,
          subscriptionCode: event.data.subscription_code,
        });
      } catch (error) {
        console.log('Error in creating subscription', { error });
      }
    }
    return new Response('order created successfully', {
      status: 200,
    });
  } else {
    console.log('Webhook hit an error');
    return Response.json({ status: 'invalid signature' }, { status: 401 });
  }
});

export default http;
