import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ClassList {
  id: string;
  name: string;
  batchYear: string;
  department: string;
  students: number;
}

const courseFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .min(3, 'Course name must be at least 3 characters'),
  code: z
    .string()
    .min(1, 'Course code is required')
    .min(2, 'Course code must be at least 2 characters'),
  classListId: z.string().min(1, 'Class list is required'),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface EnhancedCourseCreationProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const EnhancedCourseCreation = ({
  onBack,
  onSuccess,
}: EnhancedCourseCreationProps) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      code: '',
      classListId: '',
    },
  });

  // Mock data for ClassLists
  const availableClassLists: ClassList[] = [
    {
      id: '1',
      name: 'Computer Science Year 3',
      batchYear: '2021/2022',
      department: 'Computer Science',
      students: 45,
    },
    {
      id: '2',
      name: 'Software Engineering Year 2',
      batchYear: '2022/2023',
      department: 'Computer Science',
      students: 38,
    },
    {
      id: '3',
      name: 'Information Technology Year 1',
      batchYear: '2023/2024',
      department: 'Computer Science',
      students: 52,
    },
  ];

  const getSelectedClassListData = (classListId: string) => {
    return availableClassLists.find((cl) => cl.id === classListId);
  };

  const onSubmit = (values: CourseFormValues) => {
    const selectedClassListData = getSelectedClassListData(values.classListId);

    toast.success('Course Created Successfully', {
      description: `${values.name} has been created with ${selectedClassListData?.students || 0} students from ${selectedClassListData?.name}.`,
    });

    onSuccess?.();
  };

  return (
    <div className="space-y-6 animate-slide-in-bottom">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Create New Course
          </h1>
          <p className="text-muted-foreground">
            Set up your course and connect student ClassLists
          </p>
        </div>
      </div>

      {/* Course Information Form */}
      <Card className="glass-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Course Information
          </CardTitle>
          <CardDescription>Basic details about your course</CardDescription>
        </CardHeader>
        <CardContent>
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
                name="classListId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ClassList *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableClassLists.map((classList) => (
                          <SelectItem key={classList.id} value={classList.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{classList.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {classList.students} students
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('classListId') && (
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Selected ClassList</span>
                  </div>
                  {(() => {
                    const selectedData = getSelectedClassListData(
                      form.watch('classListId'),
                    );
                    return selectedData ? (
                      <div>
                        <p className="font-medium">{selectedData.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedData.department} • {selectedData.batchYear} •{' '}
                          {selectedData.students} students
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="course-form"
          disabled={!form.formState.isValid}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>
    </div>
  );
};

export default EnhancedCourseCreation;
