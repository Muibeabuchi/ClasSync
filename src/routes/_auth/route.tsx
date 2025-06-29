import { useLoginRedirect } from '@/feature/onboarding/hooks/use-login-redirect';
import { getUserOnboardStatusAction } from '@/server/userprofile';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  async beforeLoad() {
    // Check if the user is authenticated/onboarded and redirect them to the dashboard
    const onboardStatus = await getUserOnboardStatusAction();

    if (onboardStatus === null) {
      return;
    } else if (onboardStatus !== null) {
      if (onboardStatus === true) {
        throw redirect({
          to: '/dashboard',
        });
      } else if (onboardStatus === false) {
        throw redirect({
          to: '/onboard',
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  useLoginRedirect();
  return (
    <main>
      <Outlet />
    </main>
  );
}
