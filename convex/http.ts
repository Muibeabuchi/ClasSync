import { Hono } from 'hono';
import { HonoWithConvex, HttpRouterWithHono } from 'convex-helpers/server/hono';
import { createAuth } from './auth';
import { ActionCtx } from './_generated/server';

const app: HonoWithConvex<ActionCtx> = new Hono();

// Redirect root well-known to api well-known
app.get('/.well-known/openid-configuration', async (c) => {
  return c.redirect('/api/auth/convex/.well-known/openid-configuration');
});

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

const http = new HttpRouterWithHono(app);

export default http;
