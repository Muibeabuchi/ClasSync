import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useLoginRedirect } from '@/feature/onboarding/hooks/use-login-redirect';
// import { Loader } from '@/components/Loader';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
});

function RouteComponent() {
  useLoginRedirect();

  return (
    <main className="h-full relative">
      {/* {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse" />
      )} */}
      <Outlet />
    </main>
  );
}
