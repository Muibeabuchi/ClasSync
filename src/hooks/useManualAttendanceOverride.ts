import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useConvexMutation, convexQuery } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
// import {
//   showOverrideSuccessToast,
//   showOverrideErrorToast,
// } from '../components/attendance/TimeWindowWarnings';
import {
  // OverrideError,
  // OverrideErrorType,
  // createOverrideError,
  parseConvexError,
} from '@/lib/errors/overrideErrors';
// import {
//   useOverrideLogger,
//   createErrorContext,
// } from '@/lib/logging/overrideLogger';

// interface ManualOverrideParams {
//   attendanceSessionId: Id<'attendanceSessions'>;
//   studentId: Id<'userProfiles'>;
//   justificationNote: string;
// }

// interface ManualOverrideOptions {
//   onSuccess?: (data: any) => void;
//   onError?: (error: Error) => void;
// }

interface ManualOverrideParams {
  attendanceSessionId: Id<'attendanceSessions'>;
  studentId: Id<'userProfiles'>;
  justificationNote: string;
}

/**
 * Custom hook for manual attendance override operations
 * Requirements: 1.4, 3.4, 4.4 - Comprehensive error handling with logging and contextual information
 */
export const useManualAttendanceOverride = () => {
  const createOverrideMutation = useConvexMutation(
    api.attendance.createManualAttendanceOverride,
  );

  const overrideMutation = useMutation({
    mutationFn: async (params: ManualOverrideParams) => {
      return await createOverrideMutation({
        attendanceSessionId: params.attendanceSessionId,
        studentId: params.studentId,
        justificationNote: params.justificationNote.trim(),
      });
    },
  });

  return {
    createOverride: overrideMutation.mutateAsync,
    isLoading: overrideMutation.isPending,
    error: overrideMutation.error,
    isSuccess: overrideMutation.isSuccess,
    reset: overrideMutation.reset,
    // Expose parsed error for UI components
    parsedError: overrideMutation.error
      ? parseConvexError(overrideMutation.error)
      : null,
  };
};

/**
 * Hook for updating lecturer override settings
 * Requirements: 5.3 - Lecturer settings management
 */
export const useLecturerOverrideSettings = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  // const { isAuthenticated } = useConvexAuth();
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationFn: useConvexMutation(
      api.attendance.updateLecturerOverrideSettings,
    ),
    onSuccess: (data) => {
      toast.success('Override settings updated successfully', {
        description: 'Your override preferences have been saved.',
      });

      // Invalidate queries that depend on lecturer settings
      queryClient.invalidateQueries({
        queryKey: ['convex', 'attendance.getAttendanceSessionWithOverrideInfo'],
      });

      // Call custom success handler if provided
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Settings update error:', error);

      let errorMessage = 'Failed to update settings';
      let errorDescription =
        'Please try again or contact support if the problem persists.';

      if (error instanceof Error) {
        if (error.message.includes('range')) {
          errorMessage = 'Invalid time window';
          errorDescription = 'Override window must be between 1 and 24 hours.';
        } else {
          errorDescription = error.message;
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });

      // Call custom error handler if provided
      options?.onError?.(error as Error);
    },
  });

  const updateSettings = async (overrideWindowHours: number) => {
    // if (!isAuthenticated) {
    //   throw new Error('Authentication required to update settings');
    // }

    // Validate settings
    if (overrideWindowHours < 1 || overrideWindowHours > 24) {
      throw new Error('Override window must be between 1 and 24 hours');
    }

    return updateSettingsMutation.mutateAsync({
      overrideWindowHours,
    });
  };

  return {
    updateSettings,
    isLoading: updateSettingsMutation.isPending,
    error: updateSettingsMutation.error,
    isSuccess: updateSettingsMutation.isSuccess,
    reset: updateSettingsMutation.reset,
  };
};

/**
 * Hook for fetching attendance session data with override information
 * Requirements: 2.1, 2.2, 2.3, 6.1 - Combine session data, attendance records, and statistics
 */
export const useAttendanceSessionWithOverrides = (
  attendanceSessionId: Id<'attendanceSessions'> | null,
  options?: {
    includeAbsentStudents?: boolean;
    includeHistoricalData?: boolean;
    enabled?: boolean;
  },
) => {
  const {
    includeAbsentStudents = false,
    includeHistoricalData = false,
    enabled = true,
  } = options || {};

  // Fetch session with override metadata
  const sessionQuery = useQuery(
    convexQuery(
      api.attendance.getAttendanceSessionWithOverrideInfo,
      attendanceSessionId && enabled
        ? { attendanceSessionId, currentTime: Date.now() }
        : 'skip',
    ),
  );

  // Fetch attendance records with override indicators
  const recordsQuery = useQuery(
    convexQuery(
      api.attendance.getAttendanceRecordsWithOverrides,
      attendanceSessionId && enabled
        ? { attendanceSessionId, includeAbsentStudents }
        : 'skip',
    ),
  );

  // Fetch comprehensive statistics
  const statisticsQuery = useQuery(
    convexQuery(
      api.attendance.getAttendanceStatistics,
      attendanceSessionId && enabled
        ? { attendanceSessionId, includeHistoricalData }
        : 'skip',
    ),
  );

  // Combine loading states
  const isLoading =
    sessionQuery.isLoading ||
    recordsQuery.isLoading ||
    statisticsQuery.isLoading;
  const isError =
    sessionQuery.isError || recordsQuery.isError || statisticsQuery.isError;
  const error =
    sessionQuery.error || recordsQuery.error || statisticsQuery.error;

  // Check if any data is still undefined (initial loading)
  const isInitialLoading =
    sessionQuery.data === undefined ||
    recordsQuery.data === undefined ||
    statisticsQuery.data === undefined;

  return {
    // Combined data
    session: sessionQuery.data,
    records: recordsQuery.data?.records || [],
    statistics: statisticsQuery.data || null,

    // Individual query data for granular access
    sessionData: sessionQuery.data,
    recordsData: recordsQuery.data,
    statisticsData: statisticsQuery.data,

    // Loading and error states
    isLoading: isInitialLoading && isLoading,
    isError,
    error,

    // Individual query states for fine-grained control
    sessionQuery: {
      isLoading: sessionQuery.isLoading,
      isError: sessionQuery.isError,
      error: sessionQuery.error,
      refetch: sessionQuery.refetch,
    },
    recordsQuery: {
      isLoading: recordsQuery.isLoading,
      isError: recordsQuery.isError,
      error: recordsQuery.error,
      refetch: recordsQuery.refetch,
    },
    statisticsQuery: {
      isLoading: statisticsQuery.isLoading,
      isError: statisticsQuery.isError,
      error: statisticsQuery.error,
      refetch: statisticsQuery.refetch,
    },

    // Utility functions
    refetchAll: () => {
      sessionQuery.refetch();
      recordsQuery.refetch();
      statisticsQuery.refetch();
    },

    // Derived state for UI convenience
    canPerformOverrides:
      sessionQuery.data?.userAccess?.canPerformOverrides || false,
    isLecturer: sessionQuery.data?.userAccess?.isLecturer || false,
    overrideEligibility: sessionQuery.data?.overrideEligibility || null,
    eligibilitySummary: sessionQuery.data?.eligibilitySummary || null,
  };
};

/**
 * Simplified hook for basic session data without override information
 * For use cases that don't need the full override functionality
 */
export const useAttendanceSession = (
  attendanceSessionId: Id<'attendanceSessions'> | null,
  courseId?: Id<'courses'>,
  enabled: boolean = true,
) => {
  const sessionQuery = useQuery(
    convexQuery(
      api.attendance.getAttendanceSessionById,
      attendanceSessionId && courseId && enabled
        ? { attendanceSessionId, courseId }
        : 'skip',
    ),
  );

  const recordsQuery = useQuery(
    convexQuery(
      api.attendance.getAttendanceSessionRecords,
      attendanceSessionId && courseId && enabled
        ? { attendanceSessionId, courseId }
        : 'skip',
    ),
  );

  return {
    session: sessionQuery.data,
    records: recordsQuery.data || [],
    isLoading: sessionQuery.isLoading || recordsQuery.isLoading,
    isError: sessionQuery.isError || recordsQuery.isError,
    error: sessionQuery.error || recordsQuery.error,
    refetch: () => {
      sessionQuery.refetch();
      recordsQuery.refetch();
    },
  };
};

/**
 * Hook for real-time attendance statistics
 * Optimized for dashboard and overview components
 */
export const useAttendanceStatistics = (
  attendanceSessionId: Id<'attendanceSessions'> | null,
  options?: {
    includeHistoricalData?: boolean;
    enabled?: boolean;
    refetchInterval?: number;
  },
) => {
  const {
    includeHistoricalData = false,
    enabled = true,
    refetchInterval,
  } = options || {};

  const statisticsQuery = useQuery({
    ...convexQuery(
      api.attendance.getAttendanceStatistics,
      attendanceSessionId && enabled
        ? { attendanceSessionId, includeHistoricalData }
        : 'skip',
    ),
    refetchInterval,
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  return {
    statistics: statisticsQuery.data,
    isLoading: statisticsQuery.isLoading,
    isError: statisticsQuery.isError,
    error: statisticsQuery.error,
    refetch: statisticsQuery.refetch,

    // Quick access to common statistics
    totalEnrolled: statisticsQuery.data?.totalEnrolledStudents || 0,
    totalPresent: statisticsQuery.data?.totalAttendanceRecords || 0,
    manualOverrides: statisticsQuery.data?.manualOverrides || 0,
    attendancePercentage:
      statisticsQuery.data?.overallAttendancePercentage || 0,
  };
};
