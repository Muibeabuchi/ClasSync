import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

export const useLecturerDashboardStats = () =>
  useSuspenseQuery(
    convexQuery(api.lecturerDashboard.getLecturerDashboardStats, {}),
  );

export const useLecturerRecentCourses = (limit?: number) =>
  useSuspenseQuery(
    convexQuery(api.lecturerDashboard.getLecturerRecentCourses, {
      limit,
    }),
  );
