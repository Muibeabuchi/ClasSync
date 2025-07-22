import LoginPage from '@/feature/auth/components/login-section';
import { useLoginRedirect } from '@/feature/onboarding/hooks/use-login-redirect';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isLoading } = useLoginRedirect();

  return (
    <main>
      <LoginPage isLoading={isLoading} />
    </main>
  );
}
