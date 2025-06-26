import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/onboard')({
  // validateSearch:
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      {/* Welcome to the Onboarding page */}
      <Outlet />
    </main>
  );
}
