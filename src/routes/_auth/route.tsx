import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useLoginRedirect } from '@/feature/onboarding/hooks/use-login-redirect';
import { Loader } from '@/components/Loader';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isLoading } = useLoginRedirect();

  return (
    <main className="h-full relative">
      {isLoading && <Loader />}
      <Outlet />
    </main>
  );
}
