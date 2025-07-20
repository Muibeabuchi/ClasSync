// import { Id } from 'convex/_generated/dataModel';
import { type Id } from 'convex/_generated/dataModel';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

export const useGetClassListWithAvailableStudents = ({
  courseId,
}: {
  courseId: Id<'courses'> | null;
}) =>
  useQuery({
    ...convexQuery(
      api.classLists.getClassListsWithAvailableStudents,
      courseId !== null ? { courseId } : 'skip',
    ),
    enabled: !!courseId,
  });
