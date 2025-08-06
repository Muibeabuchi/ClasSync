import { LoaderComponent } from '@/components/Loader';
import { userOnBoardedQueries } from '@/feature/onboarding/api/api-hooks';
import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
import {
  createFileRoute,
  useNavigate,
  // Navigate,
  //   Outlet,
} from '@tanstack/react-router';

// export const Route = createFileRoute('/dashboard')({
//   component: RouteComponent,

// });

export const Route = createFileRoute('/(auth)/login-success')({
  component: RouteComponent,
  pendingComponent: LoaderComponent,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(
      userOnBoardedQueries.getUserOnboardedStatus,
    );
  },
  wrapInSuspense: true,
});

function RouteComponent() {
  const { data } = useDashboardRedirect();
  const navigate = useNavigate();

  // These are here to handle redirects from the login Page
  // // Todo: Move the redirect Logic to a different Page
  if (data?.role === 'lecturer') {
    navigate({
      to: '/dashboard/lecturer',
    });
  } else {
    navigate({
      to: '/dashboard/student',
    });
  }

  if (data === null) return <LoaderComponent />;
}
