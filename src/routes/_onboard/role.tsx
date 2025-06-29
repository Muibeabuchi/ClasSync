// import { userRoleConstant } from '@/constants/constants';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';
import {
  useCompleteOnboarding,
  useGetUserRole,
} from '@/feature/onboarding/api/api-hooks';
import LecturerOnboardingSection from '@/feature/onboarding/components/lecturer-onboarding-section';
import StudentOnboardingSection from '@/feature/onboarding/components/onboard.student';
import {
  OnboardingDataType,
  // GenderType,
  // StudentFormData,
} from '@/feature/onboarding/schema/onboarding-schema';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
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
  // async beforeLoad() {
  //   const userRole = getUserRoleAction();
  //   if (userRole === null) {
  //     // Redirect the user to the onboard page to select a role if the value is null
  //     throw redirect({
  //       to: '/onboard',
  //     });
  //   }
  // },
  component: RouteComponent,
  pendingComponent: () => {
    return <div className="">Loading the Role Page</div>;
  },
});

function RouteComponent() {
  // const navigate = Route.useNavigate();
  const { data: userRole } = useGetUserRole();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const handleConfirmCancel = async () => {
    await signOut();
  };
  const { mutateAsync: completeOnboarding, isPending: isCompletingOnboarding } =
    useCompleteOnboarding();
  // if (userRole === null) {
  //   navigate({
  //     to: '/onboard',
  //   });
  // }

  const handleGoToDashboard = async ({
    department,
    faculty,
    fullName,
    gender,
    registrationNumber,
    title,
    yearLevel,
    // passportPhoto,
  }: OnboardingDataType) => {
    if (isCompletingOnboarding) return;
    if (!fullName) return;
    // store the users info  in the back end
    const response = await completeOnboarding({
      department,
      faculty,
      fullName,
      gender,
      registrationNumber,
      title,
      yearLevel,
      // passportPhoto,
    });
    if (response.success) {
      toast.success(response.message);
      navigate({
        to: '/dashboard',
      });
    } else {
      toast.error(
        'Onboarding Failed. Ensure you have filled in the right information',
      );
    }
  };
  if (userRole === 'lecturer') {
    return (
      <LecturerOnboardingSection
        handleConfirmCancel={handleConfirmCancel}
        handleCompleteOnboarding={handleGoToDashboard}
      />
    );
  }
  if (userRole === 'student') {
    return (
      <StudentOnboardingSection
        handleConfirmCancel={handleConfirmCancel}
        handleCompleteOnboarding={handleGoToDashboard}
      />
    );
  }
}
