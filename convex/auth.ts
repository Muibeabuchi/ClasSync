import { BetterAuth, type AuthFunctions } from '@convex-dev/better-auth';
import {
  // api,
  components,
  internal,
} from './_generated/api';
import type { DataModel } from './_generated/dataModel';

import * as AuthModel from './models/authModel';

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
