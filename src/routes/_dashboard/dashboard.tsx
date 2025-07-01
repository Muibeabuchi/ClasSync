import { Loader } from '@/components/Loader';
import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_dashboard/dashboard')({
  async beforeLoad() {
    // // Permit only onboarded users from accessing this layout
    // const onboardStatus = await getUserOnboardStatusAction();
    // if (onboardStatus === null) {
    //   throw redirect({
    //     to: '/login',
    //   });
    // } else if (onboardStatus !== null) {
    //   if (onboardStatus === false) {
    //     throw redirect({
    //       to: '/onboard',
    //     });
    //   }
    // }
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
  }, [navigate, onBoardStatus.data?.role]);

  // create a loading/pending component
  if (onBoardStatus.isLoading) {
    return <Loader />;
  }
  return <Outlet />;
}
