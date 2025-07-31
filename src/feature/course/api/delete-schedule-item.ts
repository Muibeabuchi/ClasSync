import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

export const useDeleteScheduleItem = () =>
  useMutation({
    mutationFn: useConvexMutation(api.courses.deleteScheduleItem),
  });

export interface DeleteScheduleItemArgs {
  courseId: Id<'courses'>;
  day: string;
}
