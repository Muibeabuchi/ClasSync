// import { useGetLecturerCourses } from '@/feature/course/api/get-lecturer-courses';
import { useGetLecturerJoinRequests } from '@/feature/joinRequest/api';
import JoinRequestsPage from '@/feature/lecturer/components/join-requests-page';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Suspense } from 'react';

export const Route = createFileRoute('/dashboard/$role/joinRequests')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.joinRequests.getAllJoinRequestsForLecturer, {}),
    );
  },
});

function RouteComponent() {
  const { data: lecturerJoinRequests } = useGetLecturerJoinRequests();
  // const { data: lecturerCourses } = useGetLecturerCourses();

  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <JoinRequestsPage
          lecturerJoinRequests={lecturerJoinRequests}
          // lecturerCourses={lecturerCourses}
        />
      </Suspense>
    </div>
  );
}
