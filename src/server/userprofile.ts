import { createServerFn } from '@tanstack/react-start';
import { getToken, setupClient } from './middleware';
import { api } from 'convex/_generated/api';

export const getUserOnboardStatusAction = createServerFn({
  method: 'GET',
}).handler(async () => {
  const token = await getToken();
  try {
    return await setupClient(token).query(
      api.userProfile.getUserOnboardedStatus,
    );
  } catch {
    return null;
  }
});

export const getUserRoleAction = createServerFn({
  method: 'GET',
}).handler(async () => {
  const token = await getToken();
  try {
    return await setupClient(token).query(api.userProfile.getUserRole);
  } catch {
    console.log('An error occurred when fetching the user role info ');
  }
});
