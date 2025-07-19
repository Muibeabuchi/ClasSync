import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

// create a hook to consume the createAttendanceSession api
export const useCreateClassList = () =>
  useMutation({
    mutationFn: useConvexMutation(api.classLists.createClassList),
  });
