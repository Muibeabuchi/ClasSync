import { ConvexError, v } from 'convex/values';
import {
  AuthenticatedUserMutation,
  // AuthenticatedUserQuery,
} from './middlewares/authenticatedMiddleware';
import {
  lecturerTitleSchema,
  studentGenderSchema,
  studentYearLevelSchema,
  userRoleSchema,
} from './schema';
import { query } from './_generated/server';
import { getCurrentUser } from './models/userprofileModel';
// import { createAuth } from './auth';

// ? ====================QUERIES====================

export const getAuthenticatedUser = query({
  args: {},
  async handler(ctx) {
    const user = getCurrentUser({ ctx });
    return user;
  },
});

export const getUserRole = query({
  args: {},
  returns: v.union(userRoleSchema, v.null()),
  async handler(ctx) {
    const user = await getCurrentUser({ ctx });
    if (!user) throw new ConvexError('Unauthorized user request');

    // If the user has not yet selected a role, the response is gonna be null
    return user.role ?? null;
  },
});

export const getUserOnboardedStatus = query({
  returns: v.union(
    v.object({
      isOnboarded: v.union(v.boolean(), v.null()),
      role: v.optional(userRoleSchema),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser({ ctx });
    if (!user) return null;
    return { isOnboarded: user.isOnboarded, role: user.role };
  },
});

// ? ====================MUTATIONS====================

export const updateUserOnboardedStatus = AuthenticatedUserMutation({
  args: {
    isOnboarded: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.userId, {
      isOnboarded: args.isOnboarded,
    });
  },
});

export const updateUserRole = AuthenticatedUserMutation({
  args: {
    role: userRoleSchema,
  },
  returns: userRoleSchema,
  async handler(ctx, args) {
    await ctx.db.patch(ctx.userId, {
      role: args.role,
    });
    return args.role;
  },
});

export const completeUserOnboarding = AuthenticatedUserMutation({
  args: {
    fullName: v.string(),
    title: v.optional(lecturerTitleSchema),
    faculty: v.optional(v.string()),
    department: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    yearLevel: v.optional(studentYearLevelSchema),
    gender: v.optional(studentGenderSchema),
  },
  returns: {
    success: v.boolean(),
    message: v.string(),
  },
  async handler(ctx, args) {
    // check the users onboarded status. Onboarded users cannot call this mutation
    const isOnboarded = ctx.user.isOnboarded;
    if (isOnboarded)
      throw new ConvexError(
        'Unauthorized:Onboarded Users cannot be onBoarded twice',
      );

    // Check for the users role and ensure they have all the required data for that role
    const userRole = ctx.user.role;
    if (!userRole)
      throw new ConvexError(
        'User must select a role to complete the onboarding process ',
      );

    if (userRole === 'student') {
      const onboardingData = {
        fullName: args.fullName,
        registrationNumber: args.registrationNumber,
        gender: args.gender,
        yearLevel: args.yearLevel,
        faculty: args.faculty,
        department: args.department,
      };

      await ctx.db.patch(ctx.userId, {
        ...onboardingData,
        isOnboarded: true,
      });
    }
    if (userRole === 'lecturer') {
      const onboardingData = {
        fullName: args.fullName,
        title: args.title,
        faculty: args.faculty,
        department: args.department,
      };

      // create a lecturerPlan
      await ctx.db.insert('lecturerPlan', {
        lecturerId: ctx.userId,
        attendanceSessionCount: 0,
        createdCourseCount: 0,
        registeredStudentCount: 0,
      });

      await ctx.db.patch(ctx.userId, {
        ...onboardingData,
        isOnboarded: true,
        lecturerCurrentPlan: {
          plan: 'FREE',
          isActive: true,
        },
      });
    }
    return {
      success: true,
      message: 'User Onboarded Successfully',
    };
  },
});

// export const cancelOnboardingFlow = AuthenticatedUserMutation({
//   args: {},
//   async handler(ctx, args) {
//     const auth = createAuth(ctx);
//     auth.api.deleteUser();
//     // check if the user has onboarded. If true,return null,else remove and delete the user
//   },
// });
// export const createUserRole = mutation({});

// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";
// import { getAuthUserId } from "@convex-dev/auth/server";

// export const createUserProfile = mutation({
//   args: {
//     role: v.union(v.literal("lecturer"), v.literal("student")),
//     fullName: v.string(),
//     faculty: v.string(),
//     department: v.string(),
//     // Lecturer fields
//     title: v.optional(v.union(v.literal("Prof"), v.literal("Dr"), v.literal("Engr"), v.literal("Mr"), v.literal("Mrs"))),
//     // Student fields
//     officialSchoolName: v.optional(v.string()),
//     registrationNumber: v.optional(v.string()),
//     yearLevel: v.optional(v.string()),
//     passportPhotoId: v.optional(v.id("_storage")),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     // Check if profile already exists
//     const existingProfile = await ctx.db
//       .query("userProfiles")
//       .withIndex("by_user_id", (q) => q.eq("userId", userId))
//       .unique();

//     if (existingProfile) {
//       throw new Error("Profile already exists");
//     }

//     // Create the profile
//     const profileId = await ctx.db.insert("userProfiles", {
//       userId,
//       role: args.role,
//       isOnboarded: true,
//       fullName: args.fullName,
//       faculty: args.faculty,
//       department: args.department,
//       title: args.title,
//       officialSchoolName: args.officialSchoolName,
//       registrationNumber: args.registrationNumber,
//       yearLevel: args.yearLevel,
//       passportPhotoId: args.passportPhotoId,
//     });

//     return profileId;
//   },
// });

// export const generateUploadUrl = mutation({
//   args: {},
//   handler: async (ctx) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }
//     return await ctx.storage.generateUploadUrl();
//   },
// });

// export const getImageUrl = query({
//   args: { storageId: v.id("_storage") },
//   handler: async (ctx, args) => {
//     return await ctx.storage.getUrl(args.storageId);
//   },
// });
