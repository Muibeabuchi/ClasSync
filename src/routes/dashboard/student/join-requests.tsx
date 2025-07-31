import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { useIsMobile } from '@/hooks/use-mobile';
import JoinRequestsPage from '@/feature/student/components/JoinRequestsPage';
import MobileJoinRequestsPage from '@/feature/student/components/MobileJoinRequestsPage';

export const Route = createFileRoute('/dashboard/student/join-requests')({
  component: RouteComponent,
});

function RouteComponent() {
  const isMobile = useIsMobile();

  return (
    <Authenticated>
      {isMobile ? <MobileJoinRequestsPage /> : <JoinRequestsPage />}
    </Authenticated>
  );
}
