/**
 * Builds a structured prompt for Gemini AI to repair malformed CSV files
 * containing student data for ClassSync application
 */
export const buildGeminiCsvFixPrompt = (rawCsv: string): string => {
  return `You are an AI assistant helping to repair malformed CSV files containing student data for a class management system. Your task is to analyze the provided CSV content and return a properly formatted JSON response with cleaned and standardized student data.

## TASK DEFINITION

A lecturer has uploaded a CSV file containing student information, but it failed to parse correctly due to formatting issues, incorrect headers, or data inconsistencies. You need to:

1. **Detect and map headers** to the required standard format
2. **Normalize and clean data entries** to ensure consistency
3. **Infer missing gender information** when possible and confident
4. **Remove duplicates and invalid entries**
5. **Return structured JSON** with the repaired data

## REQUIRED OUTPUT SCHEMA

You must return ONLY a valid JSON object with this exact structure:

\`\`\`json
{
  "students": [
    {
      "name": "John Doe",
      "gender": "Male",
      "regNumber": "202312345"
    }
  ],
  "summary": "Brief description of changes made",
  "issues": ["List of specific issues that were fixed"],
  "confidence": 0.85,
  "headerMappings": {
    "original_header": "mapped_header"
  }
}
\`\`\`

## HEADER MAPPING RULES

Map these common header variations to the standard format:

**For "name" field:**
- "Full Name", "Student Name", "Name", "Student Full Name", "Full_Name", "student_name"
- "FULL NAME", "STUDENT NAME", "NAME" (case variations)
- "Surname and Other Names", "Last Name, First Name"

**For "gender" field:**
- "Sex", "Gender", "Gndr", "M/F", "Male/Female"
- "SEX", "GENDER" (case variations)
- "Student Gender", "Student_Gender"

**For "regNumber" field:**
- "Matric No", "Matriculation Number", "Reg No", "Registration Number"
- "Student ID", "ID Number", "Matric_No", "Registration_Number"
- "MATRIC NO", "REG NO" (case variations)
- "Student Registration Number", "Matriculation No"

## DATA NORMALIZATION RULES

**Name Normalization:**
- Convert to proper case: "john doe" → "John Doe"
- Handle multiple spaces: "John  Doe" → "John Doe"
- Preserve hyphens and apostrophes: "Mary-Jane O'Connor"
- Remove leading/trailing whitespace
- Handle common prefixes: "Mr. John Doe" → "John Doe"

**Gender Correction:**
- Standardize to exactly "Male" or "Female" (capitalized)
- Fix common typos: "femlae" → "Female", "mae" → "Male"
- Handle variations: "M" → "Male", "F" → "Female"
- "MALE" → "Male", "female" → "Female"
- "man" → "Male", "woman" → "Female"

**Registration Number Cleaning:**
- Remove spaces and special characters except numbers
- Ensure it starts with "202" (current format requirement)
- Pad with zeros if needed: "2023123" → "202312300"
- Remove prefixes like "REG:", "NO:", "ID:"

## GENDER INFERENCE GUIDELINES

When gender is missing or unclear:

1. **Use name-based inference** only if confidence is 80% or higher
2. **Common male names**: John, Michael, David, James, Robert, William, etc.
3. **Common female names**: Mary, Patricia, Jennifer, Linda, Elizabeth, Barbara, etc.
4. **Mark inferred genders** in the issues list
5. **Leave blank** if confidence is below 80%

## DATA QUALITY RULES

1. **Remove duplicate entries** based on registration number
2. **Exclude invalid entries** that cannot be repaired
3. **Validate registration numbers** must start with "202" and be 8-15 digits
4. **Ensure names** contain only letters, spaces, hyphens, apostrophes
5. **Report excluded entries** in the issues list

## CONFIDENCE SCORING

Calculate confidence based on:
- **Header mapping clarity** (0.3 weight)
- **Data quality after cleaning** (0.4 weight)
- **Number of inferences made** (0.3 weight)

Return confidence as decimal between 0.0 and 1.0.

## EXAMPLE TRANSFORMATIONS

**Input CSV:**
\`\`\`
Full Name,Sex,Matric No
john doe,male,202312345
Mary Stone,,202312999
TUNDE BELLO,Femlae,202213456
\`\`\`

**Expected Output:**
\`\`\`json
{
  "students": [
    {"name": "John Doe", "gender": "Male", "regNumber": "202312345"},
    {"name": "Mary Stone", "gender": "Female", "regNumber": "202312999"},
    {"name": "Tunde Bello", "gender": "Female", "regNumber": "202213456"}
  ],
  "summary": "Processed 3 students. Fixed header mappings, normalized names and gender values, inferred 1 gender.",
  "issues": [
    "Mapped 'Full Name' to 'name'",
    "Mapped 'Sex' to 'gender'", 
    "Mapped 'Matric No' to 'regNumber'",
    "Normalized 'john doe' to 'John Doe'",
    "Corrected 'Femlae' to 'Female'",
    "Inferred gender 'Female' for Mary Stone based on name"
  ],
  "confidence": 0.92,
  "headerMappings": {
    "Full Name": "name",
    "Sex": "gender",
    "Matric No": "regNumber"
  }
}
\`\`\`

## IMPORTANT CONSTRAINTS

1. **Return ONLY valid JSON** - no additional text or explanations
2. **All students must have** name, gender, and regNumber fields
3. **Gender must be exactly** "Male" or "Female" (capitalized)
4. **Registration numbers must start with "202"**
5. **Maximum 500 students** can be processed
6. **If repair is impossible**, return confidence below 0.5 and explain in issues

## ERROR HANDLING

If the CSV cannot be repaired:
- Set confidence to 0.0
- Explain the problem in the "issues" array
- Return empty "students" array
- Provide helpful suggestions in "summary"

---

## CSV DATA TO PROCESS:

${rawCsv}

---

Remember: Return ONLY the JSON object with the repaired data. Do not include any other text, explanations, or formatting.`;
};

/**
 * Builds a simplified prompt for testing purposes with minimal CSV data
 */
export const buildTestPrompt = (csvData: string): string => {
  return `Fix this CSV data and return JSON with students array:

${csvData}

Return format:
{
  "students": [{"name": "Name", "gender": "Male|Female", "regNumber": "202XXXXX"}],
  "summary": "Changes made",
  "confidence": 0.8
}`;
};

/**
 * Validates that a CSV string is not too large for processing
 */
export const validateCsvSize = (
  csvContent: string,
): {
  valid: boolean;
  error?: string;
  stats: {
    size: number;
    lines: number;
    estimatedStudents: number;
  };
} => {
  const size = csvContent.length;
  const lines = csvContent.split('\n').length;
  const estimatedStudents = Math.max(0, lines - 1); // Subtract header row

  // Check file size (1MB limit)
  if (size > 1024 * 1024) {
    return {
      valid: false,
      error: 'CSV file is too large. Maximum size is 1MB.',
      stats: { size, lines, estimatedStudents },
    };
  }

  // Check estimated student count
  if (estimatedStudents > 500) {
    return {
      valid: false,
      error: 'Too many students. Maximum is 500 students per upload.',
      stats: { size, lines, estimatedStudents },
    };
  }

  // Check for minimum content
  if (size < 10) {
    return {
      valid: false,
      error: 'CSV file appears to be empty or too small.',
      stats: { size, lines, estimatedStudents },
    };
  }

  return {
    valid: true,
    stats: { size, lines, estimatedStudents },
  };
};

/**
 * Sanitizes CSV content before sending to AI to remove potential security issues
 */
export const sanitizeCsvContent = (csvContent: string): string => {
  // Remove any potential script tags or HTML content
  let sanitized = csvContent.replace(/<[^>]*>/g, '');

  // Remove excessive whitespace but preserve CSV structure
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Limit line length to prevent extremely long lines
  const lines = sanitized
    .split('\n')
    .map((line) =>
      line.length > 1000 ? line.substring(0, 1000) + '...' : line,
    );

  return lines.join('\n');
};

/**
 * Extracts basic information about the CSV structure for logging
 */
export const analyzeCsvStructure = (
  csvContent: string,
): {
  headerRow?: string;
  sampleRows: string[];
  columnCount: number;
  rowCount: number;
  hasHeaders: boolean;
} => {
  const lines = csvContent.trim().split('\n');
  const headerRow = lines[0];
  const sampleRows = lines.slice(1, 4); // First 3 data rows

  // Estimate column count from header row
  const columnCount = headerRow ? headerRow.split(',').length : 0;
  const rowCount = lines.length;

  // Simple heuristic to detect if first row contains headers
  const hasHeaders = headerRow
    ? /^[a-zA-Z\s,]+$/.test(headerRow) && !headerRow.includes('202')
    : false;

  return {
    headerRow: headerRow || undefined,
    sampleRows,
    columnCount,
    rowCount,
    hasHeaders,
  };
};
