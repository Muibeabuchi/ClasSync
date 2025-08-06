'use node';

import { action } from '../_generated/server';
import { v } from 'convex/values';
import { GoogleGenAI } from '@google/genai';
import { api } from '../_generated/api';
import {
  buildGeminiCsvFixPrompt,
  validateCsvSize,
  sanitizeCsvContent,
} from '../utils/buildPrompt';
// import {
//   mapHeaders,
//   validateRequiredFieldsMapped,
//   generateHeaderMappingDescription,
//   createFieldMappingObject,
//   detectHeaderRow,
//   handleUnmappedHeaders,
// } from '../utils/headerMapping';
// import {
//   cleanAndNormalizeStudents,
//   filterValidStudents,
// } from '../utils/dataNormalization';
// import {
//   inferMissingGenders,
//   createGenderInferenceWarnings,
//   CONFIDENCE_THRESHOLDS,
// } from '../utils/genderInference';
import { validateAndCleanStudentArray } from '../schemas/studentSchema';
import {
  // AiFixCsvArgs,
  AiFixCsvResult,
  createErrorResult,
  createSuccessResult,
  ProcessingMetadata,
  ConfidenceScoring,
  RepairWarning,
  GeminiRawResponse,
  GeminiParsedResponse,
  DEFAULT_AI_REPAIR_CONFIG,
} from '../schemas/aiFixCsvTypes';
import {
  applyAllAiCsvFixRateLimits,
  createRateLimitError,
  logRateLimitEvent,
} from '../utils/rateLimiter';

/**
 * AI-powered CSV repair action for ClassSync
 *
 * This action takes malformed CSV content and uses Gemini AI to:
 * 1. Detect and map headers to standard format
 * 2. Normalize and clean data entries
 * 3. Infer missing gender information when possible
 * 4. Return structured, validated student data
 *
 * Requirements covered:
 * - 1.3: Lecturer authentication and authorization
 * - 1.4: AI processing with Gemini integration
 * - 8.1: Secure API key management
 * - 8.2: Rate limiting implementation
 */
export const aiFixCsv = action({
  args: {
    rawCsvText: v.string(),
  },
  handler: async (ctx, args): Promise<AiFixCsvResult> => {
    const processingStartTime = Date.now();

    try {
      // 1. AUTHENTICATION AND AUTHORIZATION
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return createErrorResult(
          'Authentication required. Please log in to use AI CSV repair.',
          'validation_error',
          {
            suggestions: ['Please log in and try again'],
            retryable: false,
          },
        );
      }

      // Get user profile to verify lecturer role
      const userProfile = await ctx.runQuery(
        api.userProfile.getAuthenticatedUser,
        {},
      );
      if (!userProfile) {
        return createErrorResult(
          'User profile not found. Please complete your profile setup.',
          'validation_error',
          {
            suggestions: ['Complete your profile setup and try again'],
            retryable: false,
          },
        );
      }

      if (userProfile.role !== 'lecturer') {
        return createErrorResult(
          'Access denied. Only lecturers can use AI CSV repair.',
          'validation_error',
          {
            suggestions: ['This feature is only available to lecturers'],
            retryable: false,
          },
        );
      }

      const lecturerId = identity.subject;

      // 2. RATE LIMITING CHECKS
      try {
        const rateLimitResult = await applyAllAiCsvFixRateLimits(
          ctx,
          lecturerId,
        );

        if (!rateLimitResult.success) {
          logRateLimitEvent('exceeded', lecturerId, {
            limitType: rateLimitResult.blockedBy,
            retryAfter: rateLimitResult.retryAfter,
            timestamp: Date.now(),
          });

          return createRateLimitError(
            rateLimitResult.blockedBy || 'unknown',
            rateLimitResult.retryAfter,
          );
        }

        logRateLimitEvent('apply', lecturerId, {
          allowed: true,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Rate limiting error:', error);
        return createErrorResult(
          'Rate limiting service temporarily unavailable. Please try again later.',
          'rate_limit_error',
          {
            suggestions: ['Wait a few minutes and try again'],
            retryable: true,
            retryAfter: 300,
          },
        );
      }

      // 3. INPUT VALIDATION
      const csvValidation = validateCsvSize(args.rawCsvText);
      if (!csvValidation.valid) {
        return createErrorResult(
          csvValidation.error || 'Invalid CSV content',
          'validation_error',
          {
            suggestions: [
              'Ensure your CSV file is under 1MB',
              'Check that your CSV contains valid student data',
              'Try with a smaller file with fewer students',
            ],
            retryable: false,
          },
        );
      }

      // Sanitize CSV content for security
      const sanitizedCsv = sanitizeCsvContent(args.rawCsvText);

      // 4. GEMINI AI INTEGRATION
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.error('GEMINI_API_KEY environment variable not set');
        return createErrorResult(
          'AI service configuration error. Please contact support.',
          'ai_service_error',
          {
            suggestions: ['Contact support for assistance'],
            retryable: false,
          },
        );
      }

      const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

      // Build the prompt
      const prompt = buildGeminiCsvFixPrompt(sanitizedCsv);

      let geminiResponse: GeminiRawResponse;
      const aiProcessingStartTime = Date.now();

      try {
        // Call Gemini AI with timeout using the new SDK
        const result = (await Promise.race([
          genAI.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
            config: {
              temperature: 0.1, // Low temperature for consistent, factual responses
              topK: 1,
              topP: 0.8,
              maxOutputTokens: 8192,
            },
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('AI processing timeout')),
              DEFAULT_AI_REPAIR_CONFIG.processingTimeout,
            ),
          ),
        ])) as any;

        const responseText = result.text || '';

        geminiResponse = {
          text: responseText,
          timestamp: Date.now(),
          model: 'gemini-2.0-flash-001',
          usage: {
            promptTokens: result.usageMetadata?.promptTokenCount || 0,
            completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: result.usageMetadata?.totalTokenCount || 0,
          },
        };
      } catch (error) {
        console.error('Gemini AI error:', error);

        if (error instanceof Error && error.message.includes('timeout')) {
          return createErrorResult(
            'AI processing timed out. Please try with a smaller CSV file.',
            'timeout_error',
            {
              suggestions: [
                'Try with a smaller CSV file',
                'Ensure your CSV has fewer than 500 students',
                'Check your internet connection and try again',
              ],
              retryable: true,
              retryAfter: 60,
            },
          );
        }

        return createErrorResult(
          'AI service temporarily unavailable. Please try again later.',
          'ai_service_error',
          {
            suggestions: [
              'Wait a few minutes and try again',
              'Check your internet connection',
              'Try manually editing your CSV file',
            ],
            retryable: true,
            retryAfter: 120,
          },
        );
      }

      const aiProcessingTime = Date.now() - aiProcessingStartTime;

      // 5. PARSE AND VALIDATE AI RESPONSE
      let parsedResponse: GeminiParsedResponse;

      try {
        // Clean the response text (remove any markdown formatting)
        let cleanedResponse = geminiResponse.text.trim();

        // Remove markdown code blocks if present
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse
            .replace(/^```\s*/, '')
            .replace(/\s*```$/, '');
        }

        parsedResponse = JSON.parse(cleanedResponse);

        // Validate required fields in AI response
        if (
          !parsedResponse.students ||
          !Array.isArray(parsedResponse.students)
        ) {
          throw new Error(
            'Invalid AI response: missing or invalid students array',
          );
        }
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        return createErrorResult(
          'AI returned invalid response format. Please try again.',
          'parsing_error',
          {
            debug: DEFAULT_AI_REPAIR_CONFIG.includeDebugInfo
              ? geminiResponse.text
              : undefined,
            suggestions: [
              'Try again with the same file',
              'Check that your CSV format is valid',
              'Try manually editing your CSV file',
            ],
            retryable: true,
            retryAfter: 30,
          },
        );
      }

      // 6. VALIDATE STUDENT DATA AGAINST SCHEMA
      const validationResult = validateAndCleanStudentArray(
        parsedResponse.students,
      );

      if (!validationResult.success || !validationResult.data) {
        const errorMessages = validationResult.errors || [
          'Unknown validation error',
        ];
        return createErrorResult(
          `AI repair failed validation: ${errorMessages.join(', ')}`,
          'validation_error',
          {
            suggestions: [
              'Check that your CSV contains valid student data',
              'Ensure registration numbers start with "202"',
              'Verify that names and gender fields are properly formatted',
            ],
            retryable: true,
            retryAfter: 30,
          },
        );
      }

      // 7. CALCULATE CONFIDENCE AND GENERATE METADATA
      const processingEndTime = Date.now();

      const confidence: ConfidenceScoring = calculateConfidenceScore(
        parsedResponse,
        validationResult,
        csvValidation.stats,
      );

      const warnings: RepairWarning[] = generateWarnings(
        parsedResponse,
        validationResult,
        confidence,
      );

      const metadata: ProcessingMetadata = {
        headerMappings: Object.entries(parsedResponse.headerMappings || {}).map(
          ([detected, mapped]) => ({
            detected,
            mapped,
            confidence: 0.9, // Default confidence for header mappings
          }),
        ),
        dataCorrections: parsedResponse.issues || [],
        genderInferences: countGenderInferences(parsedResponse.issues || []),
        rowsProcessed: csvValidation.stats.estimatedStudents,
        rowsExcluded:
          csvValidation.stats.estimatedStudents - validationResult.data.length,
        processingStartTime,
        processingEndTime,
        aiProcessingTime,
      };

      // 8. CHECK MINIMUM CONFIDENCE THRESHOLD
      if (
        confidence.overall < DEFAULT_AI_REPAIR_CONFIG.minConfidenceThreshold
      ) {
        return createErrorResult(
          `AI repair confidence too low (${Math.round(confidence.overall * 100)}%). Manual editing recommended.`,
          'validation_error',
          {
            suggestions: [
              'Try manually editing your CSV file',
              'Ensure headers are clearly named (Name, Gender, Registration Number)',
              'Check that data is properly formatted',
              'Remove any extra columns or formatting',
            ],
            retryable: true,
            retryAfter: 30,
          },
        );
      }

      // 9. RETURN SUCCESS RESULT
      const summary = generateSummary(
        validationResult.data,
        parsedResponse,
        metadata,
      );

      return createSuccessResult(
        validationResult.data,
        summary,
        warnings,
        confidence,
        metadata,
      );
    } catch (error) {
      console.error('Unexpected error in aiFixCsv:', error);

      return createErrorResult(
        'An unexpected error occurred during CSV repair. Please try again.',
        'ai_service_error',
        {
          debug:
            DEFAULT_AI_REPAIR_CONFIG.includeDebugInfo && error instanceof Error
              ? error.message
              : undefined,
          suggestions: [
            'Try again in a few minutes',
            'Check your internet connection',
            'Try with a different CSV file format',
          ],
          retryable: true,
          retryAfter: 60,
        },
      );
    }
  },
});

/**
 * Calculate confidence score based on AI response and validation results
 */
function calculateConfidenceScore(
  aiResponse: GeminiParsedResponse,
  validationResult: any,
  csvStats: any,
): ConfidenceScoring {
  // Base confidence from AI
  const aiConfidence = aiResponse.confidence || 0.5;

  // Header mapping confidence (higher if headers were clearly mapped)
  const headerMappingConfidence =
    Object.keys(aiResponse.headerMappings || {}).length > 0 ? 0.9 : 0.7;

  // Data normalization confidence (based on validation success rate)
  const validCount = validationResult.validCount || 0;
  const totalCount = csvStats.estimatedStudents || 1;
  const dataNormalizationConfidence = validCount / totalCount;

  // Gender inference confidence (lower if many inferences were made)
  const genderInferences = countGenderInferences(aiResponse.issues || []);
  const genderInferenceConfidence = Math.max(
    0.5,
    1 - genderInferences / totalCount,
  );

  // Calculate overall confidence (weighted average)
  const overall =
    aiConfidence * 0.4 +
    headerMappingConfidence * 0.2 +
    dataNormalizationConfidence * 0.3 +
    genderInferenceConfidence * 0.1;

  return {
    overall: Math.min(1, Math.max(0, overall)),
    headerMapping: headerMappingConfidence,
    dataNormalization: dataNormalizationConfidence,
    genderInference: genderInferenceConfidence,
    highConfidenceCount: validCount,
    lowConfidenceCount: Math.max(0, totalCount - validCount),
  };
}

/**
 * Generate warnings based on the repair process
 */
function generateWarnings(
  aiResponse: GeminiParsedResponse,
  validationResult: any,
  confidence: ConfidenceScoring,
): RepairWarning[] {
  const warnings: RepairWarning[] = [];

  // Gender inference warnings
  const genderInferences = countGenderInferences(aiResponse.issues || []);
  if (genderInferences > 0) {
    warnings.push({
      type: 'gender_inference',
      message: `Gender was inferred for ${genderInferences} student${genderInferences > 1 ? 's' : ''} based on their names.`,
      affectedCount: genderInferences,
      details: ['Please verify the inferred gender values are correct'],
    });
  }

  // Low confidence warning
  if (confidence.overall < 0.7) {
    warnings.push({
      type: 'low_confidence',
      message:
        'Some repairs have low confidence. Please review the data carefully.',
      details: [
        'Check names, gender values, and registration numbers for accuracy',
      ],
    });
  }

  // Data loss warning
  if (validationResult.invalidCount > 0) {
    warnings.push({
      type: 'data_loss',
      message: `${validationResult.invalidCount} row${validationResult.invalidCount > 1 ? 's' : ''} could not be repaired and were excluded.`,
      affectedCount: validationResult.invalidCount,
      details: [
        'These rows had invalid data that could not be automatically fixed',
      ],
    });
  }

  return warnings;
}

/**
 * Count gender inferences from AI issues list
 */
function countGenderInferences(issues: string[]): number {
  return issues.filter(
    (issue) =>
      issue.toLowerCase().includes('inferred gender') ||
      issue.toLowerCase().includes('gender inferred'),
  ).length;
}

/**
 * Generate human-readable summary of the repair process
 */
function generateSummary(
  repairedData: any[],
  aiResponse: GeminiParsedResponse,
  metadata: ProcessingMetadata,
): string {
  const studentCount = repairedData.length;
  const headerMappings = metadata.headerMappings.length;
  const corrections = metadata.dataCorrections.length;
  const genderInferences = metadata.genderInferences;
  const processingTime = Math.round(
    (metadata.processingEndTime - metadata.processingStartTime) / 1000,
  );

  let summary = `Successfully processed ${studentCount} student${studentCount > 1 ? 's' : ''} in ${processingTime} second${processingTime > 1 ? 's' : ''}.`;

  if (headerMappings > 0) {
    summary += ` Mapped ${headerMappings} header${headerMappings > 1 ? 's' : ''} to standard format.`;
  }

  if (corrections > 0) {
    summary += ` Applied ${corrections} data correction${corrections > 1 ? 's' : ''}.`;
  }

  if (genderInferences > 0) {
    summary += ` Inferred gender for ${genderInferences} student${genderInferences > 1 ? 's' : ''}.`;
  }

  if (metadata.rowsExcluded > 0) {
    summary += ` Excluded ${metadata.rowsExcluded} invalid row${metadata.rowsExcluded > 1 ? 's' : ''}.`;
  }

  return summary;
}
