import { getUserOnboardStatusAction } from '@/server/userprofile';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  async beforeLoad() {
    // Check if the user is authenticated/onboarded and redirect them to the dashboard
    const onboardStatus = await getUserOnboardStatusAction();
    if (onboardStatus !== null && onboardStatus === true) {
      throw redirect({
        to: '/dashboard',
      });
    } else if (onboardStatus !== null && onboardStatus === false) {
      throw redirect({
        to: '/onboard',
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
