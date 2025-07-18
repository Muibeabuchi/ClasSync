import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

export const useGetCourseDetails = ({
  courseId,
}: {
  courseId: Id<'courses'>;
}) =>
  useSuspenseQuery(
    convexQuery(api.courses.getCourseDetails, {
      courseId,
    }),
  );
