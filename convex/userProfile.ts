import { ConvexError, v } from 'convex/values';
import {
  AuthenticatedUserMutation,
  AuthenticatedUserQuery,
} from './middlewares/authenticatedMiddleware';
import { userRoleSchema } from './schema';
import { query } from './_generated/server';
import { getCurrentUser, getUserProfileId } from './models/userprofileModel';

export const getAuthenticatedUser = query({
  args: {},
  async handler(ctx) {
    return await getUserProfileId(ctx);
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

export const getUserOnboardedStatus = AuthenticatedUserQuery({
  returns: v.union(v.boolean(), v.null()),
  handler: async (ctx) => {
    const userInfo = await ctx.db.get(ctx.user._id);
    if (!userInfo) return null;
    return userInfo.isOnboarded;
  },
});

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
