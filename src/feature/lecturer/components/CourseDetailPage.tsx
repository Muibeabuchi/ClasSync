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
} from 'lucide-react';
import AttendanceSessionModal from './AttendanceSessionModal';
import { StudentsTable } from './StudentsTable';
import { AttendanceSessionsTable } from './AttendanceSessionsTable';
import { useNavigate } from '@tanstack/react-router';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { ArchiveConfirmationModal } from './ArchiveConfirmationModal';
import { UnarchiveConfirmationModal } from './UnarchiveConfirmationModal';
import {
  useArchiveCourse,
  useUnarchiveCourse,
  useDeleteCourse,
  useUpdateCourse,
} from '../hooks/useCourseActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedCourseName, setEditedCourseName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Course action mutations
  const archiveMutation = useArchiveCourse();
  const unarchiveMutation = useUnarchiveCourse();
  const deleteMutation = useDeleteCourse();
  const updateCourseMutation = useUpdateCourse();

  // Extract data from courseDetails prop
  const courseData = courseDetails?.course || {
    id: courseId,
    name: 'Loading...',
    code: 'Loading...',
    enrolledCount: 0,
    description: 'Loading...',
  };

  const students = courseDetails?.students || [];

  // Check if there's an active attendance session
  const hasActiveSession = attendanceSessions.some(
    (session) => session.status === 'active' || session.status === 'pending',
  );

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

  // Function to refresh data after student operations
  const handleRefresh = () => {
    // This will be handled by TanStack Query's automatic refetching
    // when the mutation succeeds
  };

  const handleNavigate = () => {
    navigate({
      to: '/dashboard/lecturer/courses',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="link"
            className="cursor-pointer hover:bg-muted-foreground"
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
              <span className="font-medium">{courseData.code}</span>
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
          </div>
        </div>

        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          {/* Left side - Take Attendance */}
          <AttendanceSessionModal
            courseId={courseId}
            courseName={courseData.name}
            disabled={hasActiveSession || isArchived}
            // onStartSession={handleStartAttendance}
          >
            <Button
              className="w-full sm:w-auto text-sm"
              disabled={hasActiveSession || isArchived}
              title={
                isArchived
                  ? 'Cannot take attendance for archived courses'
                  : hasActiveSession
                    ? 'An attendance session is already active for this course'
                    : 'Start a new attendance session'
              }
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {hasActiveSession ? 'Session Active' : 'Take Attendance'}
            </Button>
          </AttendanceSessionModal>

          {/* Right side - Course Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Desktop: Individual buttons */}
            <div className="hidden sm:flex gap-2">
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
              <StudentsTable students={students} onRefresh={handleRefresh} />
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
    </div>
  );
};

export default CourseDetailPage;
