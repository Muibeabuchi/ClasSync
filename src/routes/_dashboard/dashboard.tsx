import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
import StudentDashboard from '@/feature/student/components/student-dashboard';
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

const userData = {
  fullName: 'Dachiksta',
  regNumber: '20201248252',
  department: 'SOE',
  yearLevel: '200',
};

function RouteComponent() {
  useDashboardRedirect();
  return <StudentDashboard userData={userData} />;
}
