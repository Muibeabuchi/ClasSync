import { useGetLecturerCoursesWithStats } from '@/feature/course/api/get-lecturer-course-with-stats';
import LecturerCoursesPage, {
  LecturerCoursesPageSkeleton,
} from '@/feature/lecturer/components/MyCoursesPage';
import { convexQuery } from '@convex-dev/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

export const Route = createFileRoute('/dashboard/lecturer/courses')({
  component: RouteComponent,
  pendingComponent: LecturerCoursesPageSkeleton,
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
  const navigate = useNavigate();

  const { data: lecturerCoursesWithStats } = useGetLecturerCoursesWithStats();

  const handleCourseNavigate = (courseId: Id<'courses'>) => {
    navigate({
      to: '/dashboard/lecturer/$courseId',
      params: { courseId },
    });
  };

  return (
    <LecturerCoursesPage
      handleCourseNavigate={handleCourseNavigate}
      lecturerCoursesWithStats={lecturerCoursesWithStats}
    />
  );
}
