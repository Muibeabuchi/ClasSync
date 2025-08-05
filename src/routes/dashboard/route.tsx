// import { userOnBoardedQueries } from '@/feature/onboarding/api/api-hooks';
// import { useDashboardRedirect } from '@/feature/onboarding/hooks/use-dashboard-redirect';
// import {
//   createFileRoute,
//   // Navigate,
//   Outlet,
//   // useNavigate,
// } from '@tanstack/react-router';
// import {
//   Authenticated,
//   //  Unauthenticated
// } from 'convex/react';

// export const Route = createFileRoute('/dashboard')({
//   component: RouteComponent,
//   async loader({ context }) {
//     await context.queryClient.ensureQueryData(
//       userOnBoardedQueries.getUserOnboardedStatus,
//     );
//   },
//   wrapInSuspense: true,
//   pendingComponent: LoaderComponent,
// });

// export function LoaderComponent() {
//   return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//     </div>
//   );
// }

// function RouteComponent() {
//   const { data } = useDashboardRedirect();
//   // const { data } = useLecturerDashboardRedirect();
//   // const navigate = useNavigate();

//   // These are here to handle redirects from the login Page
//   // // Todo: Move the redirect Logic to a different Page
//   // if (data?.role === 'lecturer') {
//   //   navigate({
//   //     to: '/dashboard/lecturer',
//   //   });
//   // } else {
//   //   navigate({
//   //     to: '/dashboard/student',
//   //   });
//   // }

//   if (data === null) return <LoaderComponent />;

//   return (
//     <>
//       <Authenticated>
//         <Outlet />
//       </Authenticated>
//       {/* <Unauthenticated>
//         <Navigate to="/login" />
//       </Unauthenticated> */}
//     </>
//   );
// }
