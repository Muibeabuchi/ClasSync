// import { httpRouter } from 'convex/server';
// import { betterAuthComponent, createAuth } from './auth';

// const http = httpRouter();

// betterAuthComponent.registerRoutes(http, createAuth, {
//   cors: true,
// });

// export default http;

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HonoWithConvex, HttpRouterWithHono } from 'convex-helpers/server/hono';
import { ActionCtx } from './_generated/server';
import { createAuth } from './auth';
import { internal } from './_generated/api';

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

  if (hash === headers.get('x-paystack-signature')) {
    // code that confirms the order as paid for goes here
    console.log('WEBHOOK SUCCESSFUL');
    // confirm the price that was paid for the order
    // confirm the event
    return new Response('order created successfully', {
      status: 200,
    });
  } else {
    console.log('Webhook hit an error');
    return Response.json({ status: 'invalid signature' }, { status: 401 });
  }
});

export default http;
