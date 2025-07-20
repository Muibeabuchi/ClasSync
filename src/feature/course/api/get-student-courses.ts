import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

export const useGetStudentCourses = () =>
  useSuspenseQuery(convexQuery(api.courses.getStudentCourses, {}));
