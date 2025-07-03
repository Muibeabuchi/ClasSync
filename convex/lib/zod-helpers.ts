import { z } from 'zod';
import { zCustomQuery, zCustomAction } from 'convex-helpers/server/zod';
import { NoOp } from 'convex-helpers/server/customFunctions';
import { action, query } from '../_generated/server';

// Define this once - and customize like you would customQuery
export const zodQuery = zCustomQuery(query, NoOp);
export const zodAction = zCustomAction(action, NoOp);

export const lecturerPlanSchema = z.union([
  z.literal('free'),
  z.literal('basic'),
  z.literal('pro'),
]);
