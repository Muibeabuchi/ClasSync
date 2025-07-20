// import { useGetLecturerCourses } from '@/feature/course/api/get-lecturer-courses';
import { useGetLecturerJoinRequests } from '@/feature/joinRequest/api';
import JoinRequestsPage from '@/feature/lecturer/components/join-requests-page';
import JoinRequestsSkeleton from '@/feature/lecturer/components/join-requests-skeleton';
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
  pendingComponent: JoinRequestsSkeleton,
});

function RouteComponent() {
  const { data: lecturerJoinRequests } = useGetLecturerJoinRequests();

  return (
    <div>
      <Suspense fallback={<JoinRequestsSkeleton />}>
        <JoinRequestsPage
          lecturerJoinRequests={lecturerJoinRequests}
          // lecturerCourses={lecturerCourses}
        />
      </Suspense>
    </div>
  );
}
