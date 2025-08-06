# Implementation Plan

- [ ] 1. Set up project configuration
  - Configure Convex app to use rate limiter component in convex.config.ts
  - Verify GEMINI_SECRET_KEY is properly configured in Convex dashboard
  - _Requirements: 1.1, 1.3, 8.2_

- [x] 2. Create core data schemas and validation

- [x] 2.1 Create Zod schema for expected student data structure
  - Define ExpectedStudentSchema with name, gender, and regNumber validation
  - Create validation functions for each field with proper error messages
  - _Requirements: 3.4, 5.1_

- [x] 2.2 Create TypeScript interfaces for AI repair system
  - Define AiFixCsvArgs interface for action input
  - Define AiFixCsvResult interface for action output
  - Create ProcessingMetadata and HeaderMapping interfaces
  - Define error response types and confidence scoring types
  - _Requirements: 6.1, 6.2, 7.4_

- [x] 3. Implement Gemini AI prompt builder utility

- [x] 3.1 Create buildGeminiCsvFixPrompt function
  - Build structured prompt with clear task definition
  - Include header mapping instructions for common variations
  - Add data normalization rules (name casing, gender correction)
  - Include gender inference guidelines with confidence thresholds
  - Specify JSON response format requirements
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2_

- [x] 4. Set up Convex rate limiter configuration

- [x] 4.1 Configure rate limiter in Convex app
  - Update convex.config.ts to include rate limiter component
  - Define rate limit policies for AI CSV fix operations
  - Set up per-lecturer limits (5 attempts per hour)
  - Configure global AI service usage limits with sharding
  - _Requirements: 7.1, 8.2_

- [x] 4.2 Create rate limiter utility functions
  - Create helper functions for checking and applying rate limits
  - Implement error handling for rate limit exceeded scenarios
  - Add retry time calculation with jitter
  - Create rate limit reset functionality for successful operations
  - _Requirements: 7.1, 7.5_

- [x] 5. Implement core Convex action for AI CSV repair

- [x] 5.1 Create aiFixCsv Convex action
  - Set up action with proper argument validation
  - Implement lecturer authentication and authorization
  - Add rate limiting checks before processing
  - Integrate with Gemini AI using Google Generative AI SDK
  - _Requirements: 1.3, 1.4, 8.1, 8.2_

- [x] 5.2 Add AI response processing and validation
  - Parse JSON response from Gemini AI
  - Validate response against expected schema
  - Handle malformed or invalid AI responses gracefully
  - Calculate confidence scores based on repair quality
  - Generate summary of changes and warnings
  - _Requirements: 1.4, 6.1, 6.2, 7.2, 7.4_

- [x] 5.3 Implement comprehensive error handling
  - Handle network errors and API timeouts
  - Manage JSON parsing errors from AI responses
  - Implement fallback mechanisms for various failure modes
  - Add structured logging for debugging without exposing sensitive data
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.4_

- [x] 6. Create data processing and normalization logic

- [x] 6.1 Implement header mapping functionality
  - Create header detection and mapping algorithms
  - Build fuzzy matching for common header variations
  - Document all header mappings in repair summary
  - Handle cases where headers cannot be confidently mapped
  - _Requirements: 2.1, 2.2, 2.4, 6.3_

- [x] 6.2 Add data cleaning and normalization
  - Implement name case normalization (proper case conversion)
  - Create gender value correction (handle typos and variations)
  - Add whitespace trimming and empty row removal
  - Implement duplicate detection and removal
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6.3 Implement gender inference system
  - Create name-to-gender mapping functionality
  - Set confidence threshold for gender inference (80%+)
  - Track and report gender inferences in warnings
  - Handle cases where gender cannot be confidently inferred
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Enhance frontend CSV upload component

- [x] 7.1 Update StudentUploadSection component
  - Add error state handling for failed CSV parsing
  - Integrate "AI Fix CSV" button with proper styling
  - Add loading states during AI processing
  - Implement error message display for various failure scenarios
  - _Requirements: 1.1, 1.2, 5.1, 7.1, 7.5_

- [x] 7.2 Create AI repair preview component
  - Build preview table showing repaired data
  - Highlight cells that were modified by AI
  - Display repair summary with detailed change list
  - Show confidence score and warnings clearly
  - Add confirm/cancel actions for lecturer review
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.3_

- [x] 7.3 Add rate limiting UI feedback
  - Display rate limit exceeded messages
  - Show retry time with countdown
  - Provide clear guidance when limits are reached
  - Add visual indicators for rate limit status
  - _Requirements: 7.5_

- [x] 8. Implement comprehensive error handling and user feedback

- [x] 8.1 Create error boundary components
  - Add error boundaries for AI repair functionality
  - Implement fallback UI for various error states
  - Create user-friendly error messages
  - Add retry mechanisms where appropriate
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 8.2 Add success and warning feedback systems
  - Implement toast notifications for repair status
  - Create detailed warning displays for low confidence repairs
  - Add success confirmation with repair statistics
  - Provide clear next steps after successful repair
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 9. Create comprehensive test suite
- [ ] 9.1 Write unit tests for core functionality
  - Test prompt builder with various CSV formats
  - Test schema validation with valid and invalid data
  - Test header mapping logic with edge cases
  - Test data normalization functions
  - _Requirements: All requirements - validation_

- [ ] 9.2 Create integration tests
  - Test complete AI repair flow end-to-end
  - Test rate limiting functionality
  - Test error handling scenarios
  - Mock Gemini API responses for consistent testing
  - _Requirements: All requirements - integration_

- [ ] 9.3 Add performance and load tests
  - Test with large CSV files (100+ students)
  - Test concurrent repair requests
  - Validate processing time limits
  - Test memory usage patterns
  - _Requirements: Performance and scalability_

- [ ] 10. Security and privacy implementation
- [ ] 10.1 Implement data protection measures
  - Ensure no permanent storage of raw CSV content
  - Add automatic cleanup of processing artifacts
  - Implement secure API key management
  - Add input sanitization and validation
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10.2 Add audit logging and monitoring
  - Log repair operations for debugging (without sensitive data)
  - Track usage patterns and success rates
  - Monitor API usage and rate limit effectiveness
  - Implement error tracking and alerting
  - _Requirements: 8.4, 8.5_

- [ ] 11. Documentation and deployment preparation
- [ ] 11.1 Create user documentation
  - Write user guide for AI CSV repair feature
  - Create troubleshooting guide for common issues
  - Document supported CSV formats and requirements
  - Add FAQ section for lecturer questions
  - _Requirements: User experience and support_
