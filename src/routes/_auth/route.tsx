import { useLoginRedirect } from '@/feature/onboarding/hooks/use-login-redirect';
import {
  createFileRoute,
  Outlet,
  //  redirect
} from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  async beforeLoad() {
    // Check if the user is authenticated/onboarded and redirect them to the dashboard
    // const onboardStatus = await getUserOnboardStatusAction();
    // if (onboardStatus === null) {
    //   return;
    // } else if (onboardStatus && onboardStatus.isOnboarded !== null) {
    //   if (onboardStatus && onboardStatus.isOnboarded === true) {
    //     throw redirect({
    //       to: '/dashboard',
    //     });
    //   } else if (onboardStatus && onboardStatus.isOnboarded === false) {
    //     throw redirect({
    //       to: '/onboard',
    //     });
    //   }
    // }
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
