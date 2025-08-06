import {
  useAttendanceSessionById,
  useGetAttendanceSessionRecords,
} from '@/feature/attendance/api';
import { useAttendanceSessionWithOverrides } from '@/hooks/useManualAttendanceOverride';
// import { useGetCourseDetails } from '@/feature/course/api/get-course-with-analytics';
// import CourseDetailPage from '@/feature/lecturer/components/CourseDetailPage';
// import CourseDetailPageSkeleton from '@/feature/lecturer/components/CourseDetailPageSkeleton';
// import LecturerAttendancePage from '@/feature/lecturer/components/LecturerAttendancePage';
import LiveAttendancePage, {
  LiveAttendancePageSkeleton,
} from '@/feature/lecturer/components/LiveAttendancePage';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { Suspense, useEffect } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute(
  '/dashboard/lecturer/_courses/$lecturerCourseId/$attendanceSessionId',
)({
  params: {
    parse: (params) => {
      return {
        attendanceSessionId:
          params.attendanceSessionId as Id<'attendanceSessions'>,
        lecturerCourseId: params.lecturerCourseId as Id<'courses'>,
      };
    },
  },
  component: RouteComponent,
  loader: async ({ context, params }) => {
    // prefetch the checkedIn students ahead of time
    context.queryClient.prefetchQuery(
      convexQuery(api.attendance.getAttendanceSessionRecords, {
        attendanceSessionId: params.attendanceSessionId,
        courseId: params.lecturerCourseId,
      }),
    );

    await context.queryClient.ensureQueryData(
      convexQuery(api.attendance.getAttendanceSessionById, {
        courseId: params.lecturerCourseId,
        attendanceSessionId: params.attendanceSessionId,
      }),
    );
  },
  pendingComponent: LiveAttendancePageSkeleton,
});

// Helper function to ensure records are in the correct format for StudentAttendanceRow
const normalizeRecordsForComponent = (records: any[]) => {
  if (!records || records.length === 0) return [];

  // Check if records are already in the enhanced format
  if (records[0] && 'visualIndicators' in records[0]) {
    return records; // Already enhanced format
  }

  // Convert legacy format to enhanced format if needed
  return records.map((record) => ({
    student: record.student || {
      _id: record.studentId || record._id,
      fullName:
        record.fullName || record.student?.fullName || 'Unknown Student',
      registrationNumber:
        record.registrationNumber || record.student?.registrationNumber || '',
      email: record.email || record.student?.email || '',
    },
    attendanceRecord: record.checkedInAt
      ? {
          _id: record._id,
          checkedInAt: record.checkedInAt,
          isManualOverride: record.isManualOverride || false,
          overrideReason: record.overrideReason,
          overrideTimestamp: record.overrideTimestamp,
        }
      : null,
    status: record.status || (record.checkedInAt ? 'present' : 'absent'),
    isPresent: !!record.checkedInAt,
    isManualOverride: record.isManualOverride || false,
    overrideInfo: record.isManualOverride
      ? {
          overrideTimestamp: record.overrideTimestamp,
          overrideReason: record.overrideReason,
          originalStatus: 'absent',
        }
      : null,
    checkInInfo: record.checkedInAt
      ? {
          checkedInAt: record.checkedInAt,
          location: record.location,
          distance: record.distance,
        }
      : null,
    visualIndicators: {
      showOverrideIcon: record.isManualOverride || false,
      showRegularCheckInIcon: !!record.checkedInAt && !record.isManualOverride,
      showAbsentIndicator: !record.checkedInAt,
      statusColor: record.isManualOverride
        ? 'amber'
        : record.checkedInAt
          ? 'green'
          : 'red',
      statusLabel: record.isManualOverride
        ? 'Override'
        : record.checkedInAt
          ? 'Present'
          : 'Absent',
    },
  }));
};

// Helper function to adapt statistics format
const adaptStatisticsFormat = (
  stats: any,
  canPerformOverrides: boolean,
  overrideEligibility: any,
) => {
  if (!stats) return null;

  const formatTimeRemaining = (timeRemaining: number) => {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    totalEnrolledStudents: stats.totalEnrolledStudents || 0,
    totalAttendanceRecords: stats.totalAttendanceRecords || 0,
    automaticCheckIns: stats.automaticCheckIns || 0,
    manualOverrides: stats.manualOverrides || 0,
    absentStudents: stats.absentStudents || 0,
    overallAttendancePercentage: stats.overallAttendancePercentage || 0,
    canPerformOverrides: canPerformOverrides, // Ensure this is always boolean
    overrideWindowExpired: overrideEligibility
      ? !overrideEligibility.canOverride
      : false,
    overrideWindowRemaining: overrideEligibility?.canOverride
      ? formatTimeRemaining(overrideEligibility.timeRemaining)
      : undefined,
  };
};

function RouteComponent() {
  const { lecturerCourseId, attendanceSessionId } = Route.useParams();
  const navigate = useNavigate();

  // Use the enhanced hook for override functionality
  const {
    session,
    records,
    statistics,
    isLoading,
    canPerformOverrides,
    overrideEligibility,
  } = useAttendanceSessionWithOverrides(attendanceSessionId, {
    includeAbsentStudents: true,
  });

  // Fallback to original hooks if the new ones aren't available yet
  const { data: fallbackSession, error: sessionError } =
    useAttendanceSessionById({
      attendanceSessionId,
      courseId: lecturerCourseId,
    });
  const { data: fallbackRecords } = useGetAttendanceSessionRecords({
    attendanceSessionId,
    courseId: lecturerCourseId,
  });

  // Use enhanced data if available, otherwise fallback to original
  const attendanceSession = session || fallbackSession;

  // Handle session not found (only redirect if truly not found, not if cancelled)
  useEffect(() => {
    if (
      sessionError &&
      sessionError.message.includes('not found') &&
      !attendanceSession
    ) {
      toast.error('Session not found', {
        description: 'This attendance session could not be found.',
      });
      navigate({
        to: '/dashboard/lecturer/$courseId',
        params: { courseId: lecturerCourseId },
        replace: true,
      });
    }
  }, [sessionError, navigate, lecturerCourseId, attendanceSession]);

  // Get all records (both present and absent)
  // Use enhanced records if available (even if empty array), otherwise fallback
  const allRecords = records !== undefined ? records : fallbackRecords || [];

  // Pass all records to LiveAttendancePage - it will handle filtering internally
  const attendanceSessionRecords = normalizeRecordsForComponent(allRecords);

  // Adapt statistics format - ensure canPerformOverrides is always boolean
  const adaptedStatistics = adaptStatisticsFormat(
    statistics,
    canPerformOverrides || false,
    overrideEligibility,
  );

  // Show loading skeleton if we don't have essential data
  if (isLoading && !attendanceSession) {
    return <LiveAttendancePageSkeleton />;
  }

  // Don't render if we still don't have session data (and no error)
  if (!attendanceSession && !sessionError) {
    return <LiveAttendancePageSkeleton />;
  }

  // If there's an error, don't render anything (navigation will handle it)
  if (sessionError) {
    return <LiveAttendancePageSkeleton />;
  }

  return (
    <Suspense fallback={<LiveAttendancePageSkeleton />}>
      <LiveAttendancePage
        attendanceSession={attendanceSession}
        attendanceSessionRecords={attendanceSessionRecords}
        statistics={adaptedStatistics}
        canPerformOverrides={canPerformOverrides}
        overrideEligibility={overrideEligibility}
      />
    </Suspense>
  );
}
