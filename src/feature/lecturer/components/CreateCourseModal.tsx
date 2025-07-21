import { useState } from 'react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, BookOpen, Check, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateCourseMutation } from '@/feature/course/api/create-course-api';
import { useLecturerClassListQuery } from '@/feature/classList/api/get-lecturer-classLists';
import type { Id } from 'convex/_generated/dataModel';

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
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CreateCourseModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const CreateCourseModal = ({ children, onSuccess }: CreateCourseModalProps) => {
  const [open, setOpen] = useState(false);
  // const [selectedClassLists, setSelectedClassLists] = useState<
  //   Id<'classLists'>[] | null
  // >(null);

  const { mutateAsync: createCourse } = useCreateCourseMutation();
  const { data: classLists } = useLecturerClassListQuery();
  const availableClassLists = classLists?.map((classList) => ({
    id: classList._id,
    name: classList.classListName,
    batchYear: classList.yearGroup,
    department: classList.department,
    students: classList.numberOfStudent, // Assuming students is an array of student IDs
  }));

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      code: '',
      classListIds: [],
    },
  });

  // Mock data for ClassLists
  // const availableClassLists: ClassList[] = [
  //   {
  //     id: '1',
  //     name: 'Computer Science Year 3',
  //     batchYear: '2021/2022',
  //     department: 'Computer Science',
  //     students: 45,
  //   },
  //   {
  //     id: '2',
  //     name: 'Software Engineering Year 2',
  //     batchYear: '2022/2023',
  //     department: 'Computer Science',
  //     students: 38,
  //   },
  //   {
  //     id: '3',
  //     name: 'Information Technology Year 1',
  //     batchYear: '2023/2024',
  //     department: 'Computer Science',
  //     students: 52,
  //   },
  // ];

  const getSelectedClassListsData = (classListIds: string[]) => {
    return availableClassLists?.filter((cl) => classListIds.includes(cl.id));
  };

  const resetForm = () => {
    form.reset();
  };

  const onSubmit = async (values: CourseFormValues) => {
    // const selectedClassLists = getSelectedClassListsData(values.classListIds);
    // const totalStudents = selectedClassLists.reduce(
    //   (sum, cl) => sum + cl.students,
    //   0,
    // );
    // const classListNames = selectedClassLists.map((cl) => cl.name).join(', ');
    const classListIds = values.classListIds as Id<'classLists'>[];
    await createCourse({
      courseName: values.name,
      initialCourseCode: values.code,
      classListIds,
    });

    toast.success('Course Created Successfully');

    resetForm();
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Create New Course
          </DialogTitle>
          <DialogDescription>
            Set up your course and connect student ClassLists
          </DialogDescription>
        </DialogHeader>

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
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium shadow-sm"
                            >
                              <span>{classList.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(
                                    field.value?.filter(
                                      (id) => id !== classList.id,
                                    ),
                                  );
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* Dropdown selector */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-12 px-4 text-left font-normal"
                        >
                          {field.value && field.value.length > 0
                            ? `${field.value.length} item${field.value.length > 1 ? 's' : ''} selected`
                            : 'Select class lists...'}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-full flex flex-col p-0"
                        align="center"
                      >
                        <div className=" overflow-y-auto flex w-full flex-col gap-y-2">
                          {availableClassLists?.map((classList) => (
                            <Button
                              key={classList.id}
                              className={`flex items-center w-full bg-background text-primary space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                field.value?.includes(classList.id)
                                  ? 'bg-muted'
                                  : ''
                              }`}
                              onClick={() => {
                                const isSelected = field.value?.includes(
                                  classList.id,
                                );
                                if (isSelected) {
                                  field.onChange(
                                    field.value?.filter(
                                      (id) => id !== classList.id,
                                    ),
                                  );
                                } else {
                                  field.onChange([
                                    ...field.value,
                                    classList.id,
                                  ]);
                                }
                              }}
                            >
                              <div className="flex items-center justify-center w-5 h-5">
                                {field.value?.includes(classList.id) && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {classList.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {classList.department} • {classList.batchYear}{' '}
                                  • {classList.students} students
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('classListIds')?.length > 0 && (
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium">
                    Selected Class Lists ({form.watch('classListIds')?.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {getSelectedClassListsData(
                    form.watch('classListIds') || [],
                  )?.map((classList) => (
                    <div
                      key={classList.id}
                      className="flex items-center text-muted-foreground justify-between p-2  rounded border"
                    >
                      <div>
                        <p className="font-medium text-sm">{classList.name}</p>
                        <p className="text-xs bg-background">
                          {classList.department} • {classList.batchYear} •{' '}
                          {classList.students} students
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentIds = form.getValues('classListIds');
                          form.setValue(
                            'classListIds',
                            currentIds.filter((id) => id !== classList.id),
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">
                      Total Students:{' '}
                      {getSelectedClassListsData(
                        form.watch('classListIds') || [],
                      )?.reduce((sum, cl) => sum + cl.students, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="course-form"
            disabled={!form.formState.isValid}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
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
