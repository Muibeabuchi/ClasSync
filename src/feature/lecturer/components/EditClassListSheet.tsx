import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { useGetClassList } from '@/feature/classList/api/get-single-classList';
import { useUpdateClassListName } from '@/feature/classList/api/update-classList-name';
import { useAddStudentToClassList } from '@/feature/classList/api/add-student-to-classList';
import { useUpdateClassListStudent } from '@/feature/classList/api/update-classList-student';
import { useDeleteClassListStudent } from '@/feature/classList/api/delete-classList-student';
import type { Id } from 'convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';

// Zod schemas for validation
const classListNameSchema = z.object({
  classListName: z.string().min(1, 'Class list name is required').trim(),
});

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  registrationNumber: z
    .string()
    .min(1, 'Registration number is required')
    .trim(),
  gender: z.enum(['male', 'female'], {
    required_error: 'Gender is required',
  }),
});

type ClassListNameForm = z.infer<typeof classListNameSchema>;
type StudentForm = z.infer<typeof studentSchema>;

interface EditClassListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classListId: Id<'classLists'> | null;
  classListName: string;
}

export const EditClassListSheet = ({
  open,
  onOpenChange,
  classListId,
  classListName,
}: EditClassListSheetProps) => {
  const isMobile = useIsMobile();
  const [editingStudent, setEditingStudent] = useState<{
    id: Id<'classListStudents'>;
    data: StudentForm;
  } | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{
    id: Id<'classListStudents'>;
    name: string;
  } | null>(null);

  // API hooks
  const { data: classListData, isLoading } = useGetClassList(classListId);
  const updateClassListName = useUpdateClassListName();
  const addStudent = useAddStudentToClassList();
  const updateStudent = useUpdateClassListStudent();
  const deleteStudent = useDeleteClassListStudent();

  // Forms
  const nameForm = useForm<ClassListNameForm>({
    resolver: zodResolver(classListNameSchema),
    defaultValues: {
      classListName: classListName,
    },
  });

  const studentForm = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      registrationNumber: '',
      gender: 'male',
    },
  });

  // Update form when classListName prop changes
  useEffect(() => {
    nameForm.setValue('classListName', classListName);
  }, [classListName, nameForm]);

  // Handle class list name update
  const handleUpdateName = async (data: ClassListNameForm) => {
    if (!classListId) return;

    try {
      await updateClassListName.mutateAsync({
        classListId,
        classListName: data.classListName,
      });
      toast.success('Class list name updated successfully');
    } catch (error: any) {
      console.error('Error updating class list name:', error);
      toast.error('Failed to update class list name', {
        description: error.message,
      });
    }
  };

  // Handle add student
  const handleAddStudent = async (data: StudentForm) => {
    if (!classListId) return;

    try {
      await addStudent.mutateAsync({
        classListId,
        student: {
          Name: data.name,
          registrationNumber: data.registrationNumber,
          gender: data.gender,
        },
      });
      toast.success('Student added successfully');
      setShowAddStudent(false);
      studentForm.reset();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student', {
        description: error.message,
      });
    }
  };

  // Handle update student
  const handleUpdateStudent = async (data: StudentForm) => {
    if (!classListId || !editingStudent) return;

    try {
      await updateStudent.mutateAsync({
        classListId,
        studentId: editingStudent.id,
        student: {
          Name: data.name,
          registrationNumber: data.registrationNumber,
          gender: data.gender,
        },
      });
      toast.success('Student updated successfully');
      setEditingStudent(null);
      studentForm.reset();
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student', {
        description: error.message,
      });
    }
  };

  // Handle delete student
  const handleDeleteStudent = async () => {
    if (!classListId || !studentToDelete) return;

    try {
      await deleteStudent.mutateAsync({
        classListId,
        studentId: studentToDelete.id,
      });
      toast.success('Student deleted successfully');
      setStudentToDelete(null);
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student', {
        description: error.message,
      });
    }
  };

  // Handle edit student click
  const handleEditStudentClick = (student: any) => {
    setEditingStudent({
      id: student._id,
      data: {
        name: student.student.studentName,
        registrationNumber: student.student.studentRegistrationNumber,
        gender: student.student.studentGender,
      },
    });
    studentForm.setValue('name', student.student.studentName);
    studentForm.setValue(
      'registrationNumber',
      student.student.studentRegistrationNumber,
    );
    studentForm.setValue('gender', student.student.studentGender);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingStudent(null);
    setShowAddStudent(false);
    studentForm.reset();
  };

  const content = (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      ) : (
        <>
          {/* Class List Name Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Class List Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...nameForm}>
                <form
                  onSubmit={nameForm.handleSubmit(handleUpdateName)}
                  className="space-y-4"
                >
                  <FormField
                    control={nameForm.control}
                    name="classListName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class List Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter class list name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateClassListName.isPending}
                  >
                    {updateClassListName.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Name
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Students Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Students</CardTitle>
                <Button
                  onClick={() => setShowAddStudent(true)}
                  size="sm"
                  variant="outline"
                  disabled={showAddStudent || editingStudent !== null}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Student Form */}
              {showAddStudent && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <Form {...studentForm}>
                      <form
                        onSubmit={studentForm.handleSubmit(handleAddStudent)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={studentForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter student's full name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={studentForm.control}
                            name="registrationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registration Number *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., 12345678901"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={studentForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">
                                      Female
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={addStudent.isPending}
                          >
                            {addStudent.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Student
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Students List */}
              <div className="space-y-3">
                {classListData?.classListStudents?.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No students yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first student to get started
                    </p>
                  </div>
                ) : (
                  classListData?.classListStudents?.map((student) => (
                    <Card key={student._id} className="p-4">
                      {editingStudent?.id === student._id ? (
                        // Edit Form
                        <Form {...studentForm}>
                          <form
                            onSubmit={studentForm.handleSubmit(
                              handleUpdateStudent,
                            )}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={studentForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter student's full name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={studentForm.control}
                                name="registrationNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Registration Number *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., 12345678901"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={studentForm.control}
                                name="gender"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Gender *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="male">
                                          Male
                                        </SelectItem>
                                        <SelectItem value="female">
                                          Female
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                size="sm"
                                disabled={updateStudent.isPending}
                              >
                                {updateStudent.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Student
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        // Display Mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                                {student.student.classlistPosition}
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {student.student.studentName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {student.student.studentRegistrationNumber} •{' '}
                                  {student.student.studentGender}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStudentClick(student)}
                              disabled={
                                editingStudent !== null || showAddStudent
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setStudentToDelete({
                                  id: student._id,
                                  name: student.student.studentName,
                                })
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={
                                editingStudent !== null || showAddStudent
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!studentToDelete}
        onOpenChange={() => setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Student
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{studentToDelete?.name}</strong> from this class list?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteStudent.isPending}
            >
              {deleteStudent.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Student'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Class List</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl px-4 overflow-y-auto py-2"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Class List</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">{content}</div>
      </SheetContent>
    </Sheet>
  );
};
