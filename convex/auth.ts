// import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
// import { Password } from "@convex-dev/auth/providers/Password";
// import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
// import { query } from "./_generated/server";

// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [Password, Anonymous],
// });

// export const loggedInUser = query({
//   handler: async (ctx) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       return null;
//     }
//     const user = await ctx.db.get(userId);
//     if (!user) {
//       return null;
//     }
//     return user;
//   },
// });

// export const getUserProfile = query({
//   handler: async (ctx) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       return null;
//     }

//     const profile = await ctx.db
//       .query("userProfiles")
//       .withIndex("by_user_id", (q) => q.eq("userId", userId))
//       .unique();

//     return profile;
//   },
// });

import {
  BetterAuth,
  convexAdapter,
  type AuthFunctions,
} from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import { components, internal } from './_generated/api';
import { type GenericCtx } from './_generated/server';
import type { DataModel } from './_generated/dataModel';

import * as AuthModel from './models/authModel';

// Type safe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;

// Initialize the component
export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
});

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    // All auth requests will be proxied through your TanStack Start server
    baseURL: process.env.SITE_URL || 'http://localhost:3000',
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
    ],
  });

// These are required named exports
export const { createUser, updateUser, deleteUser, createSession } =
  betterAuthComponent.createAuthFunctions<DataModel>({
    onCreateUser: AuthModel.createUser,
    onDeleteUser: AuthModel.deleteUser,
  });
