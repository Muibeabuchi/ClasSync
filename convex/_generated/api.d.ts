/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as classListStudents from "../classListStudents.js";
import type * as classLists from "../classLists.js";
import type * as constants_attendance from "../constants/attendance.js";
import type * as courses from "../courses.js";
import type * as http from "../http.js";
import type * as joinRequests from "../joinRequests.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as lib_zodHelpers from "../lib/zodHelpers.js";
import type * as middlewares_authenticatedMiddleware from "../middlewares/authenticatedMiddleware.js";
import type * as middlewares_lecturerMiddleware from "../middlewares/lecturerMiddleware.js";
import type * as middlewares_studentMiddleware from "../middlewares/studentMiddleware.js";
import type * as models_attendanceModel from "../models/attendanceModel.js";
import type * as models_attendanceRecordsModel from "../models/attendanceRecordsModel.js";
import type * as models_authModel from "../models/authModel.js";
import type * as models_classListModel from "../models/classListModel.js";
import type * as models_classListStudentModel from "../models/classListStudentModel.js";
import type * as models_coursesModel from "../models/coursesModel.js";
import type * as models_joinRequestModel from "../models/joinRequestModel.js";
import type * as models_userprofileModel from "../models/userprofileModel.js";
import type * as service_paystack from "../service/paystack.js";
import type * as userProfile from "../userProfile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  auth: typeof auth;
  classListStudents: typeof classListStudents;
  classLists: typeof classLists;
  "constants/attendance": typeof constants_attendance;
  courses: typeof courses;
  http: typeof http;
  joinRequests: typeof joinRequests;
  "lib/helpers": typeof lib_helpers;
  "lib/zodHelpers": typeof lib_zodHelpers;
  "middlewares/authenticatedMiddleware": typeof middlewares_authenticatedMiddleware;
  "middlewares/lecturerMiddleware": typeof middlewares_lecturerMiddleware;
  "middlewares/studentMiddleware": typeof middlewares_studentMiddleware;
  "models/attendanceModel": typeof models_attendanceModel;
  "models/attendanceRecordsModel": typeof models_attendanceRecordsModel;
  "models/authModel": typeof models_authModel;
  "models/classListModel": typeof models_classListModel;
  "models/classListStudentModel": typeof models_classListStudentModel;
  "models/coursesModel": typeof models_coursesModel;
  "models/joinRequestModel": typeof models_joinRequestModel;
  "models/userprofileModel": typeof models_userprofileModel;
  "service/paystack": typeof service_paystack;
  userProfile: typeof userProfile;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: {
    lib: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                createdAt: number;
                email: string;
                emailVerified: boolean;
                image?: string;
                name: string;
                table: string;
                twoFactorEnabled?: boolean;
                updatedAt: number;
                userId: string;
              }
            | {
                createdAt: number;
                expiresAt: number;
                ipAddress?: string;
                table: string;
                token: string;
                updatedAt: number;
                userAgent?: string;
                userId: string;
              }
            | {
                accessToken?: string;
                accessTokenExpiresAt?: number;
                accountId: string;
                createdAt: number;
                idToken?: string;
                password?: string;
                providerId: string;
                refreshToken?: string;
                refreshTokenExpiresAt?: number;
                scope?: string;
                table: string;
                updatedAt: number;
                userId: string;
              }
            | {
                backupCodes: string;
                secret: string;
                table: string;
                userId: string;
              }
            | {
                createdAt?: number;
                expiresAt: number;
                identifier: string;
                table: string;
                updatedAt?: number;
                value: string;
              }
            | {
                createdAt: number;
                id?: string;
                privateKey: string;
                publicKey: string;
                table: string;
              };
        },
        any
      >;
      deleteAllForUser: FunctionReference<
        "action",
        "internal",
        { table: string; userId: string },
        any
      >;
      deleteAllForUserPage: FunctionReference<
        "mutation",
        "internal",
        {
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          table: string;
          userId: string;
        },
        any
      >;
      deleteBy: FunctionReference<
        "mutation",
        "internal",
        {
          field: string;
          table: string;
          unique?: boolean;
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        },
        any
      >;
      deleteExpiredSessions: FunctionReference<
        "mutation",
        "internal",
        { expiresAt: number; userId: string },
        any
      >;
      deleteOldVerifications: FunctionReference<
        "action",
        "internal",
        { currentTimestamp: number },
        any
      >;
      deleteOldVerificationsPage: FunctionReference<
        "mutation",
        "internal",
        {
          currentTimestamp: number;
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      getAccountByAccountIdAndProviderId: FunctionReference<
        "query",
        "internal",
        { accountId: string; providerId: string },
        any
      >;
      getAccountsByUserId: FunctionReference<
        "query",
        "internal",
        { limit?: number; userId: string },
        any
      >;
      getBy: FunctionReference<
        "query",
        "internal",
        {
          field: string;
          table: string;
          unique?: boolean;
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        },
        any
      >;
      getByQuery: FunctionReference<
        "query",
        "internal",
        {
          field: string;
          table: string;
          unique?: boolean;
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        },
        any
      >;
      getCurrentSession: FunctionReference<"query", "internal", {}, any>;
      getJwks: FunctionReference<"query", "internal", { limit?: number }, any>;
      getSessionsByUserId: FunctionReference<
        "query",
        "internal",
        { limit?: number; userId: string },
        any
      >;
      listVerificationsByIdentifier: FunctionReference<
        "query",
        "internal",
        {
          identifier: string;
          limit?: number;
          sortBy?: { direction: "asc" | "desc"; field: string };
        },
        any
      >;
      update: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                table: "account";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              }
            | {
                table: "session";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              }
            | {
                table: "verification";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              }
            | {
                table: "user";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              };
        },
        any
      >;
      updateTwoFactor: FunctionReference<
        "mutation",
        "internal",
        {
          update: { backupCodes?: string; secret?: string; userId?: string };
          userId: string;
        },
        any
      >;
      updateUserProviderAccounts: FunctionReference<
        "mutation",
        "internal",
        {
          providerId: string;
          update: {
            accessToken?: string;
            accessTokenExpiresAt?: number;
            accountId?: string;
            createdAt?: number;
            idToken?: string;
            password?: string;
            providerId?: string;
            refreshToken?: string;
            refreshTokenExpiresAt?: number;
            scope?: string;
            updatedAt?: number;
            userId?: string;
          };
          userId: string;
        },
        any
      >;
    };
  };
};
