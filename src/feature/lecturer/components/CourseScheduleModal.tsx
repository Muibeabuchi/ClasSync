import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import CourseSchedulePicker, {
  type LectureSchedule,
} from '@/components/course/CourseSchedulePicker';
import { useUpdateCourseSchedule } from '@/feature/course/api/update-course-schedule';
import type { Id } from 'convex/_generated/dataModel';

interface CourseScheduleModalProps {
  courseId: Id<'courses'>;
  courseName: string;
  currentSchedule?: LectureSchedule[];
  disabled?: boolean;
  children: React.ReactNode;
  onSuccess?: () => void;
}

const CourseScheduleModal = ({
  courseId,
  courseName,
  currentSchedule = [],
  disabled = false,
  children,
  onSuccess,
}: CourseScheduleModalProps) => {
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState<LectureSchedule[]>(currentSchedule);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const updateScheduleMutation = useUpdateCourseSchedule();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update local schedule when currentSchedule prop changes
  useEffect(() => {
    setSchedule(currentSchedule);
  }, [currentSchedule]);

  const handleSubmit = async () => {
    if (schedule.length === 0) {
      toast.error('Please add at least one lecture day');
      return;
    }

    // setIsSubmitting(true);
    try {
      await updateScheduleMutation.mutateAsync({
        courseId,
        schedule,
      });

      toast.success('Course schedule updated successfully');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update course schedule:', error);
      toast.error('Failed to update course schedule');
    }
  };

  const handleCancel = () => {
    setSchedule(currentSchedule);
    setOpen(false);
  };

  const ScheduleContent = () => (
    <div className="space-y-6">
      <CourseSchedulePicker
        value={schedule}
        onChange={setSchedule}
        disabled={updateScheduleMutation.isPending}
      />

      {/* Current Schedule Summary */}
      {currentSchedule.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4" />
            Current Schedule
          </h4>
          <div className="space-y-2">
            {currentSchedule.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-medium">{item.day}</span>
                <span className="text-muted-foreground">
                  {formatTimeRange(item.startTime, item.endTime)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={updateScheduleMutation.isPending}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={updateScheduleMutation.isPending}
        className="w-full sm:w-auto"
      >
        {updateScheduleMutation.isPending ? 'Updating...' : 'Update Schedule'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild disabled={disabled}>
          {children}
        </DrawerTrigger>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Manage Course Schedule
            </DrawerTitle>
            <DrawerDescription>
              Set up the weekly lecture schedule for {courseName}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 overflow-y-auto flex-1">
            <ScheduleContent />
          </div>

          <DrawerFooter className="pt-4">
            <ActionButtons />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Manage Course Schedule
          </DialogTitle>
          <DialogDescription>
            Set up the weekly lecture schedule for {courseName}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
          <ScheduleContent />
        </div>

        <div className="pt-4 border-t mt-4">
          <ActionButtons />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to format time range
const formatTimeRange = (startTime: string, endTime: string): string => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export default CourseScheduleModal;
