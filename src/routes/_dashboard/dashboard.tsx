import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
// import { getUserOnboardStatusAction } from '@/server/userprofile';
import {
  createFileRoute,
  //  redirect
} from '@tanstack/react-router';

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
  useDashboardRedirect();
  return <div>Hello Dashboard</div>;
}
