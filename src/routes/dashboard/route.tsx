import { Loader } from '@/components/Loader';
import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const onBoardStatus = useDashboardRedirect();

  if (onBoardStatus.isLoading) {
    // return a loader that mimics the dashboard page
    return <Loader />;
  }

  return <Outlet />;
}
