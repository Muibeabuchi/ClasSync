import { useLecturerClassListQuery } from '@/feature/classList/api/get-lecturer-classLists';
import LecturerClassListsPage, {
  LecturerClassListsPageSkeleton,
} from '@/feature/lecturer/components/lecturer-classlist-page';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Authenticated } from 'convex/react';

export const Route = createFileRoute('/dashboard/$role/classLists')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.classLists.getMyClassLists, {}),
    );
  },
  pendingComponent: LecturerClassListsPageSkeleton,
});

function RouteComponent() {
  const { data: classLists, isLoading } = useLecturerClassListQuery();
  // set up loading State
  if (isLoading || classLists === undefined) {
    return <LecturerClassListsPageSkeleton />;
  }

  return (
    <Authenticated>
      <LecturerClassListsPage LecturerClassLists={classLists} />
    </Authenticated>
  );
}
