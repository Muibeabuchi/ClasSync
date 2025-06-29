// import { BackendUserRoleType } from '@/convex/schema';
import {
  lecturerTitleArrayConstant,
  yearLevelArrayConstant,
} from '@/constants/constants';
import { BackendUserRoleType } from './../../../../convex/schema';
// lib/zodSchemas.ts
import { z } from 'zod';
// import * as v from 'valibot';

// export const onboardSearchSchema = v.optional(v.fallback(v.literal('role')));
// const oboardingState = v.picklist(['']);

const yearLevelSchema = z.enum(yearLevelArrayConstant, {
  required_error: 'Please select your year level',
});
const lecturerTitleSchema = z.enum(lecturerTitleArrayConstant, {
  required_error: 'Please select a title',
});

const passportPhotoSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith('image/'), {
    message: 'File must be an image',
  })
  .refine((file) => file.size <= 2 * 1024 * 1024, {
    message: 'Image must be smaller than 2MB',
  });

const genderSchema = z.union([z.literal('male'), z.literal('female')]);
export const lecturerPersonalInfoSchema = z.object({
  fullName: z.string().min(5, 'Full name must be at least 5 characters'),
  title: lecturerTitleSchema,
});

export const lecturerAcademicInfoSchema = z.object({
  faculty: z.string().min(1, 'Please select a faculty'),
  department: z.string().min(1, 'Please select a department'),
});

export const studentFormSchema = z.object({
  fullName: z.string().min(5, 'Full name must be at least 5 characters'),
  registrationNumber: z
    .string()
    .regex(
      /^202\d{8}$/,
      'Registration number must be a valid Registration number',
    ),
  gender: genderSchema,
  //   .min(1, 'Please select your gender'),

  yearLevel: yearLevelSchema,
  faculty: z.string().min(1, 'Please select a faculty'),
  department: z.string().min(1, 'Please select a department'),
  passportPhoto: passportPhotoSchema.optional(),
});

// export type LecturerPersonalInfo = z.infer<typeof lecturerPersonalInfoSchema>;
// export type LecturerAcademicInfo = z.infer<typeof lecturerAcademicInfoSchema>;
// export type StudentFormData = z.infer<typeof studentFormSchema>;
export type UserRoleType = BackendUserRoleType;
export type GenderType = z.infer<typeof genderSchema>;
export type yearLevelType = z.infer<typeof yearLevelSchema>;
export type lecturerTitleType = z.infer<typeof lecturerTitleSchema>;

export type LecturerPersonalInfo = z.infer<typeof lecturerPersonalInfoSchema>;
export type LecturerAcademicInfo = z.infer<typeof lecturerAcademicInfoSchema>;
export type StudentFormData = z.infer<typeof studentFormSchema>;

export type OnboardingDataType = Partial<
  StudentFormData & LecturerAcademicInfo & LecturerPersonalInfo
>;
