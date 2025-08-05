import { useOnboardRedirect } from '@/feature/onboarding/hooks/use-onboard-redirect';
import {
  Outlet,
  // redirect,
  //  redirect
} from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
// import { convexQuery } from '@convex-dev/react-query';
import { LoaderComponent } from '../dashboard/route';
// import { Loader } from '@/components/Loader';

export const Route = createFileRoute('/_onboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isLoading, data } = useOnboardRedirect();

  if (isLoading) {
    return (
      <main className="w-full h-screen items-center justify-center flex flex-col">
        <LoaderComponent />
      </main>
    );
  }
  if (!data?.isOnboarded) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  return null;
}
