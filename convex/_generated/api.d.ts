/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as attendance from "../attendance.js";
import type * as attendanceEnhanced from "../attendanceEnhanced.js";
import type * as auth from "../auth.js";
import type * as classLists from "../classLists.js";
import type * as courseManagement from "../courseManagement.js";
import type * as courses from "../courses.js";
import type * as coursesEnhanced from "../coursesEnhanced.js";
import type * as http from "../http.js";
import type * as joinRequests from "../joinRequests.js";
import type * as joinRequestsEnhanced from "../joinRequestsEnhanced.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as router from "../router.js";
import type * as studentActions from "../studentActions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  attendanceEnhanced: typeof attendanceEnhanced;
  auth: typeof auth;
  classLists: typeof classLists;
  courseManagement: typeof courseManagement;
  courses: typeof courses;
  coursesEnhanced: typeof coursesEnhanced;
  http: typeof http;
  joinRequests: typeof joinRequests;
  joinRequestsEnhanced: typeof joinRequestsEnhanced;
  messages: typeof messages;
  notifications: typeof notifications;
  router: typeof router;
  studentActions: typeof studentActions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
