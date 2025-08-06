import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

export const useGetLecturerCoursesWithStats = () =>
  useSuspenseQuery(convexQuery(api.courses.getLecturerCoursesWithStats, {}));
