import LecturerDashboardContent, {
  LecturerDashboardSkeleton,
} from '@/feature/lecturer/components/lecturer-dashboard-content';
import {
  useGetUserOnboardedStatus,
  userOnBoardedQueries,
} from '@/feature/onboarding/api/api-hooks';
import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';

export const Route = createFileRoute('/dashboard/lecturer/')({
  component: RouteComponent,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(
      userOnBoardedQueries.getUserOnboardedStatus,
    );
  },
  pendingComponent: LecturerDashboardSkeleton,
});

function RouteComponent() {
  const { data } = useGetUserOnboardedStatus();

  // if (isLoading) return <LecturerDashboardSkeleton />;

  return (
    <Authenticated>
      <LecturerDashboardContent fullName={data?.user?.fullName} />;
    </Authenticated>
  );
}
