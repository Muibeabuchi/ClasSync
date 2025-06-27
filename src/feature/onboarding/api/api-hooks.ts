import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

export const userOnBoardedQueries = {
  getUserOnboardedStatus: convexQuery(
    api.userProfile.getUserOnboardedStatus,
    {},
  ),
  getUserRole: convexQuery(api.userProfile.getUserRole, {}),
};

export const useGetUserOnboardedStatus = () => {
  return useQuery(userOnBoardedQueries.getUserOnboardedStatus);
};

export const useUpdateUserOnboardedStatus = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.userProfile.updateUserOnboardedStatus),
  });
};

export const useGetUserRole = () => {
  return useSuspenseQuery(userOnBoardedQueries.getUserRole);
};

export const useUpdateUserRole = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.userProfile.updateUserRole),
  });
};
