import { useSignOut } from '@/feature/auth/hooks/use-google-auth';
import {
  useCompleteOnboarding,
  useGetUserRole,
} from '@/feature/onboarding/api/api-hooks';
import LecturerOnboardingSection from '@/feature/onboarding/components/lecturer-onboarding-section';
import StudentOnboardingSection from '@/feature/onboarding/components/onboard.student';
import { type OnboardingDataType } from '@/feature/onboarding/schema/onboarding-schema';
import { convexQuery } from '@convex-dev/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { toast } from 'sonner';

export const Route = createFileRoute('/_onboard/role')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.userProfile.getUserRole, {}),
    );
  },
  component: RouteComponent,
  pendingComponent: () => {
    // TODO: create a proper component for handling loading state
    return <div className="">Loading the Role Page</div>;
  },
});

function RouteComponent() {
  const { data: userRole } = useGetUserRole();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const handleConfirmCancel = async () => {
    await signOut();
  };
  const { mutateAsync: completeOnboarding, isPending: isCompletingOnboarding } =
    useCompleteOnboarding();

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
