import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import {
  Users,
  // BookOpen,
  BarChart,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  ArrowLeft,
  Archive,
  RotateCcw,
  Trash2,
  MoreVertical,
  Edit2,
  Check,
  X,
  Calendar,
  Clock,
  Copy,
} from 'lucide-react';
import AttendanceSessionModal from './AttendanceSessionModal';
import { StudentsTable } from './StudentsTable';
import { AttendanceSessionsTable } from './AttendanceSessionsTable';
import { useNavigate } from '@tanstack/react-router';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { ArchiveConfirmationModal } from './ArchiveConfirmationModal';
import { UnarchiveConfirmationModal } from './UnarchiveConfirmationModal';
import { DeleteScheduleConfirmationModal } from './DeleteScheduleConfirmationModal';
import CourseScheduleModal from './CourseScheduleModal';
import { toast } from 'sonner';
import {
  useArchiveCourse,
  useUnarchiveCourse,
  useDeleteCourse,
  useUpdateCourse,
} from '../hooks/useCourseActions';
import { useDeleteScheduleItem } from '@/feature/course/api/delete-schedule-item';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AttendanceExportDropdown } from '@/components/attendance/AttendanceExportDropdown';

import type {
  GetAttendanceSessionsReturnType,
  GetCourseDetailsReturnType,
} from 'convex/schema';
import type { Id } from 'convex/_generated/dataModel';
// import { Link } from '@tanstack/react-router';
interface CourseDetailPageProps {
  courseId: Id<'courses'>;
  courseDetails: GetCourseDetailsReturnType;
  attendanceSessions: GetAttendanceSessionsReturnType;
}

const CourseDetailPage = ({
  courseId,
  courseDetails,
  attendanceSessions,
}: CourseDetailPageProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteScheduleModal, setShowDeleteScheduleModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<{
    day: string;
    timeRange: string;
  } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedCourseName, setEditedCourseName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Course action mutations
  const archiveMutation = useArchiveCourse();
  const unarchiveMutation = useUnarchiveCourse();
  const deleteMutation = useDeleteCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteScheduleItem = useDeleteScheduleItem();

  // Extract data from courseDetails prop
  const courseData = courseDetails?.course || {
    id: courseId,
    name: 'Loading...',
    code: 'Loading...',
    enrolledCount: 0,
    description: 'Loading...',
    schedule: [],
  };

  const students = courseDetails?.students || [];

  // Check if there's an active attendance session
  const hasActiveSession = attendanceSessions.some(
    (session) => session.status === 'active',
  );

  // Check if there are any students enrolled in the course
  const hasStudents = students.length > 0;

  // Analytics calculations - use data from courseDetails.analytics or calculate from students
  const analytics = courseDetails?.analytics || {
    avgAttendance: 0,
    bestStudent: null,
    worstStudent: null,
    lowAttendanceCount: 0,
  };

  const avgAttendance = analytics.avgAttendance;
  const bestStudent = analytics.bestStudent;
  const worstStudent = analytics.worstStudent;
  const lowAttendanceCount = analytics.lowAttendanceCount;

  // Check if course is archived
  const isArchived = courseData.status === 'archived';

  // Text truncation utility
  const truncateText = (
    text: string,
    mobileLimit: number = 15,
    desktopLimit: number = 25,
  ) => {
    if (text.length <= mobileLimit) return text;

    // For display purposes, we'll show different lengths based on screen size
    // This is handled via CSS classes, but we'll provide both versions
    return {
      mobile:
        text.length > mobileLimit
          ? text.substring(0, mobileLimit) + '...'
          : text,
      desktop:
        text.length > desktopLimit
          ? text.substring(0, desktopLimit) + '...'
          : text,
      full: text,
    };
  };

  // Get truncated versions of course name
  const courseNameDisplay =
    typeof courseData.name === 'string'
      ? truncateText(courseData.name)
      : courseData.name;

  // Initialize edited course name when courseData changes
  useEffect(() => {
    if (courseData.name && courseData.name !== 'Loading...') {
      setEditedCourseName(courseData.name);
    }
  }, [courseData.name]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  // Inline editing handlers
  const handleStartEditing = () => {
    if (!isArchived) {
      setIsEditingName(true);
      setEditedCourseName(courseData.name);
    }
  };

  const handleCancelEditing = () => {
    setIsEditingName(false);
    setEditedCourseName(courseData.name);
  };

  const handleSaveCourseName = async () => {
    const trimmedName = editedCourseName.trim();

    if (!trimmedName) {
      return; // Don't save empty names
    }

    // Validate length (max 50 characters for database storage)
    if (trimmedName.length > 50) {
      // Don't save names that are too long
      return;
    }

    if (trimmedName === courseData.name) {
      setIsEditingName(false);
      return; // No changes made
    }

    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        courseName: trimmedName,
      });
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update course name:', error);
      // Reset to original name on error
      setEditedCourseName(courseData.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveCourseName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditing();
    }
  };

  // Copy course code handler
  const handleCopyCourseCode = async () => {
    try {
      await navigator.clipboard.writeText(courseData.code);
      toast.success('Course code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy course code:', error);
      toast.error('Failed to copy course code');
    }
  };

  // Action handlers
  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync({ courseId });
      setShowArchiveModal(false);
    } catch (error) {
      console.error('Failed to archive course:', error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveMutation.mutateAsync({ courseId });
      setShowUnarchiveModal(false);
    } catch (error) {
      console.error('Failed to unarchive course:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ courseId });
      setShowDeleteModal(false);
      // Navigate back to courses page after successful deletion
      navigate({
        to: '/dashboard/lecturer/courses',
      });
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleNavigate = () => {
    navigate({
      to: '/dashboard/lecturer/courses',
    });
  };

  // Helper function to format time range
  const formatTimeRange = (startTime: string, endTime: string): string => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Handle showing delete confirmation for schedule items
  const handleShowDeleteScheduleConfirmation = (
    day: string,
    startTime: string,
    endTime: string,
  ) => {
    const timeRange = formatTimeRange(startTime, endTime);
    setScheduleToDelete({ day, timeRange });
    setShowDeleteScheduleModal(true);
  };

  // Handle deleting individual schedule items
  const handleDeleteScheduleItem = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteScheduleItem.mutateAsync({
        courseId,
        day: scheduleToDelete.day,
      });
      toast.success('Schedule deleted successfully');
      setShowDeleteScheduleModal(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error('Failed to delete schedule item:', error);
      toast.error('Failed to delete schedule item');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="link"
            className="cursor-pointer hover:bg-muted-foreground sm:hidden mr-4"
            onClick={handleNavigate}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
          <div className="flex-1 min-w-0">
            {/* Inline Editable Course Name */}
            <div className="flex items-center gap-2 mb-1">
              {isEditingName ? (
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={editedCourseName}
                      onChange={(e) => setEditedCourseName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSaveCourseName}
                      className="text-xl sm:text-2xl font-bold h-auto py-1 px-2 border-2 border-primary"
                      disabled={updateCourseMutation.isPending}
                      maxLength={50}
                      placeholder="Enter course name"
                    />
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveCourseName}
                        disabled={
                          updateCourseMutation.isPending ||
                          editedCourseName.trim().length === 0
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEditing}
                        disabled={updateCourseMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {/* Character count indicator */}
                  <div className="text-xs text-muted-foreground">
                    {editedCourseName.length}/50 characters
                    {editedCourseName.length > 25 && (
                      <span className="ml-2 text-amber-600">
                        • Will be truncated on small screens
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 group">
                  {typeof courseNameDisplay === 'object' ? (
                    <>
                      {/* Mobile version - show truncated at 15 chars */}
                      <h1
                        className="text-xl font-bold sm:hidden"
                        title={courseNameDisplay.full}
                      >
                        {courseNameDisplay.mobile}
                      </h1>
                      {/* Desktop version - show truncated at 25 chars */}
                      <h1
                        className="hidden sm:block text-2xl font-bold"
                        title={courseNameDisplay.full}
                      >
                        {courseNameDisplay.desktop}
                      </h1>
                    </>
                  ) : (
                    <h1 className="text-xl sm:text-2xl font-bold">
                      {courseNameDisplay}
                    </h1>
                  )}
                  {!isArchived && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEditing}
                      className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Edit course name"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground">
              {/* Course Code with Copy Functionality */}
              <div className="flex items-center gap-2">
                {/* // eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                <button
                  className="font-medium text-primary cursor-pointer hover:text-primary/80 transition-colors select-all"
                  onClick={handleCopyCourseCode}
                  title="Click to copy course code"
                >
                  {courseData.code}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCourseCode}
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  title="Copy course code"
                >
                  <Copy className="h-3 w-3 text-primary" />
                </Button>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Status: {courseData.status}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                {courseData.enrolledCount}
              </span>
            </div>

            {/* Course Code Sharing Info */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                💡 Share this course code with your students for enrollment
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          {/* Left side - Take Attendance */}
          <div className="flex flex-col gap-2">
            <AttendanceSessionModal
              courseId={courseId}
              courseName={courseData.name}
              disabled={hasActiveSession || isArchived || !hasStudents}
              // onStartSession={handleStartAttendance}
            >
              <Button
                className="w-full sm:w-auto text-sm"
                disabled={hasActiveSession || isArchived || !hasStudents}
                title={
                  isArchived
                    ? 'Cannot take attendance for archived courses'
                    : hasActiveSession
                      ? 'An attendance session is already active for this course'
                      : !hasStudents
                        ? 'Cannot take attendance: No students are enrolled in this course'
                        : 'Start a new attendance session'
                }
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                {hasActiveSession ? 'Session Active' : 'Take Attendance'}
              </Button>
            </AttendanceSessionModal>

            {/* Hint text for when no students are enrolled */}
            {!hasStudents && !isArchived && (
              <p className="text-xs text-primary text-center sm:text-left opacity-75 px-2 sm:px-0">
                Add students to start taking attendance
              </p>
            )}
          </div>

          {/* Right side - Course Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Desktop: Individual buttons */}
            <div className="hidden sm:flex gap-2">
              {/* Export button for archived courses */}
              {isArchived && attendanceSessions.length > 0 && (
                <AttendanceExportDropdown
                  courseId={courseId}
                  courseName={courseData.name}
                  courseCode={courseData.code}
                  className="text-sm"
                />
              )}

              {isArchived ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Unarchive button clicked');
                    setShowUnarchiveModal(true);
                  }}
                  disabled={unarchiveMutation.isPending}
                  className="text-sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Unarchive
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Archive button clicked');
                    setShowArchiveModal(true);
                  }}
                  disabled={archiveMutation.isPending}
                  className="text-sm"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete button clicked');
                  setShowDeleteModal(true);
                }}
                disabled={deleteMutation.isPending}
                className="text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Mobile: Dropdown menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Course Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Export option for archived courses with attendance sessions */}
                  {isArchived && attendanceSessions.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        Export Data
                      </div>
                      <div className="px-2 pb-2">
                        <AttendanceExportDropdown
                          courseId={courseId}
                          courseName={courseData.name}
                          courseCode={courseData.code}
                          className="w-full text-sm"
                        />
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {isArchived ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Mobile Unarchive clicked');
                        setShowUnarchiveModal(true);
                      }}
                      disabled={unarchiveMutation.isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Unarchive Course
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Mobile Archive clicked');
                        setShowArchiveModal(true);
                      }}
                      disabled={archiveMutation.isPending}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Course
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Mobile Delete clicked');
                      setShowDeleteModal(true);
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="overview"
            className="transition-all text-xs sm:text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="transition-all text-xs sm:text-sm"
          >
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Class Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">
                        {courseData.enrolledCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Students
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{avgAttendance}%</p>
                      <p className="text-xs text-muted-foreground">
                        Avg Attendance
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {bestStudent && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">
                          Best: {bestStudent.name}
                        </span>
                        <Badge variant="secondary">
                          {bestStudent.attendanceRate}%
                        </Badge>
                      </div>
                    )}

                    {worstStudent && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">
                          Needs Attention: {worstStudent.name}
                        </span>
                        <Badge variant="destructive">
                          {worstStudent.attendanceRate}%
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        {lowAttendanceCount} students below 50% attendance
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Schedule Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Lecture Schedule
                    </CardTitle>
                    {!isArchived && (
                      <CourseScheduleModal
                        courseId={courseId}
                        courseName={courseData.name}
                        currentSchedule={courseData.schedule || []}
                        disabled={isArchived}
                        onSuccess={() => {
                          // Data will update automatically via Convex reactivity
                        }}
                      >
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </CourseScheduleModal>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {courseData.schedule && courseData.schedule.length > 0 ? (
                    <div className="space-y-2">
                      {courseData.schedule.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                        >
                          {/* Day Badge */}
                          <Badge
                            variant="secondary"
                            className="shrink-0 min-w-12 justify-center text-xs"
                          >
                            {item.day.slice(0, 3)}
                          </Badge>

                          {/* Time Display */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground truncate">
                              {formatTimeRange(item.startTime, item.endTime)}
                            </span>
                          </div>

                          {/* Delete Button - Only show for non-archived courses */}
                          {!isArchived && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleShowDeleteScheduleConfirmation(
                                  item.day,
                                  item.startTime,
                                  item.endTime,
                                )
                              }
                              className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                              title={`Remove ${item.day} schedule`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No schedule set
                      </p>
                      {!isArchived && (
                        <CourseScheduleModal
                          courseId={courseId}
                          courseName={courseData.name}
                          currentSchedule={[]}
                          disabled={isArchived}
                        >
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Add Schedule
                          </Button>
                        </CourseScheduleModal>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Attendance Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceSessionsTable
                  sessions={attendanceSessions.map((session, index) => ({
                    ...session,
                    sn: index + 1,
                  }))}
                  // courseId={courseId}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                Manage students enrolled in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentsTable students={students} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        courseName={courseData.name}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      <ArchiveConfirmationModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        courseName={courseData.name}
        onConfirm={handleArchive}
        isLoading={archiveMutation.isPending}
      />

      <UnarchiveConfirmationModal
        isOpen={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        courseName={courseData.name}
        onConfirm={handleUnarchive}
        isLoading={unarchiveMutation.isPending}
      />

      <DeleteScheduleConfirmationModal
        isOpen={showDeleteScheduleModal}
        onClose={() => {
          setShowDeleteScheduleModal(false);
          setScheduleToDelete(null);
        }}
        onConfirm={handleDeleteScheduleItem}
        dayName={scheduleToDelete?.day || ''}
        timeRange={scheduleToDelete?.timeRange || ''}
        isLoading={deleteScheduleItem.isPending}
      />
    </div>
  );
};

export default CourseDetailPage;
