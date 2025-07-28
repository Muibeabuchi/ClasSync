import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { AuthQueryOptions } from '@/feature/auth/api/get-current-user';
import StudentSettings from '@/feature/student/components/student-settings';
import MobileStudentSettings from '@/feature/student/components/mobile-student-settings';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/dashboard/student/settings')({
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
      {isMobile ? <MobileStudentSettings /> : <StudentSettings />}
    </Authenticated>
  );
}
