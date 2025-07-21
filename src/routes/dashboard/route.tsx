import { Loader } from '@/components/Loader';
import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Authenticated, Unauthenticated } from 'convex/react';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const onBoardStatus = useDashboardRedirect();

  if (onBoardStatus.isLoading || onBoardStatus === null) {
    // return a loader that mimics the dashboard page
    return <Loader />;
  }

  return (
    <>
      <Authenticated>
        <Outlet />
      </Authenticated>
      <Unauthenticated>
        <Loader />
      </Unauthenticated>
    </>
  );
}
