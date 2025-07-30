import { ExpectedStudentType } from './studentSchema';

/**
 * Input arguments for the aiFixCsv Convex action
 */
export interface AiFixCsvArgs {
  /** Raw CSV text content to be processed by AI */
  rawCsvText: string;
}

/**
 * Header mapping information showing how headers were detected and mapped
 */
export interface HeaderMapping {
  /** The original header found in the CSV */
  detected: string;
  /** The standard header it was mapped to */
  mapped: string;
  /** Confidence level of the mapping (0-1) */
  confidence: number;
}

/**
 * Metadata about the processing that occurred during AI repair
 */
export interface ProcessingMetadata {
  /** List of header mappings that were performed */
  headerMappings: HeaderMapping[];
  /** List of data corrections that were made */
  dataCorrections: string[];
  /** Number of students who had gender inferred */
  genderInferences: number;
  /** Total number of rows processed from the CSV */
  rowsProcessed: number;
  /** Number of rows that were excluded due to errors */
  rowsExcluded: number;
  /** Timestamp when processing started */
  processingStartTime: number;
  /** Timestamp when processing completed */
  processingEndTime: number;
  /** Time taken for AI processing in milliseconds */
  aiProcessingTime?: number;
}

/**
 * Confidence scoring breakdown for different aspects of the repair
 */
export interface ConfidenceScoring {
  /** Overall confidence score (0-1) */
  overall: number;
  /** Confidence in header mappings (0-1) */
  headerMapping: number;
  /** Confidence in data normalization (0-1) */
  dataNormalization: number;
  /** Confidence in gender inferences (0-1) */
  genderInference: number;
  /** Number of high-confidence repairs */
  highConfidenceCount: number;
  /** Number of low-confidence repairs */
  lowConfidenceCount: number;
}

/**
 * Warning information for issues that couldn't be automatically resolved
 */
export interface RepairWarning {
  /** Type of warning */
  type:
    | 'gender_inference'
    | 'low_confidence'
    | 'data_loss'
    | 'format_issue'
    | 'duplicate_handling';
  /** Human-readable warning message */
  message: string;
  /** Number of affected records */
  affectedCount?: number;
  /** Specific details about the warning */
  details?: string[];
}

/**
 * Success result from AI CSV repair
 */
export interface AiFixCsvSuccessResult {
  /** Indicates the repair was successful */
  repaired: true;
  /** Array of validated and cleaned student data */
  data: ExpectedStudentType[];
  /** Human-readable summary of changes made */
  summary: string;
  /** List of warnings about the repair process */
  warnings: RepairWarning[];
  /** Confidence scoring breakdown */
  confidence: ConfidenceScoring;
  /** Detailed processing metadata */
  metadata: ProcessingMetadata;
}

/**
 * Error result from AI CSV repair
 */
export interface AiFixCsvErrorResult {
  /** Indicates the repair failed */
  repaired: false;
  /** Error message describing what went wrong */
  error: string;
  /** Error category for better handling */
  errorType:
    | 'network_error'
    | 'parsing_error'
    | 'validation_error'
    | 'rate_limit_error'
    | 'ai_service_error'
    | 'timeout_error';
  /** Additional debug information (only in development) */
  debug?: string;
  /** Suggested actions for the user */
  suggestions?: string[];
  /** Whether the operation can be retried */
  retryable: boolean;
  /** Retry delay in seconds if retryable */
  retryAfter?: number;
}

/**
 * Union type for all possible results from AI CSV repair
 */
export type AiFixCsvResult = AiFixCsvSuccessResult | AiFixCsvErrorResult;

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
  /** Whether the rate limit was exceeded */
  exceeded: boolean;
  /** Number of attempts remaining */
  remaining: number;
  /** Time until rate limit resets (in seconds) */
  resetTime: number;
  /** Maximum attempts allowed in the time window */
  limit: number;
  /** Time window for the rate limit (in seconds) */
  window: number;
}

/**
 * Raw response from Gemini AI before processing
 */
export interface GeminiRawResponse {
  /** Raw text response from Gemini */
  text: string;
  /** Timestamp of the response */
  timestamp: number;
  /** Model used for the response */
  model: string;
  /** Token usage information if available */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Parsed and structured response from Gemini AI
 */
export interface GeminiParsedResponse {
  /** Parsed student data from AI response */
  students: any[];
  /** Summary provided by AI */
  summary?: string;
  /** Issues identified and fixed by AI */
  issues?: string[];
  /** Confidence assessment from AI */
  confidence?: number;
  /** Header mappings identified by AI */
  headerMappings?: { [key: string]: string };
}

/**
 * Internal processing state for tracking repair progress
 */
export interface RepairProcessingState {
  /** Current step in the repair process */
  currentStep:
    | 'initializing'
    | 'calling_ai'
    | 'parsing_response'
    | 'validating_data'
    | 'finalizing';
  /** Progress percentage (0-100) */
  progress: number;
  /** Any errors encountered during processing */
  errors: string[];
  /** Warnings generated during processing */
  warnings: RepairWarning[];
  /** Start time of processing */
  startTime: number;
}

/**
 * Configuration options for AI repair process
 */
export interface AiRepairConfig {
  /** Maximum number of students to process */
  maxStudents: number;
  /** Minimum confidence threshold for accepting repairs */
  minConfidenceThreshold: number;
  /** Whether to attempt gender inference */
  enableGenderInference: boolean;
  /** Timeout for AI processing in milliseconds */
  processingTimeout: number;
  /** Whether to include debug information in responses */
  includeDebugInfo: boolean;
}

/**
 * Type guard to check if result is a success result
 */
export const isSuccessResult = (
  result: AiFixCsvResult,
): result is AiFixCsvSuccessResult => {
  return result.repaired === true;
};

/**
 * Type guard to check if result is an error result
 */
export const isErrorResult = (
  result: AiFixCsvResult,
): result is AiFixCsvErrorResult => {
  return result.repaired === false;
};

/**
 * Helper type for creating error results
 */
export const createErrorResult = (
  error: string,
  errorType: AiFixCsvErrorResult['errorType'],
  options: {
    debug?: string;
    suggestions?: string[];
    retryable?: boolean;
    retryAfter?: number;
  } = {},
): AiFixCsvErrorResult => {
  return {
    repaired: false,
    error,
    errorType,
    debug: options.debug,
    suggestions: options.suggestions,
    retryable: options.retryable ?? false,
    retryAfter: options.retryAfter,
  };
};

/**
 * Helper type for creating success results
 */
export const createSuccessResult = (
  data: ExpectedStudentType[],
  summary: string,
  warnings: RepairWarning[],
  confidence: ConfidenceScoring,
  metadata: ProcessingMetadata,
): AiFixCsvSuccessResult => {
  return {
    repaired: true,
    data,
    summary,
    warnings,
    confidence,
    metadata,
  };
};

/**
 * Default configuration for AI repair process
 */
export const DEFAULT_AI_REPAIR_CONFIG: AiRepairConfig = {
  maxStudents: 500,
  minConfidenceThreshold: 0.5,
  enableGenderInference: true,
  processingTimeout: 30000, // 30 seconds
  includeDebugInfo: false,
};
