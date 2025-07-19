import { useOnboardRedirect } from '@/feature/onboarding/hooks/use-onboard-redirect';
import {
  Outlet,
  // redirect,
  //  redirect
} from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
// import { convexQuery } from '@convex-dev/react-query';

export const Route = createFileRoute('/_onboard')({
  component: RouteComponent,
});

function RouteComponent() {
  useOnboardRedirect();
  return (
    <main>
      <Outlet />
    </main>
  );
}
