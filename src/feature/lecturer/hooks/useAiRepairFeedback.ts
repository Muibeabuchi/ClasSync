import { useState, useCallback } from 'react';
import { aiRepairToasts } from '../utils/aiRepairToasts';

interface AiRepairResult {
  repaired: boolean;
  data: Array<{
    name: string;
    gender: 'Male' | 'Female';
    regNumber: string;
  }>;
  summary: string;
  warnings: Array<{
    type: string;
    message: string;
    affectedCount?: number;
    details?: string[];
  }>;
  confidence: {
    overall: number;
    headerMapping: number;
    dataNormalization: number;
    genderInference: number;
    highConfidenceCount: number;
    lowConfidenceCount: number;
  };
  metadata: {
    headerMappings: Array<{
      detected: string;
      mapped: string;
      confidence: number;
    }>;
    dataCorrections: string[];
    genderInferences: number;
    rowsProcessed: number;
    rowsExcluded: number;
    processingStartTime: number;
    processingEndTime: number;
  };
  errorType?: string;
  error?: string;
  retryAfter?: number;
}

interface FeedbackState {
  showSuccess: boolean;
  showWarnings: boolean;
  showUploadConfirmation: boolean;
  result: AiRepairResult | null;
}

export const useAiRepairFeedback = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    showSuccess: false,
    showWarnings: false,
    showUploadConfirmation: false,
    result: null,
  });

  // Handle successful AI repair
  const handleRepairSuccess = useCallback((result: AiRepairResult) => {
    setFeedbackState({
      showSuccess: true,
      showWarnings: result.warnings && result.warnings.length > 0,
      showUploadConfirmation: false,
      result,
    });

    // Show success toast with detailed information
    aiRepairToasts.repairSuccess({
      studentCount: result.data.length,
      confidence: result.confidence.overall,
      correctionsMade: result.metadata.dataCorrections.length,
      processingTime: Math.round(
        (result.metadata.processingEndTime -
          result.metadata.processingStartTime) /
          1000,
      ),
    });

    // Show specific warning toasts
    if (result.warnings && result.warnings.length > 0) {
      if (result.confidence.overall < 0.7) {
        aiRepairToasts.lowConfidenceWarning(
          result.confidence.overall,
          result.warnings.length,
        );
      }

      if (result.metadata.genderInferences > 0) {
        aiRepairToasts.genderInferenceWarning(result.metadata.genderInferences);
      }

      if (result.metadata.rowsExcluded > 0) {
        aiRepairToasts.dataLossWarning(result.metadata.rowsExcluded);
      }
    }
  }, []);

  // Handle repair failure
  const handleRepairFailure = useCallback(
    (error: string, errorType?: string) => {
      setFeedbackState({
        showSuccess: false,
        showWarnings: false,
        showUploadConfirmation: false,
        result: null,
      });

      // Show appropriate error toast based on error type
      switch (errorType) {
        case 'rate_limit_error':
          // Rate limit handling is done separately
          break;
        case 'network_error':
          aiRepairToasts.networkError();
          break;
        case 'parsing_error':
          aiRepairToasts.fileProcessingError();
          break;
        default:
          aiRepairToasts.repairFailed(error);
          break;
      }
    },
    [],
  );

  // Handle upload confirmation
  const handleUploadSuccess = useCallback(
    (
      studentCount: number,
      repairStats?: {
        correctionsMade: number;
        genderInferences: number;
        headerMappings: number;
        confidence: number;
      },
    ) => {
      setFeedbackState((prev) => ({
        ...prev,
        showUploadConfirmation: true,
      }));

      aiRepairToasts.uploadSuccess(studentCount);
    },
    [],
  );

  // Dismiss success feedback
  const dismissSuccess = useCallback(() => {
    setFeedbackState((prev) => ({
      ...prev,
      showSuccess: false,
    }));
  }, []);

  // Dismiss warnings feedback
  const dismissWarnings = useCallback(() => {
    setFeedbackState((prev) => ({
      ...prev,
      showWarnings: false,
    }));
  }, []);

  // Dismiss upload confirmation
  const dismissUploadConfirmation = useCallback(() => {
    setFeedbackState((prev) => ({
      ...prev,
      showUploadConfirmation: false,
    }));
  }, []);

  // Clear all feedback
  const clearAllFeedback = useCallback(() => {
    setFeedbackState({
      showSuccess: false,
      showWarnings: false,
      showUploadConfirmation: false,
      result: null,
    });
    aiRepairToasts.dismissAll();
  }, []);

  // Get feedback statistics
  const getFeedbackStats = useCallback(() => {
    if (!feedbackState.result) return null;

    return {
      studentCount: feedbackState.result.data.length,
      confidence: feedbackState.result.confidence.overall,
      correctionsMade: feedbackState.result.metadata.dataCorrections.length,
      genderInferences: feedbackState.result.metadata.genderInferences,
      headerMappings: feedbackState.result.metadata.headerMappings.length,
      processingTime: Math.round(
        (feedbackState.result.metadata.processingEndTime -
          feedbackState.result.metadata.processingStartTime) /
          1000,
      ),
      warningCount: feedbackState.result.warnings?.length || 0,
      hasLowConfidence: feedbackState.result.confidence.overall < 0.7,
      hasWarnings: (feedbackState.result.warnings?.length || 0) > 0,
    };
  }, [feedbackState.result]);

  // Check if should show warnings
  const shouldShowWarnings = useCallback(() => {
    if (!feedbackState.result) return false;

    return (
      feedbackState.showWarnings &&
      feedbackState.result.warnings &&
      (feedbackState.result.confidence.overall < 0.7 ||
        feedbackState.result.warnings.length > 0)
    );
  }, [feedbackState]);

  return {
    // State
    feedbackState,

    // Actions
    handleRepairSuccess,
    handleRepairFailure,
    handleUploadSuccess,
    dismissSuccess,
    dismissWarnings,
    dismissUploadConfirmation,
    clearAllFeedback,

    // Computed values
    getFeedbackStats,
    shouldShowWarnings,

    // Convenience getters
    showSuccess: feedbackState.showSuccess,
    showWarnings: shouldShowWarnings(),
    showUploadConfirmation: feedbackState.showUploadConfirmation,
    result: feedbackState.result,
  };
};
