import { Loader } from '@/components/Loader';
import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
import { convexQuery } from '@convex-dev/react-query';
import { redirect, useNavigate } from '@tanstack/react-router';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { useEffect } from 'react';

export const Route = createFileRoute('/dashboard')({
  async beforeLoad({ context }) {
    // // Permit only onboarded users from accessing this layout
    // const onboardStatus = await getUserOnboardStatusAction();
    const onboardStatus = await context.queryClient.ensureQueryData(
      convexQuery(api.userProfile.getUserOnboardedStatus, {}),
    );

    if (onboardStatus === null) {
      throw redirect({
        to: '/login',
        replace: true,
      });
    } else if (onboardStatus !== null) {
      if (onboardStatus.isOnboarded === false) {
        throw redirect({
          replace: true,
          to: '/onboard',
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const onBoardStatus = useDashboardRedirect();
  const navigate = useNavigate();

  useEffect(() => {
    if (onBoardStatus.data?.role) {
      navigate({
        replace: true,
        to: '/dashboard/$role',
        params: {
          role: onBoardStatus.data?.role,
        },
      });
    }
  }, [navigate, onBoardStatus.data]);

  // create a loading/pending component
  if (onBoardStatus.isLoading) {
    return <Loader />;
  }

  return <Outlet />;
}
