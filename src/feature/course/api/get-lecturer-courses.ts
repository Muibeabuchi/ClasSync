import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { lecturerCourseStatusType } from 'convex/schema';

export const useGetLecturerCourses = (
  status?: Partial<lecturerCourseStatusType>,
) =>
  useSuspenseQuery(
    convexQuery(api.courses.getLecturerCourses, {
      status,
    }),
  );
