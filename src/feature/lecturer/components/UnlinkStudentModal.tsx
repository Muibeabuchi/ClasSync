import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserX } from 'lucide-react';
import { useUnlinkStudentFromCourse } from '@/feature/attendance/api';
import { toast } from 'sonner';
import type { Id } from 'convex/_generated/dataModel';

interface Student {
  id: string;
  name: string;
  email: string;
  gender: string;
  regNumber: string;
  department: string;
  attendanceRate: number;
  courseAttendanceListId: string;
}

interface UnlinkStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UnlinkStudentModal = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}: UnlinkStudentModalProps) => {
  const [isUnlinking, setIsUnlinking] = useState(false);
  const unlinkMutation = useUnlinkStudentFromCourse();

  const handleUnlink = async () => {
    if (!student) return;

    setIsUnlinking(true);
    try {
      await unlinkMutation.mutateAsync({
        courseAttendanceListId:
          student.courseAttendanceListId as Id<'courseAttendanceList'>,
      });

      toast.success('Student unlinked successfully', {
        description: `${student.name} has been removed from the course.`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to unlink student', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  if (!student) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-destructive" />
            Unlink Student
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to unlink this student from the course?
                This action cannot be undone.
              </p>

              {/* Student Info Card */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={student.name} />
                    <AvatarFallback className="text-sm">
                      {student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {student.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {student.regNumber}
                    </p>
                  </div>
                  <Badge
                    variant={
                      student.attendanceRate >= 75
                        ? 'default'
                        : student.attendanceRate >= 50
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {student.attendanceRate}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium text-foreground truncate">
                      {student.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <p className="font-medium text-foreground">
                      {student.gender}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium text-foreground">
                      {student.department}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <strong className="text-destructive">Warning:</strong> This will
                remove the student from the course and all their attendance
                records will remain but they won&apos;t be able to take future
                attendance.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnlinking}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnlink}
            disabled={isUnlinking}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isUnlinking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Unlinking...
              </>
            ) : (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Unlink Student
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
