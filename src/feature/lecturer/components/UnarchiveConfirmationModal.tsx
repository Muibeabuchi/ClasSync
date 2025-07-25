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
import { RotateCcw, CheckCircle } from 'lucide-react';

interface UnarchiveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseName: string;
  isLoading?: boolean;
}

export const UnarchiveConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  courseName,
  isLoading = false,
}: UnarchiveConfirmationModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <RotateCcw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <AlertDialogTitle className="text-lg">
              Unarchive Course
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              Are you sure you want to unarchive <strong>"{courseName}"</strong>
              ?
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                  <p className="font-medium mb-1">This action will:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Reactivate the course for new student enrollments</li>
                    <li>• Allow creation of new attendance sessions</li>
                    <li>• Make the course visible to students again</li>
                    <li>• Restore full course functionality</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              All existing data and attendance records will remain intact.
              Students will be able to join and participate in the course again.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Unarchiving...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Unarchive Course
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
