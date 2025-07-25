import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  Users,
  AlertCircle,
  // X,
  // Check,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Zod schema for form validation
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

const createClassListSchema = z.object({
  classListName: z.string().min(1, 'Class list name is required').trim(),
  students: z.array(studentSchema).min(1, 'At least one student is required'),
});

type Student = z.infer<typeof studentSchema>;
type CreateClassListForm = z.infer<typeof createClassListSchema>;

interface CreateClassListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateClassList: (data: CreateClassListForm) => Promise<void>;
  selectedClassList?: {
    id: string;
    name: string;
    students: Student[];
  } | null;
  onSelectClassList?: (classListId: string) => void;
  onRemoveClassList?: () => void;
  availableClassLists?: Array<{
    id: string;
    name: string;
    studentCount: number;
  }>;
}

export const CreateClassListSheet = ({
  open,
  onOpenChange,
  onCreateClassList,
  selectedClassList,
  // onSelectClassList,
  // onRemoveClassList,
  // availableClassLists = [],
}: CreateClassListSheetProps) => {
  const isMobile = useIsMobile();
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'manual'>('manual');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [manualStudents, setManualStudents] = useState<Student[]>([
    { name: '', registrationNumber: '', gender: 'male' },
  ]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(!selectedClassList);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<CreateClassListForm>({
    resolver: zodResolver(createClassListSchema),
    defaultValues: {
      classListName: '',
      students: [],
    },
  });

  // Simple CSV parser (without Papa Parse for now)
  const parseCSV = (file: File) => {
    setIsProcessing(true);
    setCsvErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
          toast.error('CSV file must have at least a header and one data row');
          setIsProcessing(false);
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const nameIndex = headers.findIndex((h) => h.includes('name'));
        const regIndex = headers.findIndex((h) => h.includes('reg'));
        const genderIndex = headers.findIndex((h) => h.includes('gender'));

        if (nameIndex === -1 || regIndex === -1 || genderIndex === -1) {
          toast.error(
            'CSV must contain Name, Registration Number, and Gender columns',
          );
          setIsProcessing(false);
          return;
        }

        const students: Student[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());

          try {
            const student = studentSchema.parse({
              name: values[nameIndex] || '',
              registrationNumber: values[regIndex] || '',
              gender:
                values[genderIndex]?.toLowerCase() === 'female'
                  ? 'female'
                  : 'male',
            });
            students.push(student);
          } catch (error) {
            if (error instanceof z.ZodError) {
              errors.push(
                `Row ${i + 1}: ${error.errors.map((e) => e.message).join(', ')}`,
              );
            }
          }
        }

        if (errors.length > 0) {
          setCsvErrors(errors);
          toast.error(`${errors.length} validation errors found`);
        }

        if (students.length > 0) {
          setParsedStudents(students);
          toast.success(`Successfully parsed ${students.length} students`);
        } else {
          toast.error('No valid students found in CSV');
        }
      } catch (error) {
        console.log('Error in parsing CSV files', { error });
        toast.error('Failed to parse CSV file');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    parseCSV(file);
  };

  // Manual student management
  const addManualStudent = () => {
    // Check if all current students are filled before adding new one
    const allFilled = manualStudents.every(
      (student) => student.name.trim() && student.registrationNumber.trim(),
    );

    if (allFilled) {
      setManualStudents((prev) => [
        ...prev,
        { name: '', registrationNumber: '', gender: 'male' },
      ]);
    } else {
      toast.error(
        'Please fill all current student details before adding a new one',
      );
    }
  };

  const removeManualStudent = (index: number) => {
    if (manualStudents.length > 1) {
      setManualStudents((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateManualStudent = (
    index: number,
    field: keyof Student,
    value: string,
  ) => {
    setManualStudents((prev) =>
      prev.map((student, i) =>
        i === index ? { ...student, [field]: value } : student,
      ),
    );
  };

  // Get all students based on current method
  const getAllStudents = (): Student[] => {
    if (uploadMethod === 'csv') {
      return parsedStudents;
    } else {
      return manualStudents.filter(
        (s) => s.name.trim() && s.registrationNumber.trim(),
      );
    }
  };

  const handleSubmit = async (data: CreateClassListForm) => {
    try {
      const allStudents = getAllStudents();

      if (allStudents.length === 0) {
        toast.error('Please add at least one student');
        return;
      }

      // Validate all students
      const validationResults = allStudents.map((student) => {
        try {
          return { student: studentSchema.parse(student), valid: true };
        } catch (error) {
          return { student, valid: false, error };
        }
      });

      const invalidStudents = validationResults.filter((r) => !r.valid);
      if (invalidStudents.length > 0) {
        toast.error(
          `${invalidStudents.length} students have validation errors`,
        );
        return;
      }

      const validStudents = validationResults
        .filter((r) => r.valid)
        .map((r) => r.student);

      await onCreateClassList({
        ...data,
        students: validStudents,
      });

      // Reset form
      form.reset();
      setParsedStudents([]);
      setManualStudents([{ name: '', registrationNumber: '', gender: 'male' }]);
      setCsvFile(null);
      setCsvErrors([]);
      setShowCreateForm(false);
      onOpenChange(false);

      toast.success('Class list created successfully!');
    } catch (error) {
      toast.error('Failed to create class list');
      console.log('Error creating ClassLists', { error });
    }
  };

  // const handleSelectClassList = (classListId: string) => {
  //   if (onSelectClassList) {
  //     onSelectClassList(classListId);
  //     setShowCreateForm(false);
  //     toast.success('Class list selected successfully!');
  //   }
  // };

  // const handleRemoveClassList = () => {
  //   if (onRemoveClassList) {
  //     onRemoveClassList();
  //     setShowCreateForm(true);
  //     toast.success('Class list removed successfully!');
  //   }
  // };

  const content = (
    <div className="space-y-6">
      {/* Class List Selection/Display Section */}

      {/* Create Form - Only show when showCreateForm is true */}
      {showCreateForm && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="classListName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class List Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Computer Science 2024 Batch"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Student Entry Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add Students</h3>

              <Tabs
                value={uploadMethod}
                onValueChange={(value) => {
                  setUploadMethod(value as 'csv' | 'manual');
                  // Clear data when switching methods
                  setParsedStudents([]);
                  setManualStudents([
                    { name: '', registrationNumber: '', gender: 'male' },
                  ]);
                  setCsvFile(null);
                  setCsvErrors([]);
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="csv"
                    className="flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Upload CSV</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Manually</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="csv" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {parsedStudents.length === 0 && (
                          <>
                            <div className="text-center">
                              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                              <div className="space-y-2">
                                <h4 className="font-medium">Upload CSV File</h4>
                                <p className="text-sm text-muted-foreground">
                                  CSV must contain headers: Name, Registration
                                  Number, Gender
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-center">
                              <Label
                                htmlFor="csv-upload"
                                className="cursor-pointer"
                              >
                                <Button variant="outline" asChild>
                                  <span>Choose CSV File</span>
                                </Button>
                                <Input
                                  id="csv-upload"
                                  type="file"
                                  accept=".csv"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </Label>
                            </div>

                            {csvFile && (
                              <p className="text-sm text-center text-muted-foreground">
                                Selected: {csvFile.name}
                              </p>
                            )}

                            {isProcessing && (
                              <p className="text-sm text-center text-blue-600">
                                Processing CSV file...
                              </p>
                            )}
                          </>
                        )}

                        {csvErrors.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-medium">
                                Validation Errors
                              </span>
                            </div>
                            <div className="max-h-32 overflow-y-auto border rounded p-2 bg-destructive/5">
                              {csvErrors.map((error, index) => (
                                <p
                                  key={index}
                                  className="text-sm text-destructive"
                                >
                                  {error}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {parsedStudents.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-green-600">
                              Successfully parsed {parsedStudents.length}{' '}
                              students
                            </h4>
                            <div className="max-h-32 overflow-y-auto border rounded">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b bg-muted/50">
                                    <th className="text-left p-2">Name</th>
                                    <th className="text-left p-2">
                                      Reg Number
                                    </th>
                                    <th className="text-left p-2">Gender</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {parsedStudents
                                    .slice(0, 5)
                                    .map((student, index) => (
                                      <tr key={index} className="border-b">
                                        <td className="p-2">{student.name}</td>
                                        <td className="p-2">
                                          {student.registrationNumber}
                                        </td>
                                        <td className="p-2 capitalize">
                                          {student.gender}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                              {parsedStudents.length > 5 && (
                                <p className="text-xs text-muted-foreground p-2">
                                  And {parsedStudents.length - 5} more
                                  students...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Add Students Manually</h4>
                          <Button
                            type="button"
                            onClick={addManualStudent}
                            size="sm"
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Student
                          </Button>
                        </div>

                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {manualStudents.map((student, index) => {
                            const isComplete =
                              student.name.trim() &&
                              student.registrationNumber.trim();
                            const isEmpty =
                              !student.name.trim() &&
                              !student.registrationNumber.trim();

                            return (
                              <div
                                key={index}
                                className={`relative p-4 border rounded-lg transition-all duration-200 ${
                                  isComplete
                                    ? 'border-green-200 bg-green-50/50'
                                    : isEmpty
                                      ? 'border-border bg-background'
                                      : 'border-orange-200 bg-orange-50/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                        isComplete
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {index + 1}
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">
                                      Student {index + 1}
                                    </span>
                                  </div>
                                  {manualStudents.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeManualStudent(index)}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                      Full Name *
                                    </Label>
                                    <Input
                                      placeholder="Enter student's full name"
                                      value={student.name}
                                      onChange={(e) =>
                                        updateManualStudent(
                                          index,
                                          'name',
                                          e.target.value,
                                        )
                                      }
                                      className={`transition-colors ${
                                        student.name.trim()
                                          ? 'border-green-300 focus:border-green-500'
                                          : ''
                                      }`}
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                      Registration Number *
                                    </Label>
                                    <Input
                                      placeholder="e.g., 12345678901"
                                      value={student.registrationNumber}
                                      onChange={(e) =>
                                        updateManualStudent(
                                          index,
                                          'registrationNumber',
                                          e.target.value,
                                        )
                                      }
                                      className={`transition-colors ${
                                        student.registrationNumber.trim()
                                          ? 'border-green-300 focus:border-green-500'
                                          : ''
                                      }`}
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                      Gender *
                                    </Label>
                                    <Select
                                      value={student.gender}
                                      onValueChange={(value) =>
                                        updateManualStudent(
                                          index,
                                          'gender',
                                          value,
                                        )
                                      }
                                    >
                                      <SelectTrigger className="transition-colors">
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="male">
                                          Male
                                        </SelectItem>
                                        <SelectItem value="female">
                                          Female
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {isComplete && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    <span>Complete</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {getAllStudents().length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium text-green-600">
                              {getAllStudents().length} students ready to be
                              added
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  getAllStudents().length === 0 || !form.watch('classListName')
                }
              >
                Create Class List
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Create New Class List</span>
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
            <Users className="h-5 w-5" />
            <span>Create New Class List</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">{content}</div>
      </SheetContent>
    </Sheet>
  );
};
