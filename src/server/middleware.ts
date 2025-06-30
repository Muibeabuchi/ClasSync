import { getCookieName } from '@convex-dev/better-auth/react-start';
import { createAuth } from '../../convex/auth';
import { ConvexHttpClient } from 'convex/browser';
import { getCookie } from '@tanstack/react-start/server';
import { createMiddleware } from '@tanstack/react-start';

const setupClient = (token?: string) => {
  const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
  if (token) {
    client.setAuth(token);
  }
  return client;
};

const getToken = async () => {
  const sessionCookieName = await getCookieName(createAuth);
  return getCookie(sessionCookieName);
};

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const token = await getToken();
    return next({
      context: {
        convex: setupClient(token),
      },
    });
  },
);
