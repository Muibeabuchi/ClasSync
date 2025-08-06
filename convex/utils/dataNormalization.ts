/**
 * Data cleaning and normalization utilities for AI CSV repair
 *
 * This module provides functions to clean and normalize student data entries
 * to ensure consistency and proper formatting before validation.
 *
 * Requirements covered:
 * - 3.1: Name case normalization (proper case conversion)
 * - 3.2: Gender value correction (handle typos and variations)
 * - 3.3: Whitespace trimming and empty row removal
 * - 3.4: Duplicate detection and removal
 */

import { ExpectedStudentType } from '../schemas/studentSchema';

/**
 * Common gender variations and their corrections
 */
export const GENDER_CORRECTIONS = {
  // Male variations
  male: 'Male',
  MALE: 'Male',
  Male: 'Male',
  m: 'Male',
  M: 'Male',
  man: 'Male',
  MAN: 'Male',
  Man: 'Male',
  boy: 'Male',
  BOY: 'Male',
  Boy: 'Male',
  mae: 'Male', // Common typo
  mal: 'Male', // Common typo
  mle: 'Male', // Common typo

  // Female variations
  female: 'Female',
  FEMALE: 'Female',
  Female: 'Female',
  f: 'Female',
  F: 'Female',
  woman: 'Female',
  WOMAN: 'Female',
  Woman: 'Female',
  girl: 'Female',
  GIRL: 'Female',
  Girl: 'Female',
  femlae: 'Female', // Common typo
  femle: 'Female', // Common typo
  femal: 'Female', // Common typo
  fmale: 'Female', // Common typo
  famale: 'Female', // Common typo
  femaile: 'Female', // Common typo
} as const;

/**
 * Common name prefixes that should be removed during normalization
 */
export const NAME_PREFIXES_TO_REMOVE = [
  'mr.',
  'mr',
  'mister',
  'mrs.',
  'mrs',
  'missus',
  'ms.',
  'ms',
  'miss',
  'dr.',
  'dr',
  'doctor',
  'prof.',
  'prof',
  'professor',
  'sir',
  'madam',
  "ma'am",
] as const;

/**
 * Normalize a person's name to proper case format
 */
export function normalizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Trim whitespace and remove extra spaces
  let normalized = name.trim().replace(/\s+/g, ' ');

  // Remove common prefixes
  const lowerName = normalized.toLowerCase();
  for (const prefix of NAME_PREFIXES_TO_REMOVE) {
    if (lowerName.startsWith(prefix + ' ')) {
      normalized = normalized.substring(prefix.length + 1).trim();
      break;
    }
  }

  // Convert to proper case while preserving special characters
  normalized = normalized
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;

      // Handle hyphenated names (e.g., Mary-Jane)
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('-');
      }

      // Handle names with apostrophes (e.g., O'Connor)
      if (word.includes("'")) {
        return word
          .split("'")
          .map((part, index) => {
            if (index === 0 || part.length === 0) {
              return part.charAt(0).toUpperCase() + part.slice(1);
            }
            // Special case for Irish names like O'Connor, D'Angelo
            if (part.length === 1) {
              return part.toUpperCase();
            }
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join("'");
      }

      // Regular word capitalization
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return normalized;
}

/**
 * Normalize gender value to standard format
 */
export function normalizeGender(gender: string): 'Male' | 'Female' | undefined {
  if (!gender || typeof gender !== 'string') {
    return undefined;
  }

  const trimmed = gender.trim();
  if (!trimmed) {
    return undefined;
  }

  // Check for exact matches in corrections map
  const correction =
    GENDER_CORRECTIONS[trimmed as keyof typeof GENDER_CORRECTIONS];
  if (correction) {
    return correction;
  }

  // Check for partial matches (case-insensitive)
  const lowerTrimmed = trimmed.toLowerCase();

  // Check if it contains male indicators
  if (
    lowerTrimmed.includes('male') ||
    lowerTrimmed.includes('man') ||
    lowerTrimmed.includes('boy')
  ) {
    return 'Male';
  }

  // Check if it contains female indicators
  if (
    lowerTrimmed.includes('female') ||
    lowerTrimmed.includes('woman') ||
    lowerTrimmed.includes('girl')
  ) {
    return 'Female';
  }

  // Return empty string if no match found
  return undefined;
}

/**
 * Normalize registration number to standard format
 */
export function normalizeRegistrationNumber(regNumber: string): string {
  if (!regNumber || typeof regNumber !== 'string') {
    return '';
  }

  // Remove whitespace and common prefixes
  let normalized = regNumber.trim().replace(/\s+/g, '');

  // Remove common prefixes
  const prefixesToRemove = ['REG:', 'NO:', 'ID:', 'MATRIC:', 'STUDENT:'];
  const upperNormalized = normalized.toUpperCase();

  for (const prefix of prefixesToRemove) {
    if (upperNormalized.startsWith(prefix)) {
      normalized = normalized.substring(prefix.length);
      break;
    }
  }

  // Remove any remaining non-numeric characters except for the main number
  normalized = normalized.replace(/[^0-9]/g, '');

  // Ensure it starts with "202" (current format requirement)
  if (normalized.length >= 3 && !normalized.startsWith('202')) {
    // If it looks like a year-based number but wrong year, try to fix it
    if (normalized.startsWith('20') && normalized.length >= 7) {
      // Assume it should be 202X format
      normalized = '202' + normalized.substring(3);
    }
  }

  // Pad with zeros if needed (minimum 8 digits, maximum 15)
  if (normalized.startsWith('202') && normalized.length < 8) {
    const zerosNeeded = 8 - normalized.length;
    normalized = normalized + '0'.repeat(zerosNeeded);
  }

  return normalized;
}

/**
 * Check if a row is empty or contains only whitespace
 */
export function isEmptyRow(row: any): boolean {
  if (!row || typeof row !== 'object') {
    return true;
  }

  // Check if all values are empty or whitespace
  const values = Object.values(row);
  return values.every((value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    return false;
  });
}

/**
 * Remove empty rows from an array of data
 */
export function removeEmptyRows<T>(rows: T[]): T[] {
  return rows.filter((row) => !isEmptyRow(row));
}

/**
 * Detect and remove duplicate students based on registration number
 */
export function removeDuplicateStudents(
  students: Partial<ExpectedStudentType>[],
): {
  uniqueStudents: Partial<ExpectedStudentType>[];
  duplicatesRemoved: number;
  duplicateRegNumbers: string[];
} {
  const seen = new Set<string>();
  const uniqueStudents: Partial<ExpectedStudentType>[] = [];
  const duplicateRegNumbers: string[] = [];
  let duplicatesRemoved = 0;

  for (const student of students) {
    if (!student.regNumber) {
      // Keep students without reg numbers for now (they'll be filtered later)
      uniqueStudents.push(student);
      continue;
    }

    const normalizedRegNumber = normalizeRegistrationNumber(student.regNumber);

    if (seen.has(normalizedRegNumber)) {
      duplicatesRemoved++;
      if (!duplicateRegNumbers.includes(normalizedRegNumber)) {
        duplicateRegNumbers.push(normalizedRegNumber);
      }
    } else {
      seen.add(normalizedRegNumber);
      uniqueStudents.push({
        ...student,
        regNumber: normalizedRegNumber,
      });
    }
  }

  return {
    uniqueStudents,
    duplicatesRemoved,
    duplicateRegNumbers,
  };
}

/**
 * Normalize a complete student record
 */
export function normalizeStudentRecord(
  student: any,
  fieldMappings: Record<string, string>,
): Partial<ExpectedStudentType> {
  const normalized: Partial<ExpectedStudentType> = {};

  // Extract and normalize each field based on mappings
  for (const [originalField, standardField] of Object.entries(fieldMappings)) {
    const value = student[originalField];

    if (value === null || value === undefined) {
      continue;
    }

    switch (standardField) {
      case 'name':
        normalized.name = normalizeName(String(value));
        break;

      case 'gender':
        normalized.gender = normalizeGender(String(value));
        break;

      case 'regNumber':
        normalized.regNumber = normalizeRegistrationNumber(String(value));
        break;
    }
  }

  return normalized;
}

/**
 * Clean and normalize an array of student records
 */
export function cleanAndNormalizeStudents(
  rawStudents: any[],
  fieldMappings: Record<string, string>,
): {
  normalizedStudents: Partial<ExpectedStudentType>[];
  cleaningStats: {
    originalCount: number;
    emptyRowsRemoved: number;
    duplicatesRemoved: number;
    finalCount: number;
    duplicateRegNumbers: string[];
  };
  corrections: string[];
} {
  const corrections: string[] = [];
  const originalCount = rawStudents.length;

  // Step 1: Remove empty rows
  const nonEmptyStudents = removeEmptyRows(rawStudents);
  const emptyRowsRemoved = originalCount - nonEmptyStudents.length;

  if (emptyRowsRemoved > 0) {
    corrections.push(
      `Removed ${emptyRowsRemoved} empty row${emptyRowsRemoved > 1 ? 's' : ''}`,
    );
  }

  // Step 2: Normalize each student record
  const normalizedStudents = nonEmptyStudents.map((student) =>
    normalizeStudentRecord(student, fieldMappings),
  );

  // Track normalization corrections
  let nameCorrections = 0;
  let genderCorrections = 0;
  let regNumberCorrections = 0;

  for (let i = 0; i < nonEmptyStudents.length; i++) {
    const original = nonEmptyStudents[i];
    const normalized = normalizedStudents[i];

    // Check for name corrections
    const originalName =
      original[
        Object.keys(fieldMappings).find((k) => fieldMappings[k] === 'name') ||
          ''
      ];
    if (originalName && normalized.name && originalName !== normalized.name) {
      nameCorrections++;
    }

    // Check for gender corrections
    const originalGender =
      original[
        Object.keys(fieldMappings).find((k) => fieldMappings[k] === 'gender') ||
          ''
      ];
    if (
      originalGender &&
      normalized.gender &&
      originalGender !== normalized.gender
    ) {
      genderCorrections++;
    }

    // Check for registration number corrections
    const originalRegNumber =
      original[
        Object.keys(fieldMappings).find(
          (k) => fieldMappings[k] === 'regNumber',
        ) || ''
      ];
    if (
      originalRegNumber &&
      normalized.regNumber &&
      originalRegNumber !== normalized.regNumber
    ) {
      regNumberCorrections++;
    }
  }

  if (nameCorrections > 0) {
    corrections.push(
      `Normalized ${nameCorrections} name${nameCorrections > 1 ? 's' : ''} to proper case`,
    );
  }
  if (genderCorrections > 0) {
    corrections.push(
      `Corrected ${genderCorrections} gender value${genderCorrections > 1 ? 's' : ''}`,
    );
  }
  if (regNumberCorrections > 0) {
    corrections.push(
      `Cleaned ${regNumberCorrections} registration number${regNumberCorrections > 1 ? 's' : ''}`,
    );
  }

  // Step 3: Remove duplicates
  const { uniqueStudents, duplicatesRemoved, duplicateRegNumbers } =
    removeDuplicateStudents(normalizedStudents);

  if (duplicatesRemoved > 0) {
    corrections.push(
      `Removed ${duplicatesRemoved} duplicate student${duplicatesRemoved > 1 ? 's' : ''}`,
    );
  }

  return {
    normalizedStudents: uniqueStudents,
    cleaningStats: {
      originalCount,
      emptyRowsRemoved,
      duplicatesRemoved,
      finalCount: uniqueStudents.length,
      duplicateRegNumbers,
    },
    corrections,
  };
}

/**
 * Validate that a normalized student record has all required fields
 */
export function validateNormalizedStudent(
  student: Partial<ExpectedStudentType>,
): {
  isValid: boolean;
  missingFields: string[];
  invalidFields: string[];
} {
  const missingFields: string[] = [];
  const invalidFields: string[] = [];

  // Check required fields
  if (!student.name || student.name.trim() === '') {
    missingFields.push('name');
  }

  if (
    !student.gender ||
    (student.gender !== 'Male' && student.gender !== 'Female')
  ) {
    if (!student.gender) {
      missingFields.push('gender');
    } else {
      invalidFields.push('gender');
    }
  }

  if (!student.regNumber || student.regNumber.trim() === '') {
    missingFields.push('regNumber');
  } else if (
    !student.regNumber.startsWith('202') ||
    student.regNumber.length < 8
  ) {
    invalidFields.push('regNumber');
  }

  return {
    isValid: missingFields.length === 0 && invalidFields.length === 0,
    missingFields,
    invalidFields,
  };
}

/**
 * Filter out invalid students and return validation results
 */
export function filterValidStudents(students: Partial<ExpectedStudentType>[]): {
  validStudents: ExpectedStudentType[];
  invalidStudents: Array<{
    student: Partial<ExpectedStudentType>;
    issues: string[];
  }>;
  validationStats: {
    totalCount: number;
    validCount: number;
    invalidCount: number;
  };
} {
  const validStudents: ExpectedStudentType[] = [];
  const invalidStudents: Array<{
    student: Partial<ExpectedStudentType>;
    issues: string[];
  }> = [];

  for (const student of students) {
    const validation = validateNormalizedStudent(student);

    if (validation.isValid) {
      validStudents.push(student as ExpectedStudentType);
    } else {
      const issues = [
        ...validation.missingFields.map((field) => `Missing ${field}`),
        ...validation.invalidFields.map((field) => `Invalid ${field}`),
      ];
      invalidStudents.push({ student, issues });
    }
  }

  return {
    validStudents,
    invalidStudents,
    validationStats: {
      totalCount: students.length,
      validCount: validStudents.length,
      invalidCount: invalidStudents.length,
    },
  };
}
