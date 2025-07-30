import { toast } from 'sonner';
import {
  CheckCircle,
  AlertTriangle,
  Zap,
  Clock,
  FileX,
  WifiOff,
} from 'lucide-react';

// Toast notification utilities for AI repair operations
export const aiRepairToasts = {
  // Success toasts
  repairStarted: () => {
    return toast.loading('AI is analyzing your CSV...', {
      description: 'This usually takes a few seconds',
      duration: Infinity,
    });
  },

  repairSuccess: (data: {
    studentCount: number;
    confidence: number;
    correctionsMade: number;
    processingTime: number;
  }) => {
    return toast.success('CSV Successfully Repaired!', {
      description: `${data.studentCount} students processed with ${Math.round(data.confidence * 100)}% confidence`,
      duration: 5000,
      action: {
        label: 'View Details',
        onClick: () => {
          const previewElement = document.getElementById('ai-repair-preview');
          if (previewElement) {
            previewElement.scrollIntoView({ behavior: 'smooth' });
          }
        },
      },
    });
  },

  uploadSuccess: (studentCount: number) => {
    return toast.success('Upload Completed!', {
      description: `${studentCount} students added to your course`,
      duration: 4000,
      action: {
        label: 'View Course',
        onClick: () => {
          // Navigate to course view
        },
      },
    });
  },

  // Warning toasts
  lowConfidenceWarning: (confidence: number, warningCount: number) => {
    return toast.warning('Review Required', {
      description: `${warningCount} warnings detected. ${Math.round(confidence * 100)}% confidence.`,
      duration: 8000,
      action: {
        label: 'Review',
        onClick: () => {
          const warningsElement = document.getElementById('ai-repair-warnings');
          if (warningsElement) {
            warningsElement.scrollIntoView({ behavior: 'smooth' });
          }
        },
      },
    });
  },

  genderInferenceWarning: (inferenceCount: number) => {
    return toast.info('Gender Inferred', {
      description: `Gender was inferred for ${inferenceCount} student${inferenceCount !== 1 ? 's' : ''}`,
      duration: 6000,
    });
  },

  dataLossWarning: (excludedCount: number) => {
    return toast.warning('Data Excluded', {
      description: `${excludedCount} row${excludedCount !== 1 ? 's' : ''} could not be processed and were excluded`,
      duration: 8000,
    });
  },

  // Error toasts
  repairFailed: (error: string) => {
    return toast.error('AI Repair Failed', {
      description: error,
      duration: 8000,
      action: {
        label: 'Try Again',
        onClick: () => {
          // Retry logic would be handled by parent component
        },
      },
    });
  },

  networkError: () => {
    return toast.error('Connection Problem', {
      description:
        'Unable to connect to AI service. Check your internet connection.',
      duration: 8000,
      action: {
        label: 'Retry',
        onClick: () => {
          // Retry logic would be handled by parent component
        },
      },
    });
  },

  rateLimitError: (retryAfter: number) => {
    const minutes = Math.ceil(retryAfter / 60);
    return toast.error('Rate Limit Exceeded', {
      description: `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again`,
      duration: 10000,
    });
  },

  fileProcessingError: () => {
    return toast.error('File Processing Failed', {
      description:
        'Your CSV file could not be processed. Try a different file.',
      duration: 8000,
      action: {
        label: 'Get Template',
        onClick: () => {
          // Download CSV template
        },
      },
    });
  },

  // Info toasts
  processingUpdate: (stage: string) => {
    return toast.loading(`AI Repair: ${stage}`, {
      description: 'Processing your CSV file...',
      duration: Infinity,
    });
  },

  repairCancelled: () => {
    return toast.info('AI Repair Cancelled', {
      description: 'You can try again or upload a different file',
      duration: 4000,
    });
  },

  // Dismiss specific toast
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

// Enhanced toast with custom styling for AI repair
export const showAiRepairToast = (
  type: 'success' | 'error' | 'warning' | 'info' | 'loading',
  title: string,
  description?: string,
  options?: {
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
    onDismiss?: () => void;
  },
) => {
  const baseOptions = {
    duration: options?.duration || 5000,
    action: options?.action,
    onDismiss: options?.onDismiss,
    className: 'ai-repair-toast',
  };

  switch (type) {
    case 'success':
      return toast.success(title, {
        description,
        ...baseOptions,
      });
    case 'error':
      return toast.error(title, {
        description,
        ...baseOptions,
        duration: options?.duration || 8000,
      });
    case 'warning':
      return toast.warning(title, {
        description,
        ...baseOptions,
        duration: options?.duration || 6000,
      });
    case 'info':
      return toast.info(title, {
        description,
        ...baseOptions,
      });
    case 'loading':
      return toast.loading(title, {
        description,
        duration: Infinity,
      });
    default:
      return toast(title, {
        description,
        ...baseOptions,
      });
  }
};

// Progress toast for multi-step operations
export const createProgressToast = (steps: string[]) => {
  let currentStep = 0;
  let toastId: string | number;

  const updateProgress = (stepIndex: number) => {
    currentStep = stepIndex;
    const progress = ((stepIndex + 1) / steps.length) * 100;

    if (toastId) {
      toast.dismiss(toastId);
    }

    toastId = toast.loading(
      `Step ${stepIndex + 1}/${steps.length}: ${steps[stepIndex]}`,
      {
        description: `${Math.round(progress)}% complete`,
        duration: Infinity,
      },
    );

    return toastId;
  };

  const complete = (successMessage: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    return toast.success(successMessage, {
      description: 'All steps completed successfully',
      duration: 4000,
    });
  };

  const error = (errorMessage: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    return toast.error(`Failed at step ${currentStep + 1}`, {
      description: errorMessage,
      duration: 8000,
    });
  };

  return {
    updateProgress,
    complete,
    error,
    dismiss: () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    },
  };
};

// Batch operation toasts
export const batchOperationToast = {
  start: (operationName: string, itemCount: number) => {
    return toast.loading(`${operationName}...`, {
      description: `Processing ${itemCount} items`,
      duration: Infinity,
    });
  },

  progress: (toastId: string | number, completed: number, total: number) => {
    const percentage = Math.round((completed / total) * 100);
    toast.loading(`Processing... ${percentage}%`, {
      id: toastId,
      description: `${completed} of ${total} items completed`,
      duration: Infinity,
    });
  },

  complete: (
    toastId: string | number,
    operationName: string,
    itemCount: number,
  ) => {
    toast.dismiss(toastId);
    return toast.success(`${operationName} Complete!`, {
      description: `Successfully processed ${itemCount} items`,
      duration: 4000,
    });
  },

  error: (toastId: string | number, operationName: string, error: string) => {
    toast.dismiss(toastId);
    return toast.error(`${operationName} Failed`, {
      description: error,
      duration: 8000,
    });
  },
};
