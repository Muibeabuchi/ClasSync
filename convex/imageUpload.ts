import { ConvexError, v } from 'convex/values';
import { AuthenticatedUserMutation } from './middlewares/authenticatedMiddleware';
import { query } from './_generated/server';
import { getCurrentUser } from './models/userprofileModel';

// ? ====================QUERIES====================

export const getImageUrl = query({
  args: { storageId: v.id('_storage') },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    try {
      return await ctx.storage.getUrl(args.storageId);
    } catch (error) {
      console.error('Failed to get image URL:', error);
      return null;
    }
  },
});

export const getUserProfileImage = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const user = await getCurrentUser({ ctx });
    if (!user) return null;

    const imageId =
      user.role === 'student'
        ? user.student_passport_photo_id
        : user.lecturerPassportImage;

    if (!imageId) return null;

    try {
      return await ctx.storage.getUrl(imageId);
    } catch (error) {
      console.error('Failed to get user profile image URL:', error);
      return null;
    }
  },
});

// ? ====================MUTATIONS====================

export const generateUploadUrl = AuthenticatedUserMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    try {
      return await ctx.storage.generateUploadUrl();
    } catch (error) {
      console.error('Failed to generate upload URL:', error);
      throw new ConvexError('Failed to generate upload URL');
    }
  },
});

export const updateUserProfileImage = AuthenticatedUserMutation({
  args: {
    storageId: v.id('_storage'),
  },
  returns: {
    success: v.boolean(),
    message: v.string(),
    imageUrl: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    try {
      const user = ctx.user;

      if (!user.role) {
        throw new ConvexError(
          'User role must be set before uploading profile image',
        );
      }

      // Delete old image if it exists
      const oldImageId =
        user.role === 'student'
          ? user.student_passport_photo_id
          : user.lecturerPassportImage;

      if (oldImageId) {
        try {
          await ctx.storage.delete(oldImageId);
        } catch (error) {
          console.warn('Failed to delete old image:', error);
          // Continue with update even if deletion fails
        }
      }

      // Update user profile with new image
      const updateData =
        user.role === 'student'
          ? { student_passport_photo_id: args.storageId }
          : { lecturerPassportImage: args.storageId };

      await ctx.db.patch(ctx.userId, updateData);

      // Get the URL for the uploaded image
      const imageUrl = await ctx.storage.getUrl(args.storageId);

      return {
        success: true,
        message: 'Profile image updated successfully',
        imageUrl,
      };
    } catch (error) {
      console.error('Failed to update profile image:', error);
      throw new ConvexError(
        error instanceof ConvexError
          ? error.message
          : 'Failed to update profile image',
      );
    }
  },
});

export const deleteUserProfileImage = AuthenticatedUserMutation({
  args: {},
  returns: {
    success: v.boolean(),
    message: v.string(),
  },
  handler: async (ctx) => {
    try {
      const user = ctx.user;

      if (!user.role) {
        throw new ConvexError('User role must be set');
      }

      const imageId =
        user.role === 'student'
          ? user.student_passport_photo_id
          : user.lecturerPassportImage;

      if (!imageId) {
        return {
          success: true,
          message: 'No profile image to delete',
        };
      }

      // Delete from storage
      await ctx.storage.delete(imageId);

      // Update user profile to remove image reference
      const updateData =
        user.role === 'student'
          ? { student_passport_photo_id: undefined }
          : { lecturerPassportImage: undefined };

      await ctx.db.patch(ctx.userId, updateData);

      return {
        success: true,
        message: 'Profile image deleted successfully',
      };
    } catch (error) {
      console.error('Failed to delete profile image:', error);
      throw new ConvexError('Failed to delete profile image');
    }
  },
});
