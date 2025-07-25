import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

export const useGetClassList = (classListId: Id<'classLists'> | null) =>
  useQuery(
    convexQuery(
      api.classLists.getClassList,
      classListId ? { classListId } : 'skip',
    ),
  );
