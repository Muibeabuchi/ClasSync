// import { getUserOnboardStatusAction } from '@/server/userprofile';
import {
  Outlet,
  //  redirect
} from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_onboard')({
  beforeLoad: async () => {
    // Prevent users that are not authenticated from accessing pages under this layout
    // prevent users that are onboarded from accessing this page
    // ? If value is null, the user is not authenticated,else check the users status
    // const userOnboardStatus = await getUserOnboardStatusAction();
    // if (userOnboardStatus === null) {
    //   throw redirect({
    //     to: '/login',
    //   });
    // } else if (userOnboardStatus !== null) {
    //   const status = userOnboardStatus;
    //   if (status) {
    //     throw redirect({
    //       to: '/dashboard',
    //     });
    //   }
    // }
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
