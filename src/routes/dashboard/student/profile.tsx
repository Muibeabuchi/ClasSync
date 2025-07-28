import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { StudentProfileQueryOptions } from '@/feature/student/api/student-profile';
import StudentProfile from '@/feature/student/components/student-profile';
import MobileStudentProfileContainer from '@/feature/student/components/mobile-student-profile-container';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/dashboard/student/profile')({
  component: RouteComponent,
  async loader({ context }) {
    // Prefetch user data and profile image for profile page
    await context.queryClient.ensureQueryData(
      StudentProfileQueryOptions.getCurrentUser,
    );
    context.queryClient.prefetchQuery(
      StudentProfileQueryOptions.getUserProfileImage,
    );
  },
});

function RouteComponent() {
  const isMobile = useIsMobile();

  return (
    <Authenticated>
      {isMobile ? <MobileStudentProfileContainer /> : <StudentProfile />}
    </Authenticated>
  );
}
