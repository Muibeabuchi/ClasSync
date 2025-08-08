import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

export const useGetStudentCourseDetail = (courseId: Id<'courses'>) =>
  useSuspenseQuery(
    convexQuery(api.courses.getStudentCourseDetail, { courseId }),
  );
