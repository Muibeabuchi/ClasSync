import { convexAdapter } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import type { GenericCtx } from 'convex/_generated/server';
import { betterAuthComponent } from 'convex/auth';
import { betterAuth } from 'better-auth';

const siteUrl = 'http://localhost:3000';

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    // All auth requests will be proxied through your TanStack Start server
    database: convexAdapter(ctx, betterAuthComponent),
    socialProviders: {
      google: {
        // prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      // The Convex plugin is required
      convex(),
      crossDomain({
        siteUrl,
      }),
    ],
  });
