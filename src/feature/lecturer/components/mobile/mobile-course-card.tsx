import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Users,
  Activity,
  FileText,
  Archive,
  RotateCcw,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Id } from 'convex/_generated/dataModel';
import type { GetLecturerCoursesWithStatsReturnType } from 'convex/schema';
import { ArchiveConfirmationModal } from '../ArchiveConfirmationModal';
import { UnarchiveConfirmationModal } from '../UnarchiveConfirmationModal';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import {
  useArchiveCourse,
  useUnarchiveCourse,
  useDeleteCourse,
} from '../../hooks/useCourseActions';

interface MobileCourseCardProps {
  course: GetLecturerCoursesWithStatsReturnType[0];
  onCourseClick: (courseId: Id<'courses'>) => void;
}

const MobileCourseCard: React.FC<MobileCourseCardProps> = ({
  course,
  onCourseClick,
}) => {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const archiveMutation = useArchiveCourse();
  const unarchiveMutation = useUnarchiveCourse();
  const deleteMutation = useDeleteCourse();

  const isArchived = course.status === 'archived';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-medium px-2 py-1 text-xs">
            Active
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 font-medium px-2 py-1 text-xs">
            Archived
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium px-2 py-1 text-xs">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium px-2 py-1 text-xs">
            {status}
          </Badge>
        );
    }
  };

  const truncateCourseName = (name: string) => {
    return name.length > 30 ? `${name.substring(0, 27)}...` : name;
  };

  return (
    <>
      <Card
        className={cn(
          'mobile-tap-feedback transition-all duration-200',
          'border border-border/50 bg-card/50 backdrop-blur-sm',
          'hover:bg-card/80 hover:border-primary/20',
          'active:scale-[0.98]',
          isArchived && 'opacity-75 hover:opacity-90',
        )}
        onClick={() => onCourseClick(course._id)}
      >
        <CardContent className="p-4">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    course.status === 'active'
                      ? 'bg-green-500 shadow-sm shadow-green-500/50'
                      : 'bg-gray-400',
                  )}
                />
                <h3
                  className={cn(
                    'mobile-text-base font-semibold truncate',
                    isArchived ? 'text-muted-foreground' : 'text-foreground',
                  )}
                  title={course.courseName}
                >
                  {truncateCourseName(course.courseName)}
                </h3>
              </div>
              <p className="mobile-text-sm text-muted-foreground font-medium">
                {course.courseCode}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-3 shrink-0">
              {/* Pending Requests Notification */}
              {!isArchived &&
                course?.stats?.pendingRequests &&
                course?.stats?.pendingRequests > 0 && (
                  <div className="relative">
                    <div className="flex items-center justify-center w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                      {course.stats.pendingRequests > 9
                        ? '9+'
                        : course.stats.pendingRequests}
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                )}

              {getStatusBadge(course.status)}

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full touch-target-min mobile-tap-feedback"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isArchived ? (
                    <>
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
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <>
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
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
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

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-1 mb-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
              </div>
              <div
                className={cn(
                  'mobile-text-sm font-semibold',
                  isArchived ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {course.stats?.classlistCount || 0}
              </div>
              <div className="mobile-text-xs text-muted-foreground font-medium">
                Lists
              </div>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
              </div>
              <div
                className={cn(
                  'mobile-text-sm font-semibold',
                  isArchived ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {course.stats?.totalStudents || 0}
              </div>
              <div className="mobile-text-xs text-muted-foreground font-medium">
                Students
              </div>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="h-3 w-3 text-muted-foreground" />
              </div>
              <div
                className={cn(
                  'mobile-text-sm font-semibold',
                  isArchived ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {course.stats?.sessionsHeld || 0}
              </div>
              <div className="mobile-text-xs text-muted-foreground font-medium">
                Sessions
              </div>
            </div>
          </div>

          {/* Footer with last updated */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="mobile-text-xs text-muted-foreground">
              Updated {new Date(course._creationTime).toLocaleDateString()}
            </div>
            {course.stats?.pendingRequests &&
              course.stats.pendingRequests > 0 && (
                <div className="flex items-center gap-1 mobile-text-xs text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  {course.stats.pendingRequests} pending
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modals */}
      <ArchiveConfirmationModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchiveConfirm}
        courseName={course.courseName}
        isLoading={archiveMutation.isPending}
      />
      <UnarchiveConfirmationModal
        isOpen={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        onConfirm={handleUnarchiveConfirm}
        courseName={course.courseName}
        isLoading={unarchiveMutation.isPending}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        courseName={course.courseName}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default MobileCourseCard;
