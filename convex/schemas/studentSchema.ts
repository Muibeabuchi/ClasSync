import { z } from 'zod';

/**
 * Expected student data schema for AI CSV fix feature
 * This schema defines the target format that AI-repaired CSV data should conform to
 */
export const ExpectedStudentSchema = z.object({
  name: z
    .string()
    .min(1, 'Student name is required')
    .max(100, 'Student name must be less than 100 characters')
    .trim()
    .refine(
      (name) => name.length > 0,
      'Student name cannot be empty after trimming',
    )
    .refine(
      (name) => /^[a-zA-Z\s'-]+$/.test(name),
      'Student name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  gender: z.enum(['Male', 'Female'], {
    errorMap: () => ({ message: 'Gender must be either "Male" or "Female"' }),
  }),

  regNumber: z
    .string()
    .min(1, 'Registration number is required')
    .trim()
    .refine(
      (regNum) => regNum.length > 0,
      'Registration number cannot be empty after trimming',
    )
    .refine(
      (regNum) => /^202\d{5,}$/.test(regNum),
      'Registration number must start with "202" followed by at least 5 digits',
    )
    .refine(
      (regNum) => regNum.length >= 8 && regNum.length <= 15,
      'Registration number must be between 8 and 15 characters long',
    ),
});

/**
 * Type inference for the expected student schema
 */
export type ExpectedStudentType = z.infer<typeof ExpectedStudentSchema>;

/**
 * Schema for validating an array of students
 */
export const ExpectedStudentArraySchema = z
  .array(ExpectedStudentSchema)
  .min(1, 'At least one student is required')
  .max(500, 'Cannot process more than 500 students at once')
  .refine((students) => {
    const regNumbers = students.map((s) => s.regNumber);
    const uniqueRegNumbers = new Set(regNumbers);
    return regNumbers.length === uniqueRegNumbers.size;
  }, 'Duplicate registration numbers are not allowed');

/**
 * Type inference for the student array schema
 */
export type ExpectedStudentArrayType = z.infer<
  typeof ExpectedStudentArraySchema
>;

/**
 * Validation function for individual student data
 * Returns validation result with detailed error messages
 */
export const validateStudentData = (data: unknown) => {
  return ExpectedStudentSchema.safeParse(data);
};

/**
 * Validation function for student array data
 * Returns validation result with detailed error messages
 */
export const validateStudentArrayData = (data: unknown) => {
  return ExpectedStudentArraySchema.safeParse(data);
};

/**
 * Helper function to format validation errors into user-friendly messages
 */
export const formatValidationErrors = (errors: z.ZodError): string[] => {
  return errors.errors.map((error) => {
    const path = error.path.length > 0 ? `${error.path.join('.')}: ` : '';
    return `${path}${error.message}`;
  });
};

/**
 * Helper function to validate and clean a single student record
 * Applies basic cleaning (trimming) before validation
 */
export const validateAndCleanStudent = (
  rawData: any,
): {
  success: boolean;
  data?: ExpectedStudentType;
  errors?: string[];
} => {
  try {
    // Pre-process the data to handle common issues
    const cleanedData = {
      name:
        typeof rawData.name === 'string' ? rawData.name.trim() : rawData.name,
      gender:
        typeof rawData.gender === 'string'
          ? rawData.gender.trim()
          : rawData.gender,
      regNumber:
        typeof rawData.regNumber === 'string'
          ? rawData.regNumber.trim()
          : rawData.regNumber,
    };

    const result = ExpectedStudentSchema.safeParse(cleanedData);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        errors: formatValidationErrors(result.error),
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ['Unexpected error during validation'],
    };
  }
};

/**
 * Helper function to validate and clean an array of student records
 */
export const validateAndCleanStudentArray = (
  rawData: any[],
): {
  success: boolean;
  data?: ExpectedStudentArrayType;
  errors?: string[];
  validCount?: number;
  invalidCount?: number;
} => {
  try {
    const cleanedStudents: any[] = [];
    const validationErrors: string[] = [];
    let validCount = 0;
    let invalidCount = 0;

    // Process each student individually first
    rawData.forEach((student, index) => {
      const result = validateAndCleanStudent(student);
      if (result.success && result.data) {
        cleanedStudents.push(result.data);
        validCount++;
      } else {
        invalidCount++;
        const studentErrors = result.errors || ['Unknown validation error'];
        studentErrors.forEach((error) => {
          validationErrors.push(`Student ${index + 1}: ${error}`);
        });
      }
    });

    // If no valid students, return error
    if (cleanedStudents.length === 0) {
      return {
        success: false,
        errors: ['No valid students found', ...validationErrors],
        validCount,
        invalidCount,
      };
    }

    // Validate the array as a whole (checks for duplicates, etc.)
    const arrayResult = ExpectedStudentArraySchema.safeParse(cleanedStudents);

    if (arrayResult.success) {
      return {
        success: true,
        data: arrayResult.data,
        validCount,
        invalidCount,
        errors: validationErrors.length > 0 ? validationErrors : undefined,
      };
    } else {
      return {
        success: false,
        errors: [
          ...formatValidationErrors(arrayResult.error),
          ...validationErrors,
        ],
        validCount,
        invalidCount,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ['Unexpected error during array validation'],
      validCount: 0,
      invalidCount: rawData.length,
    };
  }
};
