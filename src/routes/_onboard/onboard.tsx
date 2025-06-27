import { RoleSelect } from '@/feature/onboarding/components/role-select';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_onboard/onboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoleSelect />;
}
