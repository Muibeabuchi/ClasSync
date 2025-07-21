import MyCoursesPage from '@/feature/lecturer/components/MyCoursesPage';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';

export const Route = createFileRoute('/dashboard/$role/courses')({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(
      convexQuery(api.classLists.getMyClassLists, {}),
    );
    await context.queryClient.ensureQueryData(
      convexQuery(api.courses.getLecturerCoursesWithStats, {}),
    );
  },
});

function RouteComponent() {
  return <MyCoursesPage />;
}
