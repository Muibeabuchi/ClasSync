import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  BookOpen,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Users,
  Clock,
  AlertCircle,
  Archive,
  RotateCcw,
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
  // const isLoading = archiveMutation.isPending || unarchiveMutation.isPending;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          >
            Active
          </Badge>
        );
      case 'archived':
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Archive className="h-3 w-3 mr-1" />
            Archived
          </Badge>
        );
      case 'completed':
        return <Badge>Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  return (
    <Card
      className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        isArchived
          ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
          : ''
      }`}
    >
      {/* Archived Course Overlay */}
      {isArchived && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-2 right-[-32px] w-24 h-6 bg-slate-500/20 dark:bg-slate-600/30 rotate-45 flex items-center justify-center">
            <Archive className="h-3 w-3 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
      )}

      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl transition-colors ${
                isArchived
                  ? 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  : 'bg-primary/10 group-hover:bg-primary/20'
              }`}
            >
              <BookOpen
                className={`h-5 w-5 ${
                  isArchived
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-primary'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle
                className={`text-lg font-semibold transition-colors truncate ${
                  isArchived
                    ? 'text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    : 'group-hover:text-primary'
                }`}
              >
                {course.courseName}
              </CardTitle>
              <CardDescription
                className={`text-sm font-medium mt-0.5 ${
                  isArchived ? 'text-slate-500 dark:text-slate-400' : ''
                }`}
              >
                {course.courseCode}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(course.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled={isArchived}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isArchived ? (
                  <DropdownMenuItem
                    onClick={() => setShowUnarchiveModal(true)}
                    disabled={unarchiveMutation.isPending}
                    className="text-emerald-600 dark:text-emerald-400"
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
                    onClick={() => setShowArchiveModal(true)}
                    disabled={archiveMutation.isPending}
                    className="text-amber-600 dark:text-amber-400"
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
                  onClick={handleDeleteClick}
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
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0">
        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-1 ${
                isArchived
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'bg-secondary/20'
              }`}
            >
              <FileText
                className={`h-4 w-4 ${
                  isArchived
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-secondary'
                }`}
              />
            </div>
            <div
              className={`text-lg font-semibold ${
                isArchived ? 'text-slate-600 dark:text-slate-300' : ''
              }`}
            >
              {course.stats?.classlistCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">Classlists</div>
          </div>

          <div className="text-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-1 ${
                isArchived ? 'bg-slate-100 dark:bg-slate-800' : 'bg-primary/20'
              }`}
            >
              <Users
                className={`h-4 w-4 ${
                  isArchived
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-primary'
                }`}
              />
            </div>
            <div
              className={`text-lg font-semibold ${
                isArchived ? 'text-slate-600 dark:text-slate-300' : ''
              }`}
            >
              {course.stats?.totalStudents || 0}
            </div>
            <div className="text-xs text-muted-foreground">Students</div>
          </div>

          <div className="text-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-1 ${
                isArchived ? 'bg-slate-100 dark:bg-slate-800' : 'bg-accent/20'
              }`}
            >
              <Clock
                className={`h-4 w-4 ${
                  isArchived
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-accent'
                }`}
              />
            </div>
            <div
              className={`text-lg font-semibold ${
                isArchived ? 'text-slate-600 dark:text-slate-300' : ''
              }`}
            >
              {course.stats?.sessionsHeld || 0}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>

        {/* Pending Requests Alert - Only show for active courses */}
        {!isArchived ? (
          course?.stats?.pendingRequests &&
          course?.stats?.pendingRequests > 0 ? (
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg mb-4 group-hover:shadow-sm transition-all">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {course.stats.pendingRequests} pending request
                  {course.stats.pendingRequests !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                Review
              </Button>
            </div>
          ) : null
        ) : null}

        {/* Action Button */}
        <Button
          onClick={handleViewCourse}
          className="w-full"
          variant={isArchived ? 'outline' : 'default'}
          disabled={isArchived}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {isArchived ? 'Course Archived' : 'View Course'}
        </Button>
      </CardContent>

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
    </Card>
  );
};
