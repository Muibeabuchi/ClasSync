// import { userRoleConstant } from '@/constants/constants';
import { useGetUserRole } from '@/feature/onboarding/api/api-hooks';
import LecturerOnboardingSection from '@/feature/onboarding/components/lecturer-onboarding-section';
import StudentOnboardingSection from '@/feature/onboarding/components/onboard.student';
import { getUserRoleAction } from '@/server/userprofile';
import { createFileRoute, redirect } from '@tanstack/react-router';
// import * as z from 'zod';

// const UserRoleSchema = z.object({
//   role: z.union([
//     z.literal(userRoleConstant.student),
//     z.literal(userRoleConstant.lecturer),
//   ]),
// });

export const Route = createFileRoute('/_onboard/role')({
  // params: {
  //   parse: (params) => UserRoleSchema.parse(params),
  // },
  async beforeLoad() {
    const userRole = getUserRoleAction();
    if (userRole === null) {
      // Redirect the user to the onboard page to select a role if the value is null
      throw redirect({
        to: '/onboard',
      });
    }
  },
  component: RouteComponent,
  pendingComponent: () => {
    return <div className="">Loading the Role Page</div>;
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { data: userRole } = useGetUserRole();
  if (userRole === null) {
    navigate({
      to: '/onboard',
    });
  }

  if (userRole === 'lecturer') {
    return <LecturerOnboardingSection />;
  }
  if (userRole === 'student') {
    return <StudentOnboardingSection />;
  }
}
