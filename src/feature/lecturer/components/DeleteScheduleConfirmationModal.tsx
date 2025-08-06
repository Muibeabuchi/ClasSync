import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteScheduleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dayName: string;
  timeRange: string;
  isLoading?: boolean;
}

export const DeleteScheduleConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  dayName,
  timeRange,
  isLoading = false,
}: DeleteScheduleConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Schedule
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the {dayName} schedule?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <span className="font-medium">{dayName}</span>
              <span className="text-sm text-muted-foreground">{timeRange}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            This action cannot be undone. The schedule for {dayName} will be
            permanently removed.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Deleting...' : 'Delete Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
