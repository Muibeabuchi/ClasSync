// import { useMutation } from 'convex/react';
// import type { Id } from 'convex/_generated/dataModel';
// import type { LectureSchedule } from '@/components/course/CourseSchedulePicker';
import { api } from 'convex/_generated/api';
import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';

export const useUpdateCourseSchedule = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.courses.updateCourseSchedule),
  });
};

// export interface UpdateCourseScheduleArgs {
//   courseId: Id<'courses'>;
//   schedule: LectureSchedule[];
// }
