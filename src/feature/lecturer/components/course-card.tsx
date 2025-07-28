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
  // FileText,
  // Users,
  // Clock,
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-medium px-3 py-1">
            Active
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 font-medium px-3 py-1">
            Archived
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium px-3 py-1">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium px-3 py-1">
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

  return (
    <Card
      className={`group relative overflow-hidden border hover:shadow-xl transition-all duration-300  cursor-pointer ${
        isArchived ? 'opacity-75 hover:opacity-90' : ''
      }`}
      onClick={handleViewCourse}
    >
      {/* Header */}
      <CardHeader className="p-8 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <CardTitle
              className={`text-xl font-semibold mb-2 transition-colors ${
                isArchived
                  ? 'text-muted-foreground'
                  : 'group-hover:text-primary'
              }`}
            >
              {course.courseName}
            </CardTitle>
            <CardDescription className="text-base font-medium">
              {course.courseCode}
            </CardDescription>
          </div>

          <div className="flex items-center gap-4 ml-6">
            {getStatusBadge(course.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem disabled={isArchived}>
                  <Edit className="h-4 w-4 mr-3" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-3" />
                        Unarchiving...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-3" />
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-3" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-3" />
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-3" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-3" />
                      Delete Course
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-1 ${
                isArchived ? 'text-muted-foreground' : ''
              }`}
            >
              {course.stats?.classlistCount || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Classlists
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-1 ${
                isArchived ? 'text-muted-foreground' : ''
              }`}
            >
              {course.stats?.totalStudents || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Students
            </div>
          </div>

          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-1 ${
                isArchived ? 'text-muted-foreground' : ''
              }`}
            >
              {course.stats?.sessionsHeld || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Sessions
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-8 pb-8">
        {/* Pending Requests Alert */}
        {!isArchived &&
        course?.stats?.pendingRequests &&
        course?.stats?.pendingRequests > 0 ? (
          <button
            className="flex items-center justify-between p-4 border rounded-xl mb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full">
                <AlertCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                {course.stats.pendingRequests} pending request
                {course.stats.pendingRequests !== 1 ? 's' : ''}
              </span>
            </div>
            <Button size="sm" variant="ghost" className="h-9 px-4 font-medium">
              Review
            </Button>
          </button>
        ) : null}

        {/* Action Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleViewCourse();
          }}
          className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-200 ${
            isArchived ? 'cursor-not-allowed' : 'shadow-sm'
          }`}
          disabled={isArchived}
          variant={isArchived ? 'secondary' : 'default'}
        >
          <BookOpen className="h-5 w-5 mr-3" />
          {isArchived ? 'Course Archived' : 'Open Course'}
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
