import { RoleSelect } from '@/feature/onboarding/components/role-select';
import { createFileRoute } from '@tanstack/react-router';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';

export const Route = createFileRoute('/_onboard/onboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const signOut = useSignOut();
  const handleConfirmCancel = async () => {
    await signOut();
  };
  return <RoleSelect handleConfirmCancel={handleConfirmCancel} />;
}
