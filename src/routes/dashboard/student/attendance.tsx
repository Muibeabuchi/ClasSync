import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import AttendanceCheckIn from '@/feature/student/components/attendance-check-in';
import MobileAttendanceCheckIn from '@/feature/student/components/mobile-attendance-check-in';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/dashboard/student/attendance')({
  component: RouteComponent,
  async loader({ context }) {
    // Prefetch courses with active attendance sessions
    await context.queryClient.ensureQueryData(
      convexQuery(api.courses.getCoursesWithActiveAttendance, {}),
    );
  },
});

function RouteComponent() {
  const isMobile = useIsMobile();

  return (
    <Authenticated>
      {isMobile ? <MobileAttendanceCheckIn /> : <AttendanceCheckIn />}
    </Authenticated>
  );
}
