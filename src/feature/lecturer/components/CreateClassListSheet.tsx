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
  Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  Users,
  AlertCircle,
  Loader2,
  Zap,
  X,
  Clock,
  CheckCircle,
  // Check,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { aiRepairToasts } from '../utils/aiRepairToasts';

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
  // students: z.array(studentSchema).min(1, 'At least one student is required'),
});

type Student = z.infer<typeof studentSchema>;
type CreateClassListForm = z.infer<typeof createClassListSchema>;

interface CreateClassListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateClassList: (data: {
    classListName: string;
    students: {
      gender: 'male' | 'female';
      registrationNumber: string;
      Name: string;
    }[];
  }) => Promise<void>;
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
  // selectedClassList,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawCsvContent, setRawCsvContent] = useState<string>('');
  const [isAiFixing, setIsAiFixing] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    exceeded: boolean;
    retryAfter?: number;
    message?: string;
  } | null>(null);
  // const [showCreateForm, setShowCreateForm] = useState(!selectedClassList);

  // Add Convex action hook for AI repair
  const aiFixCsv = useAction(api.actions.aiFixCsv.aiFixCsv);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<CreateClassListForm>({
    resolver: zodResolver(createClassListSchema),
    defaultValues: {
      classListName: '',
      // students: [],
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

    // Store raw CSV content for AI repair
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawCsvContent(content);
    };
    reader.readAsText(file);

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

  // AI Fix CSV function
  const handleAiFixCsv = async () => {
    if (!rawCsvContent) {
      aiRepairToasts.repairFailed('No CSV content available for AI repair');
      return;
    }

    setIsAiFixing(true);
    setRateLimitInfo(null);

    // Show loading toast
    const loadingToastId = aiRepairToasts.repairStarted();

    try {
      const result = await aiFixCsv({ rawCsvText: rawCsvContent });

      // Dismiss loading toast
      aiRepairToasts.dismiss(loadingToastId);

      if (result.repaired) {
        // Success case - transform and apply the repaired data
        const transformedStudents: Student[] = result.data.map(
          (student: any) => ({
            name: student.name,
            registrationNumber: student.regNumber,
            gender: student.gender.toLowerCase() as 'male' | 'female',
          }),
        );

        setParsedStudents(transformedStudents);
        setCsvErrors([]); // Clear the errors since AI fixed them

        // Show success toast with detailed information
        aiRepairToasts.repairSuccess({
          studentCount: result.data.length,
          confidence: result.confidence.overall,
          correctionsMade: result.metadata.dataCorrections.length,
          processingTime: Math.round(
            (result.metadata.processingEndTime -
              result.metadata.processingStartTime) /
              1000,
          ),
        });

        toast.success(
          `AI repair successful! ${transformedStudents.length} students loaded.`,
        );
      } else {
        // Error case
        if (result.errorType === 'rate_limit_error') {
          setRateLimitInfo({
            exceeded: true,
            retryAfter: result.retryAfter,
            message: result.error,
          });
          aiRepairToasts.rateLimitError(result.retryAfter || 300);
        } else if (result.errorType === 'network_error') {
          aiRepairToasts.networkError();
        } else if (result.errorType === 'parsing_error') {
          aiRepairToasts.fileProcessingError();
        } else {
          aiRepairToasts.repairFailed(result.error || 'Unknown error occurred');
        }

        toast.error(
          `AI repair failed: ${result.error || 'Unknown error occurred'}`,
        );
      }
    } catch (error) {
      console.error('AI Fix CSV error:', error);
      aiRepairToasts.dismiss(loadingToastId);

      // Determine error type and show appropriate toast
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch')
      ) {
        aiRepairToasts.networkError();
      } else {
        aiRepairToasts.repairFailed(errorMessage);
      }

      toast.error(`AI repair failed: ${errorMessage}`);
    } finally {
      setIsAiFixing(false);
    }
  };

  // Clear CSV data function
  const handleClearCsv = () => {
    setCsvFile(null);
    setCsvErrors([]);
    setParsedStudents([]);
    setRawCsvContent('');
    toast.success('CSV data cleared successfully');
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
    setIsSubmitting(true);
    try {
      console.log('Form submitted with data:', data);

      const allStudents = getAllStudents();
      console.log('All students:', allStudents);

      if (allStudents.length === 0) {
        toast.error('Please add at least one student');
        return;
      }

      // Validate all students
      const validationResults = allStudents.map((student) => {
        try {
          return { student: studentSchema.parse(student), valid: true };
        } catch (error) {
          console.log('Student validation error:', error);
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

      console.log('Valid students to submit:', validStudents);

      // Transform students to match Convex schema format
      const transformedStudents = validStudents.map((student) => ({
        Name: student.name, // Note: Convex expects 'Name' with capital N
        registrationNumber: student.registrationNumber,
        gender: student.gender,
      }));

      const submissionData = {
        classListName: data.classListName,
        students: transformedStudents,
      };

      console.log('Submitting data:', submissionData);

      await onCreateClassList(submissionData);

      // Reset form and state after successful submission
      form.reset();
      setParsedStudents([]);
      setManualStudents([{ name: '', registrationNumber: '', gender: 'male' }]);
      setCsvFile(null);
      setCsvErrors([]);
      setRawCsvContent('');
      setRateLimitInfo(null);
      onOpenChange(false);

      toast.success('Class list created successfully!');
    } catch (error) {
      console.error('Error creating ClassLists:', error);
      toast.error('Failed to create class list');
    } finally {
      // Always reset the submitting state
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Header Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Create Class List
              </h2>
              <p className="text-muted-foreground">
                Add students to your class list by uploading a CSV file or
                entering them manually.
              </p>
            </div>

            <FormField
              control={form.control}
              name="classListName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Class List Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Computer Science 2024 Batch"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Student Entry Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Add Students</h3>
              <p className="text-sm text-muted-foreground">
                Choose your preferred method to add students to the class list.
              </p>
            </div>
            <Tabs
              value={uploadMethod}
              onValueChange={(value) => {
                setUploadMethod(value as 'csv' | 'manual');
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger
                  value="csv"
                  className="flex items-center space-x-2 h-10"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Upload CSV</span>
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="flex items-center space-x-2 h-10"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Manually</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-6 mt-6">
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <CardContent className="p-8">
                    {parsedStudents.length === 0 ? (
                      <div className="space-y-6">
                        <div className="text-center space-y-4">
                          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Upload className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-lg font-medium">
                              Upload CSV File
                            </h4>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                              Your CSV file must contain headers:{' '}
                              <strong>Name</strong>,{' '}
                              <strong>Registration Number</strong>, and{' '}
                              <strong>Gender</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Label
                            htmlFor="csv-upload"
                            className="cursor-pointer"
                          >
                            <Button
                              variant="outline"
                              size="lg"
                              asChild
                              className="h-12 px-8"
                            >
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
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                              <FileSpreadsheet className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {csvFile.name}
                              </span>
                            </div>
                          </div>
                        )}

                        {isProcessing && (
                          <div className="flex items-center justify-center gap-2 text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">
                              Processing CSV file...
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-green-900">
                                Successfully imported {parsedStudents.length}{' '}
                                students
                              </h4>
                              <p className="text-sm text-green-700">
                                Review the student list below before creating
                                the class list
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleClearCsv}
                            variant="outline"
                            size="sm"
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                          </Button>
                        </div>

                        {/* Enhanced Student Table */}
                        <div className="border rounded-lg overflow-hidden bg-background">
                          <div className="max-h-96 overflow-y-auto">
                            <table className="w-full">
                              <thead className="bg-muted/50 sticky top-0 z-10">
                                <tr>
                                  <th className="text-left p-4 font-medium text-sm">
                                    #
                                  </th>
                                  <th className="text-left p-4 font-medium text-sm">
                                    Full Name
                                  </th>
                                  <th className="text-left p-4 font-medium text-sm">
                                    Registration Number
                                  </th>
                                  <th className="text-left p-4 font-medium text-sm">
                                    Gender
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {parsedStudents.map((student, index) => (
                                  <tr
                                    key={index}
                                    className="border-b hover:bg-muted/30 transition-colors"
                                  >
                                    <td className="p-4 text-sm text-muted-foreground font-medium">
                                      {index + 1}
                                    </td>
                                    <td className="p-4 text-sm font-medium">
                                      {student.name}
                                    </td>
                                    <td className="p-4 text-sm font-mono">
                                      {student.registrationNumber}
                                    </td>
                                    <td className="p-4">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          student.gender === 'female'
                                            ? 'bg-pink-100 text-pink-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}
                                      >
                                        {student.gender === 'female'
                                          ? 'Female'
                                          : 'Male'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {csvErrors.length > 0 && (
                      <div className="space-y-4 mt-6">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-semibold">
                            CSV Parsing Issues Found
                          </span>
                        </div>

                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {csvErrors.map((error, index) => (
                              <p
                                key={index}
                                className="text-sm text-destructive"
                              >
                                • {error}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          {rawCsvContent && (
                            <Button
                              onClick={handleAiFixCsv}
                              disabled={isAiFixing || rateLimitInfo?.exceeded}
                              size="sm"
                              className={`${
                                rateLimitInfo?.exceeded
                                  ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                              } text-white border-0 transition-all duration-200 flex-1`}
                            >
                              {isAiFixing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  AI is fixing your CSV...
                                </>
                              ) : rateLimitInfo?.exceeded ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Rate Limited
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-2" />
                                  AI Fix CSV
                                </>
                              )}
                            </Button>
                          )}

                          <Button
                            onClick={handleClearCsv}
                            variant="outline"
                            size="sm"
                            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear CSV
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Our AI can automatically fix common CSV issues like
                          incorrect headers, formatting problems, and missing
                          data.
                        </p>

                        {rateLimitInfo?.exceeded && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-800 mb-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">
                                Rate limit reached
                              </span>
                            </div>
                            <p className="text-sm text-orange-700">
                              {rateLimitInfo.message}
                            </p>
                            {rateLimitInfo.retryAfter && (
                              <p className="text-xs text-orange-600 mt-1">
                                Try again in{' '}
                                {Math.ceil(rateLimitInfo.retryAfter / 60)}{' '}
                                minutes
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Manual Entry</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add students one by one using the form below
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={addManualStudent}
                        size="sm"
                        variant="outline"
                        className="h-10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6 max-h-80 overflow-y-auto pr-2">
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
                            className={`relative p-6 border-2 rounded-xl transition-all duration-200 ${
                              isComplete
                                ? 'border-green-200 bg-green-50/50'
                                : isEmpty
                                  ? 'border-border bg-background'
                                  : 'border-orange-200 bg-orange-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    isComplete
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Student {index + 1}
                                  </span>
                                  {isComplete && (
                                    <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Complete</span>
                                    </div>
                                  )}
                                </div>
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
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
                                  className={`h-11 transition-colors ${
                                    student.name.trim()
                                      ? 'border-green-300 focus:border-green-500'
                                      : ''
                                  }`}
                                />
                              </div>

                              <div className="space-y-2">
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
                                  className={`h-11 font-mono transition-colors ${
                                    student.registrationNumber.trim()
                                      ? 'border-green-300 focus:border-green-500'
                                      : ''
                                  }`}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Gender *
                                </Label>
                                <Select
                                  value={student.gender}
                                  onValueChange={(value) =>
                                    updateManualStudent(index, 'gender', value)
                                  }
                                >
                                  <SelectTrigger className="h-11 transition-colors">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">
                                      Female
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {getAllStudents().length > 0 && (
                      <div className="pt-4 border-t bg-muted/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">
                            {getAllStudents().length} students ready to be added
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t bg-muted/30 -mx-6 px-6 -mb-6 pb-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setManualStudents([
                  { name: '', registrationNumber: '', gender: 'male' },
                ]);
                setParsedStudents([]);
                setCsvFile(null);
                setCsvErrors([]);
                form.reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={
                getAllStudents().length === 0 ||
                !form.watch('classListName') ||
                isSubmitting
              }
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Class List'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="pb-4">
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
        className="w-full sm:max-w-[50vw] px-6 overflow-y-auto py-4"
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center space-x-2 text-xl">
            <Users className="h-6 w-6" />
            <span>Create New Class List</span>
          </SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
};
