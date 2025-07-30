# Requirements Document

## Introduction

This feature introduces an AI-powered CSV repair system for ClassSync that automatically fixes malformed student CSV files uploaded by lecturers. When a lecturer uploads a CSV file that fails parsing or validation due to incorrect headers, formatting issues, or data inconsistencies, the system will offer an "AI Fix CSV" option that uses Gemini AI to automatically repair and standardize the data to match the expected schema.

## Requirements

### Requirement 1

**User Story:** As a lecturer, I want the system to automatically detect and fix common CSV formatting issues, so that I don't have to manually edit my student list files before uploading them.

#### Acceptance Criteria

1. WHEN a lecturer uploads a CSV file that fails parsing THEN the system SHALL display a clear error message indicating the parsing failure
2. WHEN parsing fails THEN the system SHALL show an "⚡ AI Fix CSV" button as a fallback option
3. WHEN the lecturer clicks the AI Fix button THEN the system SHALL send the raw CSV content to a Convex Action for processing
4. WHEN the AI processing completes successfully THEN the system SHALL return a repaired version of the CSV data in the expected format
5. WHEN the AI processing fails THEN the system SHALL display an appropriate error message and fallback options

### Requirement 2

**User Story:** As a lecturer, I want the AI system to intelligently map non-standard headers to the expected format, so that I can use CSV files with different column naming conventions.

#### Acceptance Criteria

1. WHEN the CSV contains headers like "Full Name", "Student Name", or "Name" THEN the system SHALL map them to the standard "name" field
2. WHEN the CSV contains headers like "Sex", "Gender", or "Gndr" THEN the system SHALL map them to the standard "gender" field
3. WHEN the CSV contains headers like "Matric No", "Reg No", "Student ID", or "Registration" THEN the system SHALL map them to the standard "regNumber" field
4. WHEN header mapping occurs THEN the system SHALL document all mappings in the repair summary
5. WHEN headers cannot be confidently mapped THEN the system SHALL report this in the warnings section

### Requirement 3

**User Story:** As a lecturer, I want the AI system to normalize and clean the data entries, so that inconsistent formatting doesn't prevent successful upload.

#### Acceptance Criteria

1. WHEN student names are in incorrect case (e.g., "john doe") THEN the system SHALL convert them to proper case (e.g., "John Doe")
2. WHEN gender values contain typos (e.g., "femlae", "MALE") THEN the system SHALL correct them to standard values ("Female", "Male")
3. WHEN data contains extra whitespace THEN the system SHALL trim all whitespace from entries
4. WHEN duplicate or empty rows exist THEN the system SHALL remove them from the final output

### Requirement 4

**User Story:** As a lecturer, I want the AI system to intelligently infer missing gender information when possible, so that incomplete data doesn't prevent upload.

#### Acceptance Criteria

1. WHEN gender information is missing for a student THEN the system SHALL attempt to infer gender based on the student's first name
2. WHEN gender inference is performed THEN it SHALL only be applied if confidence is 80% or higher
3. WHEN gender is inferred THEN the system SHALL flag this in the warnings section of the response
4. WHEN gender cannot be confidently inferred THEN the system SHALL leave the field empty and report this as a warning
5. WHEN gender inference occurs THEN the system SHALL provide a count of how many students had gender inferred

### Requirement 5

**User Story:** As a lecturer, I want to review the AI-repaired data before final upload, so that I can verify the accuracy of the automated fixes and make any necessary corrections.

#### Acceptance Criteria

1. WHEN AI repair completes successfully THEN the system SHALL display a preview table showing the cleaned data
2. WHEN displaying the preview THEN the system SHALL highlight or flag cells that were modified by the AI
3. WHEN showing the preview THEN the system SHALL display a summary of all changes made (header mappings, data corrections, inferences)
4. WHEN the lecturer reviews the preview THEN they SHALL have the option to confirm and proceed with upload or cancel and try a different file
5. WHEN the lecturer confirms the repaired data THEN the system SHALL proceed with the normal upload process using the cleaned data

### Requirement 6

**User Story:** As a lecturer, I want clear feedback about the AI repair process and its confidence level, so that I can make informed decisions about whether to use the repaired data.

#### Acceptance Criteria

1. WHEN AI repair completes THEN the system SHALL provide a confidence score (0-1) indicating the reliability of the repairs
2. WHEN repairs are made THEN the system SHALL provide a detailed list of issues that were fixed
3. WHEN warnings exist THEN the system SHALL clearly display them with explanations of what couldn't be automatically resolved
4. WHEN the confidence score is low (< 0.7) THEN the system SHALL display additional warnings about the repair quality
5. WHEN displaying repair results THEN the system SHALL show the count of students processed and any that were excluded

### Requirement 7

**User Story:** As a lecturer, I want the system to handle AI repair failures gracefully, so that I have clear alternatives when automatic repair isn't possible.

#### Acceptance Criteria

1. WHEN the AI service is unavailable THEN the system SHALL display an appropriate error message and suggest manual correction
2. WHEN the AI returns invalid or unparseable results THEN the system SHALL fall back to showing the original parsing error
3. WHEN the repair process times out THEN the system SHALL provide a clear timeout message and retry option
4. WHEN repair fails THEN the system SHALL log the failure details for debugging while showing user-friendly error messages
5. WHEN any error occurs THEN the system SHALL always preserve the original uploaded file and allow the lecturer to try again

### Requirement 8

**User Story:** As a system administrator, I want the AI repair process to be secure and not expose sensitive data, so that student information remains protected during processing.

#### Acceptance Criteria

1. WHEN sending data to the AI service THEN the system SHALL not log or store the raw CSV content permanently
2. WHEN AI processing occurs THEN it SHALL happen through secure Convex Actions with proper error handling
3. WHEN repair results are returned THEN they SHALL be validated against the expected schema before being shown to the user
4. WHEN the repair process completes THEN any temporary data SHALL be cleaned up appropriately
5. WHEN errors occur during AI processing THEN sensitive data SHALL not be exposed in error messages or logs
