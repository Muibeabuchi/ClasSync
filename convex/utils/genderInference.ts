/**
 * Gender inference system for AI CSV repair
 *
 * This module provides name-based gender inference functionality with confidence scoring.
 * It uses a comprehensive database of names to infer gender when missing from student data.
 *
 * Requirements covered:
 * - 4.1: Create name-to-gender mapping functionality
 * - 4.2: Set confidence threshold for gender inference (80%+)
 * - 4.3: Track and report gender inferences in warnings
 * - 4.4: Handle cases where gender cannot be confidently inferred
 * - 4.5: Only infer gender with high confidence
 */

/**
 * Comprehensive name-to-gender mapping with confidence scores
 * Based on common names in various cultures and regions
 */
export const NAME_GENDER_DATABASE = {
  // High confidence male names (90%+ confidence)
  male_high: [
    'john',
    'michael',
    'david',
    'james',
    'robert',
    'william',
    'richard',
    'charles',
    'joseph',
    'thomas',
    'christopher',
    'daniel',
    'paul',
    'mark',
    'donald',
    'steven',
    'kenneth',
    'andrew',
    'joshua',
    'kevin',
    'brian',
    'george',
    'edward',
    'ronald',
    'timothy',
    'jason',
    'jeffrey',
    'ryan',
    'jacob',
    'gary',
    'nicholas',
    'eric',
    'jonathan',
    'stephen',
    'larry',
    'justin',
    'scott',
    'brandon',
    'benjamin',
    'samuel',
    'gregory',
    'alexander',
    'patrick',
    'frank',
    'raymond',
    'jack',
    'dennis',
    'jerry',
    'tyler',
    'aaron',
    'jose',
    'henry',
    'adam',
    'douglas',
    'nathan',
    'peter',
    'zachary',
    'kyle',
    'noah',
    'alan',
    'ethan',
    'jeremy',
    'lionel',
    'mason',

    // African names (male)
    'kwame',
    'kofi',
    'kojo',
    'kwaku',
    'kwadwo',
    'kwabena',
    'kwesi',
    'ade',
    'adebayo',
    'adebola',
    'adedayo',
    'adeniyi',
    'adeola',
    'adesola',
    'chike',
    'chioma',
    'emeka',
    'ikechukwu',
    'kelechi',
    'nnamdi',
    'obinna',
    'tunde',
    'kunle',
    'segun',
    'femi',
    'yemi',
    'dele',
    'bola',
    'wale',
    'ibrahim',
    'mohammed',
    'ahmad',
    'hassan',
    'hussein',
    'omar',
    'ali',

    // Other international male names
    'antonio',
    'carlos',
    'francisco',
    'luis',
    'miguel',
    'pedro',
    'juan',
    'pierre',
    'jean',
    'michel',
    'philippe',
    'andre',
    'claude',
    'bernard',
    'giovanni',
    'marco',
    'alessandro',
    'francesco',
    'giuseppe',
    'antonio',
  ],

  // High confidence female names (90%+ confidence)
  female_high: [
    'mary',
    'patricia',
    'jennifer',
    'linda',
    'elizabeth',
    'barbara',
    'susan',
    'jessica',
    'sarah',
    'karen',
    'nancy',
    'lisa',
    'betty',
    'helen',
    'sandra',
    'donna',
    'carol',
    'ruth',
    'sharon',
    'michelle',
    'laura',
    'sarah',
    'kimberly',
    'deborah',
    'dorothy',
    'lisa',
    'nancy',
    'karen',
    'betty',
    'helen',
    'sandra',
    'donna',
    'carol',
    'ruth',
    'sharon',
    'michelle',
    'laura',
    'sarah',
    'kimberly',
    'amy',
    'angela',
    'brenda',
    'emma',
    'olivia',
    'cynthia',
    'marie',
    'janet',
    'catherine',
    'frances',
    'christine',
    'samantha',
    'debra',
    'rachel',
    'carolyn',
    'janet',
    'virginia',
    'maria',
    'heather',
    'diane',
    'julie',
    'joyce',
    'victoria',
    'kelly',
    'christina',
    'joan',
    'evelyn',
    'lauren',
    'judith',
    'megan',
    'cheryl',
    'andrea',
    'hannah',
    'jacqueline',
    'martha',
    'gloria',
    'teresa',
    'sara',
    'janice',

    // African names (female)
    'ama',
    'akosua',
    'adwoa',
    'yaa',
    'efua',
    'aba',
    'akua',
    'adunni',
    'folake',
    'funmi',
    'kemi',
    'lola',
    'nike',
    'sola',
    'tola',
    'chioma',
    'ngozi',
    'adaeze',
    'ifeoma',
    'nneka',
    'obioma',
    'uchechi',
    'fatima',
    'aisha',
    'khadija',
    'maryam',
    'zainab',
    'hauwa',
    'hadiza',

    // Other international female names
    'maria',
    'ana',
    'carmen',
    'rosa',
    'teresa',
    'lucia',
    'elena',
    'marie',
    'anne',
    'catherine',
    'sophie',
    'isabelle',
    'nathalie',
    'sylvie',
    'francesca',
    'giulia',
    'chiara',
    'valentina',
    'alessandra',
    'federica',
  ],

  // Medium confidence male names (70-89% confidence)
  male_medium: [
    'alex',
    'chris',
    'sam',
    'jordan',
    'taylor',
    'casey',
    'jamie',
    'drew',
    'morgan',
    'riley',
    'avery',
    'quinn',
    'sage',
    'river',
    'phoenix',
    'dakota',
    'emmanuel',
    'gabriel',
    'raphael',
    'israel',
    'daniel',
    'samuel',
    'joel',
    'victor',
    'felix',
    'oscar',
    'cesar',
    'sergio',
    'ricardo',
    'fernando',
  ],

  // Medium confidence female names (70-89% confidence)
  female_medium: [
    'alex',
    'chris',
    'sam',
    'jordan',
    'taylor',
    'casey',
    'jamie',
    'drew',
    'morgan',
    'riley',
    'avery',
    'quinn',
    'sage',
    'river',
    'phoenix',
    'dakota',
    'grace',
    'faith',
    'hope',
    'joy',
    'peace',
    'charity',
    'mercy',
    'patience',
    'blessing',
    'gift',
    'precious',
    'princess',
    'queen',
    'angel',
    'star',
  ],

  // Ambiguous names (below 70% confidence - should not be used for inference)
  ambiguous: [
    'alex',
    'chris',
    'sam',
    'jordan',
    'taylor',
    'casey',
    'jamie',
    'drew',
    'morgan',
    'riley',
    'avery',
    'quinn',
    'sage',
    'river',
    'phoenix',
    'dakota',
    'kendall',
    'skyler',
    'peyton',
    'cameron',
    'hayden',
    'logan',
    'parker',
  ],
};

/**
 * Confidence thresholds for gender inference
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9, // 90%+ confidence - very reliable
  MEDIUM: 0.7, // 70-89% confidence - moderately reliable
  LOW: 0.5, // 50-69% confidence - not reliable enough
  MINIMUM: 0.8, // Minimum threshold for making inferences (80%+)
} as const;

/**
 * Extract the first name from a full name string
 */
export function extractFirstName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return '';
  }

  // Split by spaces and take the first part
  const parts = trimmed.split(/\s+/);
  const firstName = parts[0].toLowerCase();

  // Remove common punctuation
  return firstName.replace(/[.,;:!?'"()]/g, '');
}

/**
 * Look up gender for a given name with confidence score
 */
export function lookupNameGender(name: string): {
  gender: 'Male' | 'Female' | null;
  confidence: number;
  source: 'high' | 'medium' | 'ambiguous' | 'unknown';
} {
  const firstName = extractFirstName(name);

  if (!firstName) {
    return { gender: null, confidence: 0, source: 'unknown' };
  }

  // Check high confidence male names
  if (NAME_GENDER_DATABASE.male_high.includes(firstName)) {
    return {
      gender: 'Male',
      confidence: CONFIDENCE_THRESHOLDS.HIGH,
      source: 'high',
    };
  }

  // Check high confidence female names
  if (NAME_GENDER_DATABASE.female_high.includes(firstName)) {
    return {
      gender: 'Female',
      confidence: CONFIDENCE_THRESHOLDS.HIGH,
      source: 'high',
    };
  }

  // Check medium confidence male names
  if (NAME_GENDER_DATABASE.male_medium.includes(firstName)) {
    return {
      gender: 'Male',
      confidence: CONFIDENCE_THRESHOLDS.MEDIUM,
      source: 'medium',
    };
  }

  // Check medium confidence female names
  if (NAME_GENDER_DATABASE.female_medium.includes(firstName)) {
    return {
      gender: 'Female',
      confidence: CONFIDENCE_THRESHOLDS.MEDIUM,
      source: 'medium',
    };
  }

  // Check ambiguous names
  if (NAME_GENDER_DATABASE.ambiguous.includes(firstName)) {
    return {
      gender: null,
      confidence: CONFIDENCE_THRESHOLDS.LOW,
      source: 'ambiguous',
    };
  }

  // Name not found in database
  return { gender: null, confidence: 0, source: 'unknown' };
}

/**
 * Infer gender for a name if confidence is above threshold
 */
export function inferGender(
  name: string,
  minimumConfidence: number = CONFIDENCE_THRESHOLDS.MINIMUM,
): {
  inferredGender: 'Male' | 'Female' | null;
  confidence: number;
  shouldInfer: boolean;
  reason: string;
} {
  const lookup = lookupNameGender(name);
  const shouldInfer = lookup.confidence >= minimumConfidence;

  let reason = '';
  if (lookup.gender && shouldInfer) {
    reason = `Inferred from first name "${extractFirstName(name)}" with ${Math.round(lookup.confidence * 100)}% confidence`;
  } else if (lookup.gender && !shouldInfer) {
    reason = `Name "${extractFirstName(name)}" found but confidence too low (${Math.round(lookup.confidence * 100)}% < ${Math.round(minimumConfidence * 100)}%)`;
  } else if (lookup.source === 'ambiguous') {
    reason = `Name "${extractFirstName(name)}" is ambiguous and cannot be reliably inferred`;
  } else {
    reason = `Name "${extractFirstName(name)}" not found in gender database`;
  }

  return {
    inferredGender: shouldInfer ? lookup.gender : null,
    confidence: lookup.confidence,
    shouldInfer,
    reason,
  };
}

/**
 * Process multiple students and infer missing genders
 */
export function inferMissingGenders(
  students: Array<{ name: string; gender?: string | null }>,
  minimumConfidence: number = CONFIDENCE_THRESHOLDS.MINIMUM,
): {
  processedStudents: Array<{
    name: string;
    gender: string;
    wasInferred: boolean;
  }>;
  inferences: Array<{
    name: string;
    inferredGender: 'Male' | 'Female';
    confidence: number;
    reason: string;
  }>;
  stats: {
    totalStudents: number;
    studentsWithGender: number;
    studentsWithoutGender: number;
    successfulInferences: number;
    failedInferences: number;
    inferenceRate: number;
  };
} {
  const processedStudents: Array<{
    name: string;
    gender: string;
    wasInferred: boolean;
  }> = [];
  const inferences: Array<{
    name: string;
    inferredGender: 'Male' | 'Female';
    confidence: number;
    reason: string;
  }> = [];

  let studentsWithGender = 0;
  let studentsWithoutGender = 0;
  let successfulInferences = 0;
  let failedInferences = 0;

  for (const student of students) {
    const hasGender =
      student.gender &&
      (student.gender === 'Male' || student.gender === 'Female');

    if (hasGender) {
      studentsWithGender++;
      processedStudents.push({
        name: student.name,
        gender: student.gender!,
        wasInferred: false,
      });
    } else {
      studentsWithoutGender++;
      const inference = inferGender(student.name, minimumConfidence);

      if (inference.shouldInfer && inference.inferredGender) {
        successfulInferences++;
        processedStudents.push({
          name: student.name,
          gender: inference.inferredGender,
          wasInferred: true,
        });
        inferences.push({
          name: student.name,
          inferredGender: inference.inferredGender,
          confidence: inference.confidence,
          reason: inference.reason,
        });
      } else {
        failedInferences++;
        // Keep original gender (empty) and mark as not inferred
        processedStudents.push({
          name: student.name,
          gender: student.gender || '',
          wasInferred: false,
        });
      }
    }
  }

  const inferenceRate =
    studentsWithoutGender > 0
      ? successfulInferences / studentsWithoutGender
      : 0;

  return {
    processedStudents,
    inferences,
    stats: {
      totalStudents: students.length,
      studentsWithGender,
      studentsWithoutGender,
      successfulInferences,
      failedInferences,
      inferenceRate,
    },
  };
}

/**
 * Generate human-readable descriptions of gender inferences
 */
export function generateGenderInferenceDescriptions(
  inferences: Array<{
    name: string;
    inferredGender: 'Male' | 'Female';
    confidence: number;
    reason: string;
  }>,
): string[] {
  return inferences.map(
    (inference) =>
      `Inferred gender "${inference.inferredGender}" for ${inference.name} (${Math.round(inference.confidence * 100)}% confidence)`,
  );
}

/**
 * Create warnings for gender inferences
 */
export function createGenderInferenceWarnings(
  inferences: Array<{
    name: string;
    inferredGender: 'Male' | 'Female';
    confidence: number;
    reason: string;
  }>,
): Array<{
  type: 'gender_inference';
  message: string;
  affectedCount: number;
  details: string[];
}> {
  if (inferences.length === 0) {
    return [];
  }

  const details = inferences.map(
    (inf) =>
      `${inf.name}: ${inf.inferredGender} (${Math.round(inf.confidence * 100)}% confidence)`,
  );

  return [
    {
      type: 'gender_inference' as const,
      message: `Gender was inferred for ${inferences.length} student${inferences.length > 1 ? 's' : ''} based on their names.`,
      affectedCount: inferences.length,
      details: [
        'Please verify the inferred gender values are correct',
        ...details.slice(0, 5), // Show first 5 details
        ...(details.length > 5 ? [`... and ${details.length - 5} more`] : []),
      ],
    },
  ];
}

/**
 * Validate gender inference configuration
 */
export function validateGenderInferenceConfig(minimumConfidence: number): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (minimumConfidence < 0 || minimumConfidence > 1) {
    issues.push('Minimum confidence must be between 0 and 1');
  }

  if (minimumConfidence < CONFIDENCE_THRESHOLDS.MINIMUM) {
    recommendations.push(
      `Consider using minimum confidence of ${CONFIDENCE_THRESHOLDS.MINIMUM} (80%) or higher for reliable inferences`,
    );
  }

  if (minimumConfidence > CONFIDENCE_THRESHOLDS.HIGH) {
    recommendations.push(
      'Very high confidence threshold may result in fewer successful inferences',
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Get statistics about the gender database
 */
export function getGenderDatabaseStats(): {
  totalNames: number;
  maleNames: number;
  femaleNames: number;
  ambiguousNames: number;
  highConfidenceNames: number;
  mediumConfidenceNames: number;
} {
  const maleHigh = NAME_GENDER_DATABASE.male_high.length;
  const femaleHigh = NAME_GENDER_DATABASE.female_high.length;
  const maleMedium = NAME_GENDER_DATABASE.male_medium.length;
  const femaleMedium = NAME_GENDER_DATABASE.female_medium.length;
  const ambiguous = NAME_GENDER_DATABASE.ambiguous.length;

  return {
    totalNames: maleHigh + femaleHigh + maleMedium + femaleMedium + ambiguous,
    maleNames: maleHigh + maleMedium,
    femaleNames: femaleHigh + femaleMedium,
    ambiguousNames: ambiguous,
    highConfidenceNames: maleHigh + femaleHigh,
    mediumConfidenceNames: maleMedium + femaleMedium,
  };
}
