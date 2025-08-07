import { BetterAuth, type AuthFunctions } from '@convex-dev/better-auth';
import {
  // api,
  components,
  internal,
} from './_generated/api';
import type { DataModel } from './_generated/dataModel';

import * as AuthModel from './models/authModel';

import { convexAdapter } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
// import type { GenericCtx } from 'convex/_generated/server;
// import { betterAuthComponent } from 'convex/auth';
import { betterAuth } from 'better-auth';
import { GenericCtx } from './_generated/server';

// const siteUrl = 'http://localhost:3000';

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    // All auth requests will be proxied through your TanStack Start server
    database: convexAdapter(ctx, betterAuthComponent),
    socialProviders: {
      google: {
        prompt: 'select_account',
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
        siteUrl: process.env.SITE_URL!,
      }),
    ],
  });

// Type safe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;

// Initialize the component
export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  // verbose: true,
});

// These are required named exports
export const { createUser, updateUser, deleteUser, createSession } =
  betterAuthComponent.createAuthFunctions<DataModel>({
    onCreateUser: AuthModel.createUser,
    onDeleteUser: AuthModel.deleteUser,
  });
