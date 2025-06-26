import { RoleSelect } from '@/feature/onboarding/components/role-select';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/onboard/role')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoleSelect />;
}
