/// <reference types="vite/client" />
import * as React from 'react';
import { Toaster } from 'react-hot-toast';
import { ConvexReactClient } from 'convex/react';

import {
  Outlet,
  createRootRouteWithContext,
  // useRouterState,
  HeadContent,
  Scripts,
  useRouteContext,
} from '@tanstack/react-router';
import appCss from '@/styles/app.css?url';
import { seo } from '@/utils/seo';
// import { Loader } from '@/components/Loader';
import { NotFound } from '@/components/NotFound';
import { fetchAuth } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import type { QueryClient } from '@tanstack/react-query';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title:
          'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  beforeLoad: async (ctx) => {
    // all queries, mutations and action made with TanStack Query will be
    // authenticated by an identity token.
    const auth = await fetchAuth();
    const { userId, token } = auth;

    // During SSR only (the only time serverHttpClient exists),
    // set the auth token for Convex to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return { userId, token };
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });
  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="h-screen flex flex-col min-h-0">
          <div className="flex-grow min-h-0 h-full flex flex-col">
            {children}
            <Toaster />
          </div>
        </div>
        <ReactQueryDevtools />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
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
