import LecturerDashboardContent, {
  LecturerDashboardSkeleton,
} from '@/feature/lecturer/components/lecturer-dashboard-content';
import { MobileLecturerHome } from '@/feature/lecturer/components/mobile/mobile-lecturer-home';
import {
  useGetUserOnboardedStatus,
  userOnBoardedQueries,
} from '@/feature/onboarding/api/api-hooks';
import { useDeviceType } from '@/hooks/use-device-type';
import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';

export const Route = createFileRoute('/dashboard/lecturer/')({
  component: RouteComponent,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(
      userOnBoardedQueries.getUserOnboardedStatus,
    );
  },
  pendingComponent: LecturerDashboardSkeleton,
});

function RouteComponent() {
  const { data } = useGetUserOnboardedStatus();
  const { isMobile } = useDeviceType();

  return (
    <Authenticated>
      {isMobile ? (
        <MobileLecturerHome
          fullName={data?.fullName}
          userImage={data?.userImage}
        />
      ) : (
        <LecturerDashboardContent
          fullName={data?.fullName}
          userImage={data?.userImage}
        />
      )}
    </Authenticated>
  );
}
