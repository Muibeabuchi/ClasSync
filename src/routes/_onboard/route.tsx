// import { getUserOnboardStatusAction } from '@/server/userprofile';
// import { useOnboardRedirect } from '@/feature/onboarding/hooks/use-onboard-redirect';
import { convexQuery } from '@convex-dev/react-query';
import {
  Outlet,
  redirect,
  //  redirect
} from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';

export const Route = createFileRoute('/_onboard')({
  beforeLoad: async ({ context }) => {
    // Prevent users that are not authenticated from accessing pages under this layout
    // prevent users that are onboarded from accessing this page
    // ? If value is null, the user is not authenticated,else check the users status
    const userOnboardStatus = await context.queryClient.ensureQueryData(
      convexQuery(api.userProfile.getUserOnboardedStatus, {}),
    );
    if (userOnboardStatus === null) {
      throw redirect({
        to: '/login',
        replace: true,
      });
    } else if (userOnboardStatus !== null) {
      const status = userOnboardStatus.isOnboarded;
      if (status) {
        throw redirect({
          to: '/dashboard',
          replace: true,
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  // useOnboardRedirect();
  return (
    <main>
      <Outlet />
    </main>
  );
}
