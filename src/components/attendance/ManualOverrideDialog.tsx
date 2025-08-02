import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  AlertCircle,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useManualAttendanceOverride } from '@/hooks/useManualAttendanceOverride';
import {
  validateAndCleanJustification,
  OVERRIDE_VALIDATION_CONSTANTS,
  overrideJustificationSchema,
} from '../../../convex/schemas/overrideValidation';
import type { Id } from 'convex/_generated/dataModel';
import { cn } from '@/lib/utils';

interface StudentInfo {
  id: Id<'userProfiles'>;
  name: string;
  registrationNumber: string;
}

interface ManualOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentInfo;
  sessionId: Id<'attendanceSessions'>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * ManualOverrideDialog component - Responsive dialog/drawer for manual attendance overrides
 * Requirements: 3.2, 3.3 - Modal on desktop, Drawer on mobile with form validation
 */
export const ManualOverrideDialog = ({
  isOpen,
  onClose,
  student,
  sessionId,
  onSuccess,
  onError,
}: ManualOverrideDialogProps) => {
  const [justification, setJustification] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  // Mobile-first responsive breakpoints following design system
  const isMobile = useMediaQuery('(max-width: 640px)'); // sm breakpoint
  const isTablet = useMediaQuery('(max-width: 768px)'); // md breakpoint
  const isLargeTablet = useMediaQuery('(max-width: 1024px)'); // lg breakpoint
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  const isSmallScreen = useMediaQuery('(max-width: 480px)'); // xs breakpoint for very small screens

  const { createOverride, isLoading, error, reset } =
    useManualAttendanceOverride({
      onSuccess: (data) => {
        handleSuccess();
        onSuccess?.();
      },
      onError: (err) => {
        setShowConfirmation(false);
        onError?.(err);
      },
    });

  // Real-time validation using ZOD schema
  // Requirements: 1.3, 3.3, 3.4 - ZOD schema validation with real-time feedback
  const validateJustification = useCallback((value: string) => {
    setIsValidating(true);

    try {
      // Use ZOD schema for comprehensive validation
      const result = overrideJustificationSchema.safeParse({
        justificationNote: value,
      });

      if (result.success) {
        setValidationErrors([]);
        setIsValidating(false);
        return true;
      } else {
        const errors = result.error.errors.map((err) => err.message);
        setValidationErrors(errors);
        setIsValidating(false);
        return false;
      }
    } catch (error) {
      setValidationErrors(['Validation error occurred']);
      setIsValidating(false);
      return false;
    }
  }, []);

  // Enhanced validation state with real-time feedback
  const characterCount = justification.length;
  const trimmedLength = justification.trim().length;
  const wordCount = justification
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const isValidLength =
    characterCount >= OVERRIDE_VALIDATION_CONSTANTS.MIN_JUSTIFICATION_LENGTH &&
    characterCount <= OVERRIDE_VALIDATION_CONSTANTS.MAX_JUSTIFICATION_LENGTH;
  const hasMinimumWords =
    wordCount >= OVERRIDE_VALIDATION_CONSTANTS.MIN_JUSTIFICATION_WORDS;
  const isNotRepeatedChars = !/^(.)\1{10,}$/.test(justification);
  const isNotOnlyWhitespace = trimmedLength > 0;

  const charactersNeeded = Math.max(
    0,
    OVERRIDE_VALIDATION_CONSTANTS.MIN_JUSTIFICATION_LENGTH - characterCount,
  );
  const charactersRemaining =
    OVERRIDE_VALIDATION_CONSTANTS.MAX_JUSTIFICATION_LENGTH - characterCount;

  // Comprehensive validation state
  const isValidJustification =
    isValidLength &&
    hasMinimumWords &&
    isNotRepeatedChars &&
    isNotOnlyWhitespace &&
    validationErrors.length === 0;

  // Form submission validation - Requirements: 3.4
  const canSubmit = isValidJustification && !isLoading && !isValidating;

  const handleSuccess = () => {
    setJustification('');
    setShowConfirmation(false);
    reset();
    onClose();
  };

  const handleCancel = () => {
    setJustification('');
    setShowConfirmation(false);
    reset();
    onClose();
  };

  // Real-time validation on input change with debouncing
  // Requirements: 3.3, 3.4 - Real-time character count with minimum 15 character validation
  const handleJustificationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    if (
      value.length <= OVERRIDE_VALIDATION_CONSTANTS.MAX_JUSTIFICATION_LENGTH
    ) {
      setJustification(value);

      // Reset confirmation state when user modifies justification
      if (showConfirmation) {
        setShowConfirmation(false);
      }

      // Perform real-time validation with debouncing for better UX
      const timeoutId = setTimeout(() => {
        validateJustification(value);
      }, 300);

      // Cleanup timeout on next change
      return () => clearTimeout(timeoutId);
    }
  };

  // Enhanced form submission with comprehensive validation
  // Requirements: 1.3, 3.3, 3.4 - Form submission with loading states and error handling
  const handleSubmit = async () => {
    // Final validation before submission
    const finalValidation = validateJustification(justification);
    if (!finalValidation || !canSubmit) {
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      await createOverride({
        attendanceSessionId: sessionId,
        studentId: student.id,
        justificationNote: justification.trim(),
      });
    } catch (err) {
      console.error('Override submission failed:', err);
      setShowConfirmation(false);
    }
  };

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setJustification('');
      setShowConfirmation(false);
      setValidationErrors([]);
      setIsValidating(false);
      reset();
    }
  }, [isOpen, reset]);

  // Keyboard shortcuts for better UX
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (canSubmit) {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Character count feedback component
  const CharacterCountFeedback = () => (
    <div className="flex justify-between text-xs">
      <span
        className={cn(
          'transition-colors',
          charactersNeeded > 0
            ? 'text-red-600'
            : isValidLength
              ? 'text-green-600'
              : 'text-muted-foreground',
        )}
        aria-live="polite"
      >
        {charactersNeeded > 0
          ? `${charactersNeeded} more characters needed`
          : 'Minimum requirement met'}
      </span>
      <span
        className={cn(
          'transition-colors',
          charactersRemaining < 10 ? 'text-amber-600' : 'text-muted-foreground',
        )}
        aria-live="polite"
      >
        {characterCount}/100
      </span>
    </div>
  );

  // Confirmation warning component
  const ConfirmationWarning = () => (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-amber-800">Confirm Override</p>
          <p className="text-sm text-amber-700 mt-1">
            Are you sure you want to mark <strong>{student.name}</strong> as
            present? This action will be logged and cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );

  // Main form content with mobile-first responsive design
  const formContent = (
    <div className="space-y-4 sm:space-y-6">
      {/* Student Information Display - Enhanced for mobile */}
      <div className="space-y-2">
        <Label htmlFor="student-info" className="text-sm font-medium">
          Student Information
        </Label>
        <div
          className={cn(
            'p-3 sm:p-4 bg-muted rounded-lg border transition-colors',
            'hover:bg-muted/80',
          )}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-blue-100 border border-blue-200',
                'w-10 h-10 sm:w-12 sm:h-12',
                'flex-shrink-0',
              )}
            >
              <User
                className={cn('text-blue-700', 'h-5 w-5 sm:h-6 sm:w-6')}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-medium text-foreground truncate',
                  'text-sm sm:text-base',
                )}
              >
                {student.name}
              </p>
              <p
                className={cn(
                  'text-muted-foreground truncate',
                  'text-xs sm:text-sm',
                )}
              >
                {student.registrationNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Justification Input */}
      <div className="space-y-2">
        <Label htmlFor="justification" className="text-sm font-medium">
          Justification for Manual Override *
          <span className="text-xs text-muted-foreground ml-2 font-normal">
            (minimum 15 characters)
          </span>
        </Label>
        <Textarea
          id="justification"
          placeholder="Please provide a clear, descriptive reason for marking this student as present (e.g., 'Student had GPS issues but was physically present in class')"
          value={justification}
          onChange={handleJustificationChange}
          onKeyDown={handleKeyDown}
          className={cn(
            // Mobile-first responsive sizing
            'min-h-[120px] sm:min-h-[100px] resize-none transition-colors',
            // Touch-friendly sizing for mobile
            isTouchDevice && 'min-h-[140px] text-base',
            // Focus states with proper ring sizing
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            // Validation state colors
            validationErrors.length > 0 &&
              'border-red-500 focus:border-red-500 focus:ring-red-500',
            isValidJustification &&
              validationErrors.length === 0 &&
              characterCount >= 15 &&
              'border-green-500',
            // Mobile-specific padding and font size
            'px-3 py-2 sm:px-4 sm:py-3',
            'text-sm sm:text-base',
          )}
          disabled={isLoading}
          aria-describedby="justification-help justification-count justification-errors"
          aria-invalid={validationErrors.length > 0}
          aria-required="true"
          maxLength={100}
        />

        {/* Validation Errors Display - Requirements: 3.3, 3.4 */}
        {validationErrors.length > 0 && (
          <div id="justification-errors" className="space-y-1">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Validation Status Indicators */}
        {isValidating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating...</span>
          </div>
        )}

        <div id="justification-help" className="text-xs text-muted-foreground">
          Provide a clear, descriptive message explaining why this student
          should be marked as present. Must be at least 15 characters and
          contain at least 3 words.
        </div>
        <div id="justification-count">
          <CharacterCountFeedback />
        </div>

        {/* Additional Validation Feedback */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            {isValidLength ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(isValidLength ? 'text-green-600' : 'text-red-600')}
            >
              Character length (15-100)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {hasMinimumWords ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                hasMinimumWords ? 'text-green-600' : 'text-red-600',
              )}
            >
              Minimum 3 words ({wordCount} words)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isNotRepeatedChars ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                isNotRepeatedChars ? 'text-green-600' : 'text-red-600',
              )}
            >
              Not repeated characters
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Override Failed
              </p>
              <p className="text-sm text-red-700 mt-1">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Warning */}
      {showConfirmation && <ConfirmationWarning />}

      {/* Action Buttons - Enhanced for mobile */}
      <div
        className={cn(
          'flex gap-2 pt-4',
          // Stack buttons vertically on very small screens
          'flex-col xs:flex-row',
          // Ensure touch-friendly button heights
          isTouchDevice && 'gap-3',
        )}
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className={cn(
            'flex-1 transition-all duration-200',
            // Touch-friendly sizing
            isTouchDevice ? 'min-h-[48px] text-base' : 'min-h-[44px]',
            // Active state for touch devices
            'active:scale-95',
          )}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'flex-1 transition-all duration-200',
            // Touch-friendly sizing
            isTouchDevice ? 'min-h-[48px] text-base' : 'min-h-[44px]',
            // Active state for touch devices
            'active:scale-95',
            // Confirmation state styling
            showConfirmation &&
              'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className={cn(isMobile ? 'text-sm' : '')}>
                Processing...
              </span>
            </div>
          ) : showConfirmation ? (
            <span className={cn(isMobile ? 'text-sm' : '')}>
              Confirm Override
            </span>
          ) : (
            <span className={cn(isMobile ? 'text-sm' : '')}>
              Mark as Present
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  // Render mobile drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="px-4 pb-4 max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Mark Student as Present</DrawerTitle>
            <DrawerDescription>
              Provide a justification for manually marking this student as
              present. This action will be logged for audit purposes.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render desktop dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark Student as Present</DialogTitle>
          <DialogDescription>
            Provide a justification for manually marking this student as
            present. This action will be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ManualOverrideDialog;
