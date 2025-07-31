import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Badge } from '@/components/ui/badge';
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
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
import {
  Plus,
  BookOpen,
  Check,
  X,
  //  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateCourseMutation } from '@/feature/course/api/create-course-api';
import { useLecturerClassListQuery } from '@/feature/classList/api/get-lecturer-classLists';
import type { Id } from 'convex/_generated/dataModel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CourseSchedulePicker, {
  type LectureSchedule,
} from '@/components/course/CourseSchedulePicker';

const courseFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .min(3, 'Course name must be at least 3 characters'),
  code: z
    .string()
    .min(1, 'Course code is required')
    .min(2, 'Course code must be at least 2 characters'),
  classListIds: z
    .array(z.string())
    .min(1, 'At least one class list must be selected'),
  schedule: z
    .array(
      z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CreateCourseModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const CreateCourseModal = ({ children, onSuccess }: CreateCourseModalProps) => {
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState<LectureSchedule[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const { mutateAsync: createCourse } = useCreateCourseMutation();
  const { data: classLists } = useLecturerClassListQuery();
  const availableClassLists = classLists?.map((classList) => ({
    id: classList._id,
    name: classList.classListName,
    students: classList.numberOfStudent,
  }));

  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      code: '',
      classListIds: [],
      schedule: [],
    },
  });

  const getSelectedClassListsData = (classListIds: string[]) => {
    return availableClassLists?.filter((cl) => classListIds.includes(cl.id));
  };

  const resetForm = () => {
    form.reset();
    setSchedule([]);
  };

  const onSubmit = async (values: CourseFormValues) => {
    const classListIds = values.classListIds as Id<'classLists'>[];
    await createCourse({
      courseName: values.name,
      initialCourseCode: values.code,
      classListIds,
      schedule: schedule.length > 0 ? schedule : undefined,
    });

    toast.success('Course Created Successfully');

    resetForm();
    setOpen(false);
    onSuccess?.();
  };

  const FormContent = () => (
    <Form {...form}>
      <form
        id="course-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Introduction to Computer Science"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Code *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CS101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="classListIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Lists *</FormLabel>
              <div className="space-y-3">
                {/* Selected items as pills */}
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedClassListsData(field.value)?.map(
                      (classList) => (
                        <div
                          key={classList.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm font-medium shadow-sm"
                        >
                          <span className="truncate max-w-32">
                            {classList.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(
                                field.value?.filter(
                                  (id) => id !== classList.id,
                                ),
                              );
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {/* Dropdown selector */}
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && availableClassLists) {
                      const isSelected = field.value?.includes(value);
                      if (isSelected) {
                        field.onChange(
                          field.value?.filter((id) => id !== value),
                        );
                      } else {
                        field.onChange([...(field.value || []), value]);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue
                      placeholder={
                        field.value && field.value.length > 0
                          ? `${field.value.length} item${field.value.length > 1 ? 's' : ''} selected`
                          : 'Select class lists...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableClassLists?.map((classList) => (
                      <SelectItem
                        key={classList.id}
                        value={classList.id}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex items-center justify-center w-5 h-5">
                            {field.value?.includes(classList.id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {classList.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {classList.students} students
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Course Schedule (Optional) */}
        <div className="space-y-2">
          <FormLabel>Lecture Schedule (Optional)</FormLabel>
          <CourseSchedulePicker value={schedule} onChange={setSchedule} />
        </div>
      </form>
    </Form>
  );

  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
      <Button
        variant="outline"
        onClick={() => setOpen(false)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="course-form"
        disabled={!form.formState.isValid}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Course
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Create New Course
            </DrawerTitle>
            <DrawerDescription>
              Set up your course and connect student ClassLists
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 overflow-y-auto flex-1">
            <FormContent />
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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Create New Course
          </DialogTitle>
          <DialogDescription>
            Set up your course and connect student ClassLists
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
          <FormContent />
        </div>

        <div className="pt-4 border-t mt-4">
          <ActionButtons />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseModal;

// Loading skeleton component that mimics the CreateCourseModal structure
export const CreateCourseLoadingSkeleton = () => {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </DialogTitle>
        <DialogDescription>
          <Skeleton className="h-4 w-64" />
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Course Name Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Course Code Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Class Lists Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-3">
            {/* Selected pills area */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-40 rounded-full" />
            </div>

            {/* Dropdown selector */}
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        {/* Selected Class Lists Summary */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-2">
            {/* Class list items */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
            {/* Total students */}
            <div className="pt-2 border-t">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-32" />
      </div>
    </DialogContent>
  );
};
