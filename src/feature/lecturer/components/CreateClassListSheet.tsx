import { useState } from 'react';
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
  Upload,
  Plus,
  // Trash2,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface Student {
  Name: string;
  registrationNumber: string;
  gender: 'male' | 'female';
}
interface newClassList {
  department: string;
  faculty: string;
  batchYear: string;
  classListName: string;
  students: Student[];
}

interface CreateClassListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateClassList: (newClassList: newClassList) => Promise<void>;
}

export const CreateClassListSheet = ({
  open,
  onOpenChange,
  onCreateClassList,
}: CreateClassListSheetProps) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    classListName: '',
    faculty: '',
    department: '',
    batchYear: '',
  });

  const [uploadMethod, setUploadMethod] = useState<'csv' | 'manual'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<
    {
      gender: 'male' | 'female';
      registrationNumber: string;
      Name: string;
    }[]
  >([]);
  // const [manualStudents, setManualStudents] = useState<
  //   {
  //     gender: 'male' | 'female';
  //     registrationNumber: string;
  //     Name: string;
  //   }[]
  // >([]);
  const [showPreview, setShowPreview] = useState(false);
  // const { toast } = useToast();

  const faculties = [
    {
      value: 'SESET',
      label: 'SESET - School of Electrical Systems and Space Technology',
    },
    {
      value: 'SEET',
      label: 'SEET - School of Engineering and Engineering Technology',
    },
    {
      value: 'SEMS',
      label: 'SEMS - School of Environmental Management and Sciences',
    },
    { value: 'SLS', label: 'SLS - School of Life Sciences' },
  ];

  const departmentsByFaculty: Record<string, string[]> = {
    SESET: [
      'Electrical Engineering',
      'Electronics Engineering',
      'Telecommunication Engineering',
    ],
    SEET: [
      'Computer Science',
      'Software Engineering',
      'Mechatronics Engineering',
      'Civil Engineering',
    ],
    SEMS: ['Environmental Science', 'Geology', 'Geography'],
    SLS: ['Biology', 'Biochemistry', 'Microbiology'],
  };

  const batchYears = [
    '2019/2020',
    '2020/2021',
    '2021/2022',
    '2022/2023',
    '2023/2024',
    '2024/2025',
  ];

  const validateStudent = (student: Student): string[] => {
    const errors: string[] = [];
    if (!student.Name.trim()) errors.push('Name is required');
    if (!student.registrationNumber.trim())
      errors.push('Registration number is required');
    if (student.registrationNumber.length !== 11)
      errors.push('Registration number must be exactly 11 characters');
    if (!student.gender) errors.push('Gender is required');
    return errors;
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        toast.info('Invalid CSV file');
        return;
      }

      const headers = lines[0]
        .toLowerCase()
        .split(',')
        .map((h) => h.trim());
      const requiredHeaders = ['name', 'registration number', 'gender'];

      const headerMapping: Record<string, number> = {};
      requiredHeaders.forEach((required) => {
        const index = headers.findIndex(
          (h) =>
            (h.includes('name') && required === 'name') ||
            (h.includes('reg') && required === 'registration number') ||
            (h.includes('gender') && required === 'gender'),
        );
        if (index === -1) {
          toast.info('Invalid CSV format');
          return;
        }
        headerMapping[required] = index;
      });

      const students: Student[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());

        const student: Student = {
          Name: values[headerMapping['name']] || '',
          registrationNumber:
            values[headerMapping['registration number']] || '',
          gender: values[headerMapping['gender']].toLowerCase() as
            | 'male'
            | 'female',
        };

        const errors = validateStudent(student);
        if (errors.length === 0) {
          students.push(student);
        } else {
          toast.error(`Error in row ${i + 1}`);
        }
      }

      setParsedStudents(students);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.info('Invalid file type');
        return;
      }
      setCsvFile(file);
      parseCSV(file);
    }
  };

  // const addManualStudent = () => {
  //   setManualStudents((prev) => [
  //     ...prev,
  //     { name: '', registrationNumber: '', gender: '' },
  //   ]);
  // };

  // const removeManualStudent = (index: number) => {
  //   setManualStudents((prev) => prev.filter((_, i) => i !== index));
  // };

  // const updateManualStudent = (
  //   index: number,
  //   field: keyof Student,
  //   value: string,
  // ) => {
  //   setManualStudents((prev) =>
  //     prev.map((student, i) =>
  //       i === index ? { ...student, [field]: value } : student,
  //     ),
  //   );
  // };

  const handleSubmit = () => {
    // Validate form data
    if (
      !formData.classListName ||
      !formData.faculty ||
      !formData.department ||
      !formData.batchYear
    ) {
      toast.info('Missing information');
      return;
    }

    const students = parsedStudents;
    // : manualStudents.filter(
    //     (s) => s.Name && s.registrationNumber && s.gender,
    //   );

    if (students.length === 0) {
      toast.info('No students');
      return;
    }

    // Validate all students
    const validationErrors = students.flatMap((student, index) => {
      const errors = validateStudent(student);
      return errors.map((error) => `Row ${index + 1}: ${error}`);
    });

    if (validationErrors.length > 0) {
      toast.error('Validation errors');
      return;
    }

    onCreateClassList({
      ...formData,
      students,
    });

    // Reset form
    setFormData({
      classListName: '',
      faculty: '',
      department: '',
      batchYear: '',
    });
    setParsedStudents([]);
    // setManualStudents([{ Name: '', registrationNumber: '', gender: '' }]);
    setCsvFile(null);
    setShowPreview(false);
  };

  const content = (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">ClassList Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Electrical Engineering 2020 Batch"
            value={formData.classListName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                classListName: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchYear">Batch Year *</Label>
          <Select
            value={formData.batchYear}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, batchYear: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch year" />
            </SelectTrigger>
            <SelectContent>
              {batchYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="faculty">Faculty *</Label>
          <Select
            value={formData.faculty}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                faculty: value,
                department: '',
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((faculty) => (
                <SelectItem key={faculty.value} value={faculty.value}>
                  {faculty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select
            value={formData.department}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, department: value }))
            }
            disabled={!formData.faculty}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {formData.faculty &&
                departmentsByFaculty[formData.faculty]?.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student Entry Method */}
      <div className="space-y-4">
        <Label>Student Entry Method</Label>
        <Tabs
          value={uploadMethod}
          onValueChange={(value) => setUploadMethod(value as 'csv' | 'manual')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Upload CSV</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Manually</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <h3 className="font-medium">Upload CSV File</h3>
                      <p className="text-sm text-muted-foreground">
                        CSV must contain headers: Name, Registration Number,
                        Gender
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <Label htmlFor="csv-upload" className="cursor-pointer">
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

                  {showPreview && parsedStudents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Preview ({parsedStudents.length} students)
                      </h4>
                      <div className="max-h-32 overflow-y-auto border rounded">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Reg Number</th>
                              <th className="text-left p-2">Gender</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedStudents
                              .slice(0, 5)
                              .map((student, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2">{student.Name}</td>
                                  <td className="p-2">
                                    {student.registrationNumber}
                                  </td>
                                  <td className="p-2">{student.gender}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        {parsedStudents.length > 5 && (
                          <p className="text-xs text-muted-foreground p-2">
                            And {parsedStudents.length - 5} more students...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Add Students Manually</h3>
                    <Button
                      onClick={addManualStudent}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {manualStudents.map((student, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-end"
                      >
                        <div className="col-span-4">
                          <Label className="text-xs">Name</Label>
                          <Input
                            placeholder="Student name"
                            value={student.Name}
                            onChange={(e) =>
                              updateManualStudent(index, 'Name', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs">Reg Number</Label>
                          <Input
                            placeholder="12345678901"
                            value={student.registrationNumber}
                            onChange={(e) =>
                              updateManualStudent(
                                index,
                                'registrationNumber',
                                e.target.value,
                              )
                            }
                            maxLength={11}
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs">Gender</Label>
                          <Select
                            value={student.gender}
                            onValueChange={(value) =>
                              updateManualStudent(index, 'gender', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          {manualStudents.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeManualStudent(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create ClassList</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh] ">
          <DrawerHeader>
            <DrawerTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Create New ClassList</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">{content}</div>
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
            <span>Create New ClassList</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">{content}</div>
      </SheetContent>
    </Sheet>
  );
};
