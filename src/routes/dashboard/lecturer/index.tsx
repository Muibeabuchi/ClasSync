import {
  AuthQueryOptions,
  useGetCurrentUser,
} from '@/feature/auth/api/get-current-user';
import LecturerDashboardContent, {
  LecturerDashboardSkeleton,
} from '@/feature/lecturer/components/lecturer-dashboard-content';
import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';

export const Route = createFileRoute('/dashboard/lecturer/')({
  component: RouteComponent,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(AuthQueryOptions.getCurrentUser);
  },
  pendingComponent: LecturerDashboardSkeleton,
});

function RouteComponent() {
  const { data: user, isLoading } = useGetCurrentUser();

  if (isLoading) return <LecturerDashboardSkeleton />;

  return (
    <Authenticated>
      <LecturerDashboardContent fullName={user?.fullName} />;
    </Authenticated>
  );
}
