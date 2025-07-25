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
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteClassListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classListName: string;
  onConfirmDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteClassListModal = ({
  open,
  onOpenChange,
  classListName,
  onConfirmDelete,
  isDeleting = false,
}: DeleteClassListModalProps) => {
  const handleDelete = async () => {
    try {
      await onConfirmDelete();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Delete failed:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete Class List</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete the class list{' '}
            <span className="font-semibold text-foreground">
              "{classListName}"
            </span>
            ?
            <br />
            <br />
            This action cannot be undone. All students in this class list will
            be permanently removed. However, if this class list is currently
            being used in any active courses, the deletion will be prevented.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Class List'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
