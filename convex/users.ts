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
