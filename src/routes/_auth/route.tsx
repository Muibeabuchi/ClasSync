import { useLoginRedirect } from '@/feature/onboarding/hooks/use-login-redirect';
import { getUserOnboardStatusAction } from '@/server/userprofile';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  async beforeLoad() {
    // Check if the user is authenticated/onboarded and redirect them to the dashboard
    const onboardStatus = await getUserOnboardStatusAction();

    console.log({ onboardStatus });
    if (onboardStatus === null) {
      console.log('User is not authenticated');
      return;
    } else if (onboardStatus !== null) {
      if (onboardStatus === true) {
        console.log('User is authenticated and has onboarded');
        throw redirect({
          to: '/dashboard',
        });
      } else if (onboardStatus === false) {
        console.log('User is authenticated and has not onboarded');
        throw redirect({
          to: '/onboard',
        });
        console.log('redirect has fired');
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
