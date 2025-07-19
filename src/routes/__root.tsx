/// <reference types="vite/client" />
import { ConvexReactClient } from 'convex/react';
import { Toaster } from '@/components/ui/sonner';

import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { NotFound } from '@/components/NotFound';
import type { QueryClient } from '@tanstack/react-query';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  errorComponent: (props) => {
    return <DefaultCatchBoundary {...props} />;
  },
  beforeLoad: async () => {},
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="h-screen flex flex-col min-h-0">
        <div className="flex-grow min-h-0 h-full flex flex-col">
          <Outlet />
          <Toaster />
        </div>
      </div>
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

// function LoadingIndicator() {
//   const isLoading = useRouterState({ select: (s) => s.isLoading });
//   return (
//     <div
//       className={`h-12 transition-all duration-300 ${
//         isLoading ? `opacity-100 delay-300` : `opacity-0 delay-0`
//       }`}
//     >
//       <Loader />
//     </div>
//   );
// }
