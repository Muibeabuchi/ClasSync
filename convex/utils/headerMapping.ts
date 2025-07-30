/**
 * Header mapping functionality for AI CSV repair
 *
 * This module provides fuzzy matching and mapping of CSV headers to the expected
 * student data schema format. It handles common variations and typos in header names.
 *
 * Requirements covered:
 * - 2.1: Map non-standard headers like "Full Name", "Student Name" to "name"
 * - 2.2: Map headers like "Sex", "Gender", "Gndr" to "gender"
 * - 2.4: Map headers like "Matric No", "Reg No", "Student ID" to "regNumber"
 * - 6.3: Document all header mappings in repair summary
 */

import { HeaderMapping } from '../schemas/aiFixCsvTypes';

/**
 * Standard field names that we expect in the final schema
 */
export const STANDARD_FIELDS = {
  name: 'name',
  gender: 'gender',
  regNumber: 'regNumber',
} as const;

/**
 * Comprehensive mapping of common header variations to standard fields
 */
export const HEADER_VARIATIONS = {
  name: [
    // Common variations
    'name',
    'full name',
    'student name',
    'student full name',
    'fullname',
    'studentname',
    'full_name',
    'student_name',

    // Case variations
    'NAME',
    'FULL NAME',
    'STUDENT NAME',
    'FULL_NAME',
    'STUDENT_NAME',
    'Name',
    'Full Name',
    'Student Name',
    'Full_Name',
    'Student_Name',

    // Alternative formats
    'surname and other names',
    'last name, first name',
    'first name last name',
    'student full name',
    'complete name',
    'full student name',

    // With spaces and underscores
    'full  name',
    'student  name',
    'name of student',
    'student_full_name',

    // International variations
    'nom complet',
    'nombre completo',
    'nome completo', // French, Spanish, Portuguese
  ],

  gender: [
    // Common variations
    'gender',
    'sex',
    'gndr',
    'm/f',
    'male/female',

    // Case variations
    'GENDER',
    'SEX',
    'GNDR',
    'M/F',
    'MALE/FEMALE',
    'Gender',
    'Sex',
    'Gndr',
    'M/F',
    'Male/Female',

    // With descriptors
    'student gender',
    'student sex',
    'student_gender',
    'student_sex',
    'gender of student',
    'sex of student',

    // Alternative formats
    'male or female',
    'boy or girl',
    'man or woman',
    'gender identity',
    'biological sex',

    // Abbreviated forms
    'gnd',
    'sx',
    'g',
    's',
  ],

  regNumber: [
    // Common variations
    'reg number',
    'registration number',
    'matric no',
    'matriculation number',
    'student id',
    'id number',
    'student number',
    'admission number',

    // Case variations
    'REG NUMBER',
    'REGISTRATION NUMBER',
    'MATRIC NO',
    'MATRICULATION NUMBER',
    'STUDENT ID',
    'ID NUMBER',
    'STUDENT NUMBER',
    'ADMISSION NUMBER',
    'Reg Number',
    'Registration Number',
    'Matric No',
    'Matriculation Number',
    'Student ID',
    'Id Number',
    'Student Number',
    'Admission Number',

    // With underscores and abbreviations
    'reg_number',
    'registration_number',
    'matric_no',
    'matriculation_number',
    'student_id',
    'id_number',
    'student_number',
    'admission_number',
    'reg no',
    'matric number',
    'registration no',
    'student reg number',

    // Alternative formats
    'registration id',
    'matriculation id',
    'student registration number',
    'student matriculation number',
    'university id',
    'school id',
    'enrollment number',
    'roll number',
    'index number',

    // Abbreviated forms
    'regno',
    'matno',
    'stdid',
    'regnum',
    'matnum',
  ],
};

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1, where 1 is identical
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLength;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Find the best matching standard field for a given header
 */
export function findBestHeaderMatch(
  header: string,
  confidenceThreshold: number = 0.6,
): { field: keyof typeof STANDARD_FIELDS; confidence: number } | null {
  const cleanHeader = header.toLowerCase().trim();
  let bestMatch: {
    field: keyof typeof STANDARD_FIELDS;
    confidence: number;
  } | null = null;

  // Check each standard field
  for (const [standardField, variations] of Object.entries(HEADER_VARIATIONS)) {
    const fieldKey = standardField as keyof typeof STANDARD_FIELDS;

    // Check for exact matches first
    if (
      variations.some((variation) => variation.toLowerCase() === cleanHeader)
    ) {
      return { field: fieldKey, confidence: 1.0 };
    }

    // Check for fuzzy matches
    for (const variation of variations) {
      const similarity = calculateStringSimilarity(cleanHeader, variation);

      if (
        similarity >= confidenceThreshold &&
        (!bestMatch || similarity > bestMatch.confidence)
      ) {
        bestMatch = { field: fieldKey, confidence: similarity };
      }
    }
  }

  return bestMatch;
}

/**
 * Map an array of headers to standard field names
 */
export function mapHeaders(
  headers: string[],
  confidenceThreshold: number = 0.6,
): {
  mappings: HeaderMapping[];
  unmappedHeaders: string[];
  duplicateFields: string[];
} {
  const mappings: HeaderMapping[] = [];
  const unmappedHeaders: string[] = [];
  const duplicateFields: string[] = [];
  const mappedFields = new Set<string>();

  for (const header of headers) {
    const match = findBestHeaderMatch(header, confidenceThreshold);

    if (match) {
      // Check for duplicate mappings
      if (mappedFields.has(match.field)) {
        duplicateFields.push(match.field);
      } else {
        mappedFields.add(match.field);
        mappings.push({
          detected: header,
          mapped: match.field,
          confidence: match.confidence,
        });
      }
    } else {
      unmappedHeaders.push(header);
    }
  }

  return { mappings, unmappedHeaders, duplicateFields };
}

/**
 * Validate that all required fields are mapped
 */
export function validateRequiredFieldsMapped(mappings: HeaderMapping[]): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields = Object.keys(STANDARD_FIELDS);
  const mappedFields = mappings.map((m) => m.mapped);
  const missingFields = requiredFields.filter(
    (field) => !mappedFields.includes(field),
  );

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Generate human-readable description of header mappings
 */
export function generateHeaderMappingDescription(
  mappings: HeaderMapping[],
): string[] {
  return mappings.map((mapping) => {
    const confidencePercent = Math.round(mapping.confidence * 100);
    if (mapping.confidence === 1.0) {
      return `Mapped '${mapping.detected}' to '${mapping.mapped}'`;
    } else {
      return `Mapped '${mapping.detected}' to '${mapping.mapped}' (${confidencePercent}% confidence)`;
    }
  });
}

/**
 * Create a mapping object for easy field access
 */
export function createFieldMappingObject(
  mappings: HeaderMapping[],
): Record<string, string> {
  const mappingObject: Record<string, string> = {};

  for (const mapping of mappings) {
    mappingObject[mapping.detected] = mapping.mapped;
  }

  return mappingObject;
}

/**
 * Detect potential header row in CSV content
 */
export function detectHeaderRow(csvLines: string[]): {
  headerRowIndex: number;
  confidence: number;
  detectedHeaders: string[];
} {
  if (csvLines.length === 0) {
    return { headerRowIndex: -1, confidence: 0, detectedHeaders: [] };
  }

  // Check first few rows for header-like content
  for (let i = 0; i < Math.min(3, csvLines.length); i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const cells = line
      .split(',')
      .map((cell) => cell.trim().replace(/['"]/g, ''));

    // Calculate header confidence based on:
    // 1. Contains mostly text (not numbers)
    // 2. Matches known header patterns
    // 3. Doesn't contain registration numbers (202XXXXX pattern)

    let textCells = 0;
    let matchingHeaders = 0;
    let hasRegNumbers = false;

    for (const cell of cells) {
      // Check if cell looks like text (not purely numeric)
      if (!/^\d+$/.test(cell)) {
        textCells++;
      }

      // Check if cell matches known header patterns
      if (findBestHeaderMatch(cell, 0.5)) {
        matchingHeaders++;
      }

      // Check if cell looks like a registration number
      if (/^202\d{5,}$/.test(cell)) {
        hasRegNumbers = true;
      }
    }

    const textRatio = textCells / cells.length;
    const matchRatio = matchingHeaders / cells.length;

    // Calculate confidence score
    let confidence = 0;
    if (textRatio > 0.5) confidence += 0.4;
    if (matchRatio > 0.3) confidence += 0.4;
    if (!hasRegNumbers) confidence += 0.2;

    // First row gets bonus points
    if (i === 0) confidence += 0.1;

    if (confidence > 0.6) {
      return {
        headerRowIndex: i,
        confidence,
        detectedHeaders: cells,
      };
    }
  }

  // Default to first row if no clear header detected
  const firstRowCells = csvLines[0]
    .split(',')
    .map((cell) => cell.trim().replace(/['"]/g, ''));
  return {
    headerRowIndex: 0,
    confidence: 0.3,
    detectedHeaders: firstRowCells,
  };
}

/**
 * Handle cases where headers cannot be confidently mapped
 */
export function handleUnmappedHeaders(unmappedHeaders: string[]): {
  suggestions: string[];
  possibleMappings: Array<{
    header: string;
    suggestions: Array<{ field: string; reason: string }>;
  }>;
} {
  const suggestions: string[] = [];
  const possibleMappings: Array<{
    header: string;
    suggestions: Array<{ field: string; reason: string }>;
  }> = [];

  if (unmappedHeaders.length > 0) {
    suggestions.push(
      `Could not map ${unmappedHeaders.length} header${unmappedHeaders.length > 1 ? 's' : ''}: ${unmappedHeaders.join(', ')}`,
    );

    // Analyze unmapped headers and provide suggestions
    for (const header of unmappedHeaders) {
      const headerSuggestions: Array<{ field: string; reason: string }> = [];

      // Check if it might be a name field
      if (
        header.toLowerCase().includes('name') ||
        header.toLowerCase().includes('student')
      ) {
        headerSuggestions.push({
          field: 'name',
          reason: 'Contains "name" or "student" keywords',
        });
      }

      // Check if it might be a gender field
      if (
        header.toLowerCase().includes('gender') ||
        header.toLowerCase().includes('sex') ||
        header.length <= 3
      ) {
        headerSuggestions.push({
          field: 'gender',
          reason: 'Contains gender-related keywords or is very short',
        });
      }

      // Check if it might be a registration number field
      if (
        header.toLowerCase().includes('id') ||
        header.toLowerCase().includes('number') ||
        header.toLowerCase().includes('reg') ||
        header.toLowerCase().includes('matric')
      ) {
        headerSuggestions.push({
          field: 'regNumber',
          reason: 'Contains ID or number-related keywords',
        });
      }

      if (headerSuggestions.length > 0) {
        possibleMappings.push({
          header,
          suggestions: headerSuggestions,
        });
      }
    }

    suggestions.push(
      'Please ensure your CSV has headers like: Name, Gender, Registration Number',
    );
  }

  return { suggestions, possibleMappings };
}
