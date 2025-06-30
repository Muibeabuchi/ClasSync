import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from './middleware';
import { api } from 'convex/_generated/api';

export const getUserOnboardStatusAction = createServerFn({
  method: 'GET',
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      return await context.convex.query(api.userProfile.getUserOnboardedStatus);
    } catch {
      return null;
    }
  });

export const getUserRoleAction = createServerFn({
  method: 'GET',
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      return await context.convex.query(api.userProfile.getUserRole);
    } catch {
      console.log('An error occurred when fetching the user role info ');
    }
  });
