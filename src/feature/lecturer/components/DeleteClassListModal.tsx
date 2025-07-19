import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteClassListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classListName: string;
  onConfirmDelete: () => void;
}

export const DeleteClassListModal = ({
  open,
  onOpenChange,
  classListName,
  onConfirmDelete,
}: DeleteClassListModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete ClassList</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete the ClassList{' '}
            <span className="font-medium text-foreground">
              `{classListName}`
            </span>
            ?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone. The class list will be permanently
            removed and detached from all associated courses.
          </p>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete ClassList
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
