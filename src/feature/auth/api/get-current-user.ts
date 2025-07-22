import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

export const AuthQueryOptions = {
  getCurrentUser: convexQuery(api.userProfile.getAuthenticatedUser, {}),
};

export const useGetCurrentUser = () => useQuery(AuthQueryOptions.getCurrentUser);
