import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import './styles/app.css';
import { ConvexQueryClient } from '@convex-dev/react-query';
import {
  ConvexReactClient,
  //  ConvexProvider
} from 'convex/react';
import { gcTimeConstant } from './constants/constants';
import { toast } from 'sonner';
import { NotFound } from './components/NotFound';
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary';
import { authClient } from './lib/auth-client';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
if (!CONVEX_URL) {
  console.error('missing environment variable CONVEX_URL');
}
const convex = new ConvexReactClient(CONVEX_URL, {
  unsavedChangesWarning: false,
});
const convexQueryClient = new ConvexQueryClient(convex);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
      gcTime: gcTimeConstant,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      toast(error.message, { className: 'bg-red-500 text-white' });
    },
  }),
});
convexQueryClient.connect(queryClient);

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: DefaultCatchBoundary,
  defaultNotFoundComponent: () => <NotFound />,
  context: { queryClient, convexClient: convex, convexQueryClient },
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConvexBetterAuthProvider>,
  );
}
