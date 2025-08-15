import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, AlertCircle, Edit3 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useManualAttendanceOverride } from '@/hooks/useManualAttendanceOverride';
import {
  OverrideStatusIcon,
  OverrideStatusBadge,
  type OverrideStatus,
  type OverrideInfo,
  type AttendanceInfo,
} from './OverrideStatusIndicators';
import {
  ARIA_LABELS,
  // ARIA_DESCRIPTIONS,
  KEYBOARD_NAVIGATION,
  // FocusManager,
  // ScreenReaderUtils,
  // accessibilityTesting,
} from '@/lib/accessibility/overrideAccessibility';
import type { Id } from 'convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

// Legacy format from original hook
interface LegacyStudentRecord {
  _id: Id<'attendanceRecords'>;
  student: {
    fullName: string;
    registrationNumber: string;
    _id: Id<'userProfiles'>;
  };
  checkedInAt: string;
  isManualOverride?: boolean;
  overrideReason?: string;
  overrideTimestamp?: string;
  status?: 'present' | 'absent';
}

// Enhanced format from override hook
interface EnhancedStudentRecord {
  student: {
    _id: Id<'userProfiles'>;
    fullName: string;
    email: string;
    registrationNumber: string;
    gender?: string;
  };
  attendanceRecord: {
    _id: Id<'attendanceRecords'>;
    checkedInAt: string;
    isManualOverride?: boolean;
    overrideReason?: string;
    overrideTimestamp?: string;
  } | null;
  status: 'present' | 'absent' | 'override';
  isPresent: boolean;
  isManualOverride: boolean;
  overrideInfo?: {
    overrideTimestamp?: string;
    overrideReason?: string;
    overriddenBy?: any;
    originalStatus?: string;
    auditLog?: any;
  } | null;
  checkInInfo?: {
    checkedInAt: string;
    location?: any;
    distance?: number;
  } | null;
  visualIndicators: {
    showOverrideIcon: boolean;
    showRegularCheckInIcon: boolean;
    showAbsentIndicator: boolean;
    statusColor: 'amber' | 'green' | 'red';
    statusLabel: string;
  };
}

type StudentRecord = LegacyStudentRecord | EnhancedStudentRecord;

interface StudentAttendanceRowProps {
  student: StudentRecord;
  canPerformOverrides: boolean;
  sessionId: Id<'attendanceSessions'>;
  sessionState: 'pending' | 'active' | 'complete';
}

// Helper functions to normalize data between legacy and enhanced formats
const isEnhancedRecord = (
  record: StudentRecord,
): record is EnhancedStudentRecord => {
  return 'visualIndicators' in record;
};

const getStudentInfo = (record: StudentRecord) => {
  return {
    id: record.student._id,
    fullName: record.student.fullName,
    registrationNumber: record.student.registrationNumber || '',
  };
};

const getAttendanceInfo = (record: StudentRecord) => {
  if (isEnhancedRecord(record)) {
    return {
      isPresent: record.isPresent,
      isManualOverride: record.isManualOverride,
      status: record.status,
      checkedInAt:
        record.checkInInfo?.checkedInAt ||
        record.overrideInfo?.overrideTimestamp,
      overrideReason: record.overrideInfo?.overrideReason,
      canShowOverrideButton: record.status === 'absent' && !record.isPresent,
    };
  } else {
    // Legacy format
    const isPresent = !!record.checkedInAt;
    const status = record.status || (record.checkedInAt ? 'present' : 'absent');
    return {
      isPresent,
      isManualOverride: record.isManualOverride || false,
      status,
      checkedInAt: record.checkedInAt,
      overrideReason: record.overrideReason,
      canShowOverrideButton: !isPresent && status === 'absent',
    };
  }
};

/**
 * Enhanced Override Action Button Component
 * Requirements: 3.1, 3.4 - Clearly labeled buttons with proper states and feedback
 */
interface OverrideActionButtonProps {
  studentName: string;
  studentId: Id<'userProfiles'>;
  sessionId: Id<'attendanceSessions'>;
  canPerformOverrides: boolean;
  sessionState: 'pending' | 'active' | 'complete';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

// Validation schema for the override form
const overrideFormSchema = z.object({
  justificationNote: z
    .string()
    .min(1, 'Justification is required')
    .refine(
      (value) => {
        const wordCount = value
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        return wordCount >= 3;
      },
      {
        message: 'Justification must contain at least 3 words',
      },
    )
    .refine((value) => value.trim().length <= 500, {
      message: 'Justification must not exceed 500 characters',
    }),
});

type OverrideFormData = z.infer<typeof overrideFormSchema>;

const OverrideActionButton = ({
  studentName,
  studentId,
  sessionId,
  canPerformOverrides,
  sessionState,
  // isLoading = false,
  disabled = false,
  className,
}: OverrideActionButtonProps) => {
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOverrideReason, setSelectedOverrideReason] = useState('');

  // Common override reasons for manual attendance verification
  const COMMON_OVERRIDE_REASONS = [
    'Student was present but had technical issues with check-in',
    'Student arrived late but was physically present',
    'Student forgot to check in but participated in class',
    'GPS/location services were not working properly',
    'Student had valid excuse and was marked present by instructor',
  ];

  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)'); // sm breakpoint
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  const { createOverride, isLoading } = useManualAttendanceOverride();

  // React Hook Form setup
  const form = useForm<OverrideFormData>({
    resolver: zodResolver(overrideFormSchema),
    defaultValues: {
      justificationNote: '',
    },
  });

  // Handle override reason selection
  const handleOverrideReasonChange = (value: string) => {
    setSelectedOverrideReason(value);
    if (value === 'custom') {
      form.setValue('justificationNote', '');
    } else {
      form.setValue('justificationNote', value);
    }
  };

  // Determine if button should be disabled
  const getDisabledState = () => {
    if (disabled) return { disabled: true, reason: 'Action disabled' };
    if (!canPerformOverrides)
      return { disabled: true, reason: 'No permission to override' };
    if (sessionState !== 'complete')
      return { disabled: true, reason: 'Session must be complete' };
    if (isLoading) return { disabled: true, reason: 'Processing...' };
    return { disabled: false, reason: '' };
  };

  const disabledState = getDisabledState();

  // Form submission handler
  const onSubmit = async (data: OverrideFormData) => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      await createOverride.mutateAsync({
        attendanceSessionId: sessionId,
        studentId: studentId,
        justificationNote: data.justificationNote.trim(),
      });

      // Close dialog and reset form on success
      setIsOverrideDialogOpen(false);
      setShowConfirmation(false);
      form.reset();
    } catch (error) {
      console.error('Override failed:', error);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setIsOverrideDialogOpen(false);
    setShowConfirmation(false);
    setSelectedOverrideReason('');
    form.reset();
  };

  const overrideContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Student Information */}
        <div className="space-y-2">
          <FormLabel>Student Information</FormLabel>
          <div
            className={cn(
              'p-3 bg-gray-50 rounded-md',
              // Mobile-first responsive padding
              'sm:p-4',
            )}
            role="region"
            aria-label="Student details"
          >
            <p
              className={cn(
                'font-medium',
                // Responsive text sizing
                'text-sm sm:text-base',
              )}
            >
              {studentName}
            </p>
          </div>
        </div>

        {/* Suggested Reasons */}
        <div className="space-y-3">
          <FormLabel>Select a reason for manual override</FormLabel>
          <RadioGroup
            value={selectedOverrideReason}
            onValueChange={handleOverrideReasonChange}
            className="space-y-2"
          >
            {COMMON_OVERRIDE_REASONS.map((reason, index) => (
              <div key={index} className="flex items-start space-x-2">
                <RadioGroupItem
                  value={reason}
                  id={`override-reason-${index}`}
                  className="mt-0.5 flex-shrink-0"
                />
                <Label
                  htmlFor={`override-reason-${index}`}
                  className={cn(
                    'text-sm font-normal cursor-pointer flex-1 leading-relaxed',
                    // Mobile-first responsive text
                    'text-xs sm:text-sm',
                  )}
                >
                  {reason}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="override-reason-custom" />
              <Label
                htmlFor="override-reason-custom"
                className={cn(
                  'text-sm font-normal cursor-pointer',
                  // Mobile-first responsive text
                  'text-xs sm:text-sm',
                )}
              >
                Custom reason
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Custom Justification Field - Only show when custom is selected */}
        {selectedOverrideReason === 'custom' && (
          <FormField
            control={form.control}
            name="justificationNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Custom Justification *
                  <span className="text-muted-foreground text-xs ml-1">
                    (minimum 3 words)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide a detailed reason for marking this student as present..."
                    className={cn(
                      // Mobile-first responsive sizing
                      'min-h-[120px] sm:min-h-[100px] resize-none',
                      // Touch-friendly sizing for mobile
                      isTouchDevice && 'min-h-[140px] text-base',
                      // Mobile-specific padding
                      'px-3 py-2 sm:px-4 sm:py-3',
                      'text-sm sm:text-base',
                    )}
                    disabled={isLoading}
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {field.value
                      ? `${
                          field.value
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length
                        } words`
                      : '0 words'}
                  </span>
                  <span>{field.value?.length || 0}/500 characters</span>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Show selected reason preview when not custom */}
        {selectedOverrideReason && selectedOverrideReason !== 'custom' && (
          <div
            className={cn(
              'p-3 bg-blue-50 border border-blue-200 rounded-md',
              'sm:p-4',
            )}
          >
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p
                  className={cn(
                    'font-medium text-blue-800',
                    'text-sm sm:text-base',
                  )}
                >
                  Selected Reason:
                </p>
                <p className={cn('text-blue-700 mt-1', 'text-xs sm:text-sm')}>
                  {selectedOverrideReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Alert */}
        {showConfirmation && (
          <div
            className={cn(
              'p-3 bg-amber-50 border border-amber-200 rounded-md',
              'sm:p-4',
            )}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p
                  className={cn(
                    'font-medium text-amber-800',
                    'text-sm sm:text-base',
                  )}
                >
                  Confirm Override
                </p>
                <p className={cn('text-amber-700 mt-1', 'text-xs sm:text-sm')}>
                  This will mark the student as present. This action will be
                  logged for audit purposes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className={cn(
            'flex gap-2 pt-4',
            // Stack on very small screens
            'flex-col xs:flex-row',
            // Ensure proper spacing for touch devices
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
            type="submit"
            className={cn(
              'flex-1 transition-all duration-200',
              // Touch-friendly sizing
              isTouchDevice ? 'min-h-[48px] text-base' : 'min-h-[44px]',
              // Active state for touch devices
              'active:scale-95',
              showConfirmation && 'bg-amber-600 hover:bg-amber-700',
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'animate-spin rounded-full border-2 border-white border-t-transparent',
                    'w-4 h-4',
                  )}
                  role="status"
                  aria-label="Processing override request"
                />
                <span aria-live="polite">Processing...</span>
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
      </form>
    </Form>
  );

  const buttonContent = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabledState.disabled}
            onClick={(e) => {
              // Prevent default and stop propagation to ensure we handle the click
              e.preventDefault();
              e.stopPropagation();

              // Only open dialog if not disabled
              if (!disabledState.disabled) {
                setIsOverrideDialogOpen(true);
              }
            }}
            aria-label={`Mark ${studentName} as present with manual override`}
            className={cn(
              // Mobile-first responsive sizing
              'min-h-[44px] min-w-[44px] transition-all duration-200',
              // Touch-friendly sizing for mobile
              isTouchDevice && 'min-h-[48px] min-w-[48px]',
              // Responsive text sizing
              'text-xs sm:text-sm',
              // Hover and active states
              !disabledState.disabled &&
                'hover:bg-green-50 hover:border-green-300',
              'active:scale-95',
              disabledState.disabled && 'opacity-50 cursor-not-allowed',
              className,
            )}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 w-4 h-4" />
            ) : (
              <>
                <UserPlus
                  className={cn(
                    'flex-shrink-0',
                    // Responsive icon sizing
                    'w-3 h-3 sm:w-4 sm:h-4',
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    // Always show text with margin
                    'ml-1',
                    // Responsive text sizing
                    'text-xs sm:text-sm',
                  )}
                >
                  Mark Present
                </span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        {disabledState.disabled && (
          <TooltipContent>
            <p className="text-sm">{disabledState.reason}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  // Always render with modal wrapper - let the button handle its own disabled state
  return (
    <>
      {isMobile ? (
        <Drawer
          open={isOverrideDialogOpen}
          onOpenChange={setIsOverrideDialogOpen}
        >
          <DrawerTrigger asChild>{buttonContent}</DrawerTrigger>
          <DrawerContent
            className={cn(
              'px-4 pb-4 max-h-[90vh]',
              // Safe area padding
              'pb-safe',
            )}
          >
            <DrawerHeader>
              <DrawerTitle>Mark Student as Present</DrawerTitle>
              <DrawerDescription className="text-sm">
                Provide a justification for manually marking this student as
                present.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto">{overrideContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={isOverrideDialogOpen}
          onOpenChange={setIsOverrideDialogOpen}
        >
          <DialogTrigger asChild>{buttonContent}</DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Mark Student as Present</DialogTitle>
              <DialogDescription>
                Provide a justification for manually marking this student as
                present.
              </DialogDescription>
            </DialogHeader>
            {overrideContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

/**
 * Student Attendance Row Component
 * Requirements: 1.2, 3.1, 3.4 - Display attendance status with action buttons
 */
export const StudentAttendanceRow = ({
  student,
  canPerformOverrides,
  sessionId,
  sessionState,
}: StudentAttendanceRowProps) => {
  // Normalize data from both formats
  const studentInfo = getStudentInfo(student);
  const attendanceInfo = getAttendanceInfo(student);

  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  // Convert to override status format
  const getOverrideStatus = (): OverrideStatus => {
    if (attendanceInfo.isManualOverride) return 'manual-override';
    if (attendanceInfo.isPresent) return 'present';
    return 'absent';
  };

  const getOverrideInfo = (): OverrideInfo | undefined => {
    if (!attendanceInfo.isManualOverride) return undefined;

    return {
      overrideTimestamp: attendanceInfo.checkedInAt,
      overrideReason: attendanceInfo.overrideReason,
      originalStatus: 'absent',
    };
  };

  const getAttendanceInfoForComponent = (): AttendanceInfo | undefined => {
    if (!attendanceInfo.isPresent) return undefined;

    return {
      checkedInAt: attendanceInfo.checkedInAt,
    };
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not checked in';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Mobile-first responsive breakpoints
  // const isMobile = useMediaQuery('(max-width: 640px)');
  // const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={cn(
          // Mobile-first responsive layout
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
          // Modern card styling with subtle borders
          'p-4 sm:p-5 border rounded-xl transition-all duration-200',
          // Touch-friendly spacing for mobile
          isTouchDevice && 'p-5',
          // Native app feel with subtle shadows
          'bg-card shadow-sm hover:shadow-md',
          // Status-based border styling using theme colors
          attendanceInfo.isManualOverride && 'border-l-4 border-l-warning',
          attendanceInfo.isPresent &&
            !attendanceInfo.isManualOverride &&
            'border-l-4 border-l-success',
          // Interactive states
          'hover:bg-accent/5 active:scale-[0.99]',
        )}
        role="listitem"
        aria-label={ARIA_LABELS.OVERRIDE_STATUS_DESCRIPTION(
          getOverrideStatus(),
          studentInfo.fullName,
        )}
        aria-describedby={`student-details-${studentInfo.id}`}
        // tabIndex={0}
        onKeyDown={(e) => {
          // Allow keyboard users to activate override button
          // But don't interfere with textarea input
          if (
            (e.key === KEYBOARD_NAVIGATION.ENTER ||
              e.key === KEYBOARD_NAVIGATION.SPACE) &&
            attendanceInfo.canShowOverrideButton &&
            canPerformOverrides &&
            // Only handle if not focused on a textarea or input
            !(
              e.target instanceof HTMLTextAreaElement ||
              e.target instanceof HTMLInputElement
            )
          ) {
            e.preventDefault();
            // Focus the override button
            const overrideButton = e.currentTarget.querySelector(
              '[aria-label*="Mark"][aria-label*="present"]',
            ) as HTMLButtonElement;
            overrideButton?.click();
          }
        }}
      >
        {/* Student Info Section */}
        <div
          className={cn(
            'flex items-center',
            // Mobile: full width, Desktop: flexible
            'w-full sm:w-auto sm:flex-1',
            // Responsive spacing
            'space-x-3 sm:space-x-4',
          )}
        >
          <OverrideStatusIcon
            status={getOverrideStatus()}
            overrideInfo={getOverrideInfo()}
            attendanceInfo={getAttendanceInfoForComponent()}
            size="md"
            showTooltip={true}
          />
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'flex items-center gap-2',
                // Responsive text sizing
                'text-sm sm:text-base',
              )}
            >
              <span
                id={`student-name-${studentInfo.id}`}
                className="font-medium truncate"
              >
                {studentInfo.fullName}
              </span>

              {attendanceInfo.isManualOverride && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex items-center gap-1 text-amber-600',
                          // Responsive text sizing
                          'text-xs sm:text-sm',
                        )}
                        aria-label="Manual override"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="hidden sm:inline">Override</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">Manual Override</p>
                        <p className="text-xs">
                          Manually marked as present at{' '}
                          {formatDateTime(attendanceInfo.checkedInAt)}
                        </p>
                        {attendanceInfo.overrideReason && (
                          <p className="text-xs">
                            Reason: {attendanceInfo.overrideReason}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div
              className={cn(
                'text-muted-foreground truncate',
                // Responsive text sizing
                'text-xs sm:text-sm',
              )}
              id={`student-reg-${studentInfo.id}`}
            >
              {studentInfo.registrationNumber}
            </div>
          </div>
        </div>

        {/* Status and Actions Section - Stack on mobile, row on desktop */}
        <div
          className={cn(
            'flex items-center justify-end',
            // Mobile: full width, Desktop: auto width
            'w-full sm:w-auto',
            // Responsive spacing
            'space-x-2 sm:space-x-4',
          )}
        >
          {/* Check-in time info */}
          <div
            className={cn(
              'text-right flex-1 sm:flex-none',
              // Responsive text sizing
              'text-xs sm:text-sm',
            )}
          >
            <div
              className="text-muted-foreground"
              id={`checkin-time-${studentInfo.id}`}
            >
              {formatDateTime(attendanceInfo.checkedInAt)}
            </div>

            {attendanceInfo.isManualOverride &&
              attendanceInfo.overrideReason && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'text-amber-600 truncate cursor-help',
                          // Responsive text constraints
                          'max-w-24 sm:max-w-32',
                          'text-xs',
                        )}
                        aria-label={`Override reason: ${attendanceInfo.overrideReason}`}
                      >
                        {attendanceInfo.overrideReason}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{attendanceInfo.overrideReason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
          </div>

          {/* Status Badge */}
          <div
            aria-describedby={`student-status-${studentInfo.id}`}
            className="flex-shrink-0"
          >
            <OverrideStatusBadge
              status={getOverrideStatus()}
              variant="default"
              size="sm"
              showIcon={true}
            />
          </div>

          {/* Override Action Button */}
          {attendanceInfo.canShowOverrideButton && (
            <div className="flex-shrink-0">
              <OverrideActionButton
                studentName={studentInfo.fullName}
                studentId={studentInfo.id}
                sessionId={sessionId}
                canPerformOverrides={canPerformOverrides}
                sessionState={sessionState}
                disabled={!canPerformOverrides}
                className={cn(
                  // Mobile-specific styling
                  isMobile && 'text-xs',
                  // Touch-friendly sizing
                  isTouchDevice && 'min-h-[48px] min-w-[48px]',
                )}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentAttendanceRow;
