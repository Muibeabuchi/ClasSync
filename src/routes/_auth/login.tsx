import LoginPage from '@/feature/auth/components/login-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <LoginPage />
    </main>
  );
}
