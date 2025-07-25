import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';

export const useDeleteClassList = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.classLists.deleteClassList),
  });
};
