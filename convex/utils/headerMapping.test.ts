// /**
//  * Unit tests for header mapping functionality
//  */

// import { describe, it, expect } from 'vitest';
// import {
//   calculateStringSimilarity,
//   findBestHeaderMatch,
//   mapHeaders,
//   validateRequiredFieldsMapped,
//   generateHeaderMappingDescription,
//   createFieldMappingObject,
//   detectHeaderRow,
//   handleUnmappedHeaders,
//   HEADER_VARIATIONS,
// } from './headerMapping';

// describe('Header Mapping Functionality', () => {
//   describe('calculateStringSimilarity', () => {
//     it('should return 1.0 for identical strings', () => {
//       expect(calculateStringSimilarity('name', 'name')).toBe(1.0);
//       expect(calculateStringSimilarity('Full Name', 'Full Name')).toBe(1.0);
//     });

//     it('should return 1.0 for case-insensitive identical strings', () => {
//       expect(calculateStringSimilarity('NAME', 'name')).toBe(1.0);
//       expect(calculateStringSimilarity('Full Name', 'FULL NAME')).toBe(1.0);
//     });

//     it('should return high similarity for similar strings', () => {
//       const similarity = calculateStringSimilarity('name', 'names');
//       expect(similarity).toBeGreaterThan(0.8);
//       expect(similarity).toBeLessThan(1.0);
//     });

//     it('should return low similarity for different strings', () => {
//       const similarity = calculateStringSimilarity('name', 'gender');
//       expect(similarity).toBeLessThan(0.5);
//     });

//     it('should handle empty strings', () => {
//       expect(calculateStringSimilarity('', '')).toBe(1.0);
//       expect(calculateStringSimilarity('name', '')).toBeLessThan(0.5);
//     });
//   });

//   describe('findBestHeaderMatch', () => {
//     it('should find exact matches with 1.0 confidence', () => {
//       const result = findBestHeaderMatch('name');
//       expect(result).toEqual({ field: 'name', confidence: 1.0 });

//       const result2 = findBestHeaderMatch('gender');
//       expect(result2).toEqual({ field: 'gender', confidence: 1.0 });
//     });

//     it('should find case-insensitive matches', () => {
//       const result = findBestHeaderMatch('NAME');
//       expect(result).toEqual({ field: 'name', confidence: 1.0 });

//       const result2 = findBestHeaderMatch('GENDER');
//       expect(result2).toEqual({ field: 'gender', confidence: 1.0 });
//     });

//     it('should find common variations', () => {
//       const result = findBestHeaderMatch('Full Name');
//       expect(result?.field).toBe('name');
//       expect(result?.confidence).toBe(1.0);

//       const result2 = findBestHeaderMatch('Sex');
//       expect(result2?.field).toBe('gender');
//       expect(result2?.confidence).toBe(1.0);

//       const result3 = findBestHeaderMatch('Matric No');
//       expect(result3?.field).toBe('regNumber');
//       expect(result3?.confidence).toBe(1.0);
//     });

//     it('should find fuzzy matches above threshold', () => {
//       const result = findBestHeaderMatch('Student Name');
//       expect(result?.field).toBe('name');
//       expect(result?.confidence).toBe(1.0);

//       const result2 = findBestHeaderMatch('Registration Number');
//       expect(result2?.field).toBe('regNumber');
//       expect(result2?.confidence).toBe(1.0);
//     });

//     it('should return null for unmatched headers below threshold', () => {
//       const result = findBestHeaderMatch('unknown_field');
//       expect(result).toBeNull();

//       const result2 = findBestHeaderMatch('xyz');
//       expect(result2).toBeNull();
//     });

//     it('should respect confidence threshold', () => {
//       const result = findBestHeaderMatch('nam', 0.9); // High threshold
//       expect(result).toBeNull();

//       const result2 = findBestHeaderMatch('nam', 0.5); // Lower threshold
//       expect(result?.field).toBe('name');
//     });
//   });

//   describe('mapHeaders', () => {
//     it('should map standard headers correctly', () => {
//       const headers = ['Name', 'Gender', 'Registration Number'];
//       const result = mapHeaders(headers);

//       expect(result.mappings).toHaveLength(3);
//       expect(result.unmappedHeaders).toHaveLength(0);
//       expect(result.duplicateFields).toHaveLength(0);

//       expect(result.mappings[0]).toEqual({
//         detected: 'Name',
//         mapped: 'name',
//         confidence: 1.0,
//       });
//     });

//     it('should map common variations', () => {
//       const headers = ['Full Name', 'Sex', 'Matric No'];
//       const result = mapHeaders(headers);

//       expect(result.mappings).toHaveLength(3);
//       expect(result.unmappedHeaders).toHaveLength(0);

//       const nameMapping = result.mappings.find((m) => m.mapped === 'name');
//       expect(nameMapping?.detected).toBe('Full Name');
//       expect(nameMapping?.confidence).toBe(1.0);
//     });

//     it('should handle unmapped headers', () => {
//       const headers = ['Name', 'Unknown Field', 'Gender'];
//       const result = mapHeaders(headers);

//       expect(result.mappings).toHaveLength(2);
//       expect(result.unmappedHeaders).toEqual(['Unknown Field']);
//       expect(result.duplicateFields).toHaveLength(0);
//     });

//     it('should detect duplicate field mappings', () => {
//       const headers = ['Name', 'Full Name', 'Gender'];
//       const result = mapHeaders(headers);

//       expect(result.mappings).toHaveLength(2); // Only first mapping kept
//       expect(result.duplicateFields).toContain('name');
//     });

//     it('should handle case variations', () => {
//       const headers = ['FULL NAME', 'SEX', 'REG NUMBER'];
//       const result = mapHeaders(headers);

//       expect(result.mappings).toHaveLength(3);
//       expect(result.unmappedHeaders).toHaveLength(0);

//       const mappedFields = result.mappings.map((m) => m.mapped);
//       expect(mappedFields).toContain('name');
//       expect(mappedFields).toContain('gender');
//       expect(mappedFields).toContain('regNumber');
//     });
//   });

//   describe('validateRequiredFieldsMapped', () => {
//     it('should validate when all required fields are mapped', () => {
//       const mappings = [
//         { detected: 'Name', mapped: 'name', confidence: 1.0 },
//         { detected: 'Gender', mapped: 'gender', confidence: 1.0 },
//         { detected: 'Reg No', mapped: 'regNumber', confidence: 1.0 },
//       ];

//       const result = validateRequiredFieldsMapped(mappings);
//       expect(result.isValid).toBe(true);
//       expect(result.missingFields).toHaveLength(0);
//     });

//     it('should identify missing required fields', () => {
//       const mappings = [
//         { detected: 'Name', mapped: 'name', confidence: 1.0 },
//         { detected: 'Gender', mapped: 'gender', confidence: 1.0 },
//       ];

//       const result = validateRequiredFieldsMapped(mappings);
//       expect(result.isValid).toBe(false);
//       expect(result.missingFields).toContain('regNumber');
//     });

//     it('should handle empty mappings', () => {
//       const result = validateRequiredFieldsMapped([]);
//       expect(result.isValid).toBe(false);
//       expect(result.missingFields).toEqual(['name', 'gender', 'regNumber']);
//     });
//   });

//   describe('generateHeaderMappingDescription', () => {
//     it('should generate descriptions for perfect matches', () => {
//       const mappings = [
//         { detected: 'Name', mapped: 'name', confidence: 1.0 },
//         { detected: 'Gender', mapped: 'gender', confidence: 1.0 },
//       ];

//       const descriptions = generateHeaderMappingDescription(mappings);
//       expect(descriptions).toEqual([
//         "Mapped 'Name' to 'name'",
//         "Mapped 'Gender' to 'gender'",
//       ]);
//     });

//     it('should include confidence for fuzzy matches', () => {
//       const mappings = [
//         { detected: 'Student Name', mapped: 'name', confidence: 0.85 },
//       ];

//       const descriptions = generateHeaderMappingDescription(mappings);
//       expect(descriptions[0]).toBe(
//         "Mapped 'Student Name' to 'name' (85% confidence)",
//       );
//     });
//   });

//   describe('createFieldMappingObject', () => {
//     it('should create mapping object for easy access', () => {
//       const mappings = [
//         { detected: 'Full Name', mapped: 'name', confidence: 1.0 },
//         { detected: 'Sex', mapped: 'gender', confidence: 1.0 },
//         { detected: 'Matric No', mapped: 'regNumber', confidence: 1.0 },
//       ];

//       const mappingObject = createFieldMappingObject(mappings);
//       expect(mappingObject).toEqual({
//         'Full Name': 'name',
//         Sex: 'gender',
//         'Matric No': 'regNumber',
//       });
//     });
//   });

//   describe('detectHeaderRow', () => {
//     it('should detect header row with high confidence', () => {
//       const csvLines = [
//         'Name,Gender,Registration Number',
//         'John Doe,Male,202312345',
//         'Jane Smith,Female,202312346',
//       ];

//       const result = detectHeaderRow(csvLines);
//       expect(result.headerRowIndex).toBe(0);
//       expect(result.confidence).toBeGreaterThan(0.6);
//       expect(result.detectedHeaders).toEqual([
//         'Name',
//         'Gender',
//         'Registration Number',
//       ]);
//     });

//     it('should detect header row when not first line', () => {
//       const csvLines = [
//         'Some metadata line',
//         'Name,Gender,Registration Number',
//         'John Doe,Male,202312345',
//       ];

//       const result = detectHeaderRow(csvLines);
//       expect(result.headerRowIndex).toBe(1);
//       expect(result.confidence).toBeGreaterThan(0.6);
//     });

//     it('should handle CSV with registration numbers in header detection', () => {
//       const csvLines = [
//         'John Doe,Male,202312345',
//         'Jane Smith,Female,202312346',
//       ];

//       const result = detectHeaderRow(csvLines);
//       expect(result.confidence).toBeLessThan(0.6); // Should have low confidence
//     });

//     it('should handle empty CSV', () => {
//       const result = detectHeaderRow([]);
//       expect(result.headerRowIndex).toBe(-1);
//       expect(result.confidence).toBe(0);
//       expect(result.detectedHeaders).toEqual([]);
//     });
//   });

//   describe('handleUnmappedHeaders', () => {
//     it('should provide suggestions for unmapped headers', () => {
//       const unmappedHeaders = ['Student_Name', 'M/F', 'ID_Number'];
//       const csvLines = ['Student_Name,M/F,ID_Number', 'John,M,123'];

//       const result = handleUnmappedHeaders(unmappedHeaders, csvLines);

//       expect(result.suggestions.length).toBeGreaterThan(0);
//       expect(result.possibleMappings.length).toBeGreaterThan(0);

//       // Should suggest name mapping for Student_Name
//       const nameMapping = result.possibleMappings.find(
//         (m) => m.header === 'Student_Name',
//       );
//       expect(nameMapping?.suggestions.some((s) => s.field === 'name')).toBe(
//         true,
//       );
//     });

//     it('should handle empty unmapped headers', () => {
//       const result = handleUnmappedHeaders([], []);
//       expect(result.suggestions).toHaveLength(0);
//       expect(result.possibleMappings).toHaveLength(0);
//     });
//   });

//   describe('HEADER_VARIATIONS coverage', () => {
//     it('should include comprehensive name variations', () => {
//       const nameVariations = HEADER_VARIATIONS.name;
//       expect(nameVariations).toContain('name');
//       expect(nameVariations).toContain('full name');
//       expect(nameVariations).toContain('student name');
//       expect(nameVariations).toContain('NAME');
//       expect(nameVariations).toContain('FULL NAME');
//     });

//     it('should include comprehensive gender variations', () => {
//       const genderVariations = HEADER_VARIATIONS.gender;
//       expect(genderVariations).toContain('gender');
//       expect(genderVariations).toContain('sex');
//       expect(genderVariations).toContain('gndr');
//       expect(genderVariations).toContain('m/f');
//       expect(genderVariations).toContain('GENDER');
//     });

//     it('should include comprehensive registration number variations', () => {
//       const regNumberVariations = HEADER_VARIATIONS.regNumber;
//       expect(regNumberVariations).toContain('reg number');
//       expect(regNumberVariations).toContain('registration number');
//       expect(regNumberVariations).toContain('matric no');
//       expect(regNumberVariations).toContain('student id');
//       expect(regNumberVariations).toContain('REG NUMBER');
//     });
//   });
// });
