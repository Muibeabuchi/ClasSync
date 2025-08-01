import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  // CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import type { Doc, Id } from 'convex/_generated/dataModel';
import {
  MoreVertical,
  Trash2,
  Archive,
  RotateCcw,
  Users,
  FileText,
  Activity,
} from 'lucide-react';
import { useState } from 'react';
import { ArchiveConfirmationModal } from './ArchiveConfirmationModal';
import { UnarchiveConfirmationModal } from './UnarchiveConfirmationModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import {
  useArchiveCourse,
  useUnarchiveCourse,
  useDeleteCourse,
} from '../hooks/useCourseActions';

export const CourseCard = ({
  course,
  handleCourseNavigate,
}: {
  course: Doc<'courses'> & {
    stats?: {
      classlistCount: number;
      totalStudents: number;
      sessionsHeld: number;
      pendingRequests: number;
    };
  };
  handleCourseNavigate: (value: Id<'courses'>) => void;
}) => {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const archiveMutation = useArchiveCourse();
  const unarchiveMutation = useUnarchiveCourse();
  const deleteMutation = useDeleteCourse();

  const isArchived = course.status === 'archived';

  // Helper function to truncate course name on mobile
  const getTruncatedCourseName = (name: string) => {
    if (name.length <= 25) return name;
    return name.substring(0, 25) + '...';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-medium px-3 py-1 rounded-full">
            Active
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 font-medium px-3 py-1 rounded-full">
            Archived
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium px-3 py-1 rounded-full">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="font-medium px-3 py-1 rounded-full"
          >
            {status}
          </Badge>
        );
    }
  };
  const handleViewCourse = () => {
    handleCourseNavigate(course._id);
  };

  const handleArchiveConfirm = () => {
    archiveMutation.mutate(
      { courseId: course._id },
      {
        onSuccess: () => {
          setShowArchiveModal(false);
        },
      },
    );
  };

  const handleUnarchiveConfirm = () => {
    unarchiveMutation.mutate(
      { courseId: course._id },
      {
        onSuccess: () => {
          setShowUnarchiveModal(false);
        },
      },
    );
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(
      { courseId: course._id },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
        },
      },
    );
  };

  // Modal close handlers that prevent event propagation
  const handleArchiveModalClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowArchiveModal(false);
  };

  const handleUnarchiveModalClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowUnarchiveModal(false);
  };

  const handleDeleteModalClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowDeleteModal(false);
  };

  return (
    <Card
      className={`group relative overflow-hidden border hover:shadow-md transition-all duration-200 cursor-pointer ${
        isArchived ? 'opacity-75 hover:opacity-90' : 'hover:border-primary/20'
      }`}
      onClick={!isArchived ? handleViewCourse : undefined}
    >
      {/* Header */}
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <CardTitle
              className={`text-base sm:text-lg font-semibold mb-1 transition-colors ${
                isArchived
                  ? 'text-muted-foreground'
                  : 'group-hover:text-primary'
              }`}
              title={course.courseName}
            >
              <span className="sm:hidden">
                {getTruncatedCourseName(course.courseName)}
              </span>
              <span className="hidden text-sm sm:inline truncate">
                {getTruncatedCourseName(course.courseName)}
              </span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground">
              {course.courseCode}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 ml-3">
            {/* Pending Requests Notification */}
            {!isArchived &&
            course?.stats?.pendingRequests &&
            course?.stats?.pendingRequests > 0 ? (
              <div className="relative">
                <div className="flex items-center justify-center w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                  {course.stats.pendingRequests > 9
                    ? '9+'
                    : course.stats.pendingRequests}
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            ) : null}

            {getStatusBadge(course.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isArchived ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUnarchiveModal(true);
                    }}
                    disabled={unarchiveMutation.isPending}
                  >
                    {unarchiveMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Unarchiving...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Unarchive Course
                      </>
                    )}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowArchiveModal(true);
                    }}
                    disabled={archiveMutation.isPending}
                  >
                    {archiveMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Course
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick();
                  }}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Course
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 sm:flex-col sm:justify-center">
            <div className="flex items-center gap-2 sm:gap-1 sm:mb-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <div className="text-xs text-muted-foreground font-medium sm:hidden">
                Lists
              </div>
            </div>
            <div
              className={`text-sm sm:text-base font-semibold ${
                isArchived ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {course.stats?.classlistCount || 0}
            </div>
            <div className="hidden sm:block text-xs text-muted-foreground font-medium">
              Lists
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 sm:flex-col sm:justify-center">
            <div className="flex items-center gap-2 sm:gap-1 sm:mb-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <div className="text-xs text-muted-foreground font-medium sm:hidden">
                Students
              </div>
            </div>
            <div
              className={`text-sm sm:text-base font-semibold ${
                isArchived ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {course.stats?.totalStudents || 0}
            </div>
            <div className="hidden sm:block text-xs text-muted-foreground font-medium">
              Students
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 sm:flex-col sm:justify-center">
            <div className="flex items-center gap-2 sm:gap-1 sm:mb-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <div className="text-xs text-muted-foreground font-medium sm:hidden">
                Sessions
              </div>
            </div>
            <div
              className={`text-sm sm:text-base font-semibold ${
                isArchived ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {course.stats?.sessionsHeld || 0}
            </div>
            <div className="hidden sm:block text-xs text-muted-foreground font-medium">
              Sessions
            </div>
          </div>
        </div>
      </CardHeader>
      {/* Content */}

      {/* Confirmation Modals */}
      <ArchiveConfirmationModal
        isOpen={showArchiveModal}
        onClose={handleArchiveModalClose}
        onConfirm={handleArchiveConfirm}
        courseName={course.courseName}
        isLoading={archiveMutation.isPending}
      />
      <UnarchiveConfirmationModal
        isOpen={showUnarchiveModal}
        onClose={handleUnarchiveModalClose}
        onConfirm={handleUnarchiveConfirm}
        courseName={course.courseName}
        isLoading={unarchiveMutation.isPending}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        courseName={course.courseName}
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
};
