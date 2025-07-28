import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import StudentNotifications from '@/feature/student/components/student-notifications';
import MobileStudentNotifications from '@/feature/student/components/mobile-student-notifications';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/dashboard/student/notifications')({
  component: RouteComponent,
  async loader() {
    // TODO: Prefetch notifications when the API is available
    // await context.queryClient.ensureQueryData(
    //   convexQuery(api.notifications.getUserNotifications, {}),
    // );
  },
});

function RouteComponent() {
  const isMobile = useIsMobile();

  return (
    <Authenticated>
      {isMobile ? <MobileStudentNotifications /> : <StudentNotifications />}
    </Authenticated>
  );
}
