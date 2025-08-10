import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { AuthQueryOptions } from '@/feature/auth/api/get-current-user';
import LecturerSettings from '@/feature/lecturer/components/lecturer-settings';
import MobileLecturerSettings from '@/feature/lecturer/components/mobile-lecturer-settings';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/dashboard/lecturer/settings')({
  component: RouteComponent,
  async loader({ context }) {
    // Prefetch user data for settings
    await context.queryClient.ensureQueryData(AuthQueryOptions.getCurrentUser);
  },
});

function RouteComponent() {
  const isMobile = useIsMobile();

  return (
    <Authenticated>
      {isMobile ? <MobileLecturerSettings /> : <LecturerSettings />}
    </Authenticated>
  );
}
