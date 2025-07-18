import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Plus,
  Trash2,
  // Edit,
  Download,
  Users,
  Calendar,
  ArrowLeft,
  Settings,
  FileSpreadsheet,
} from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
import { CreateClassListSheet } from './CreateClassListSheet';
import { DeleteClassListModal } from './DeleteClassListModal';
import { UpdateClassListSheet } from './UpdateClassListSheet';
// import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  regNumber: string;
  gender: 'Male' | 'Female';
}

interface ClassList {
  id: string;
  name: string;
  batchYear: string;
  department: string;
  faculty: string;
  students: Student[];
  totalStudents: number;
  createdAt: string;
}

interface ClassListManagementProps {
  onBack: () => void;
}

const ClassListManagement = ({ onBack }: ClassListManagementProps) => {
  const [classLists, setClassLists] = useState<ClassList[]>([
    {
      id: '1',
      name: 'Computer Science Year 3',
      batchYear: '2021/2022',
      department: 'Computer Science',
      faculty: 'Engineering',
      totalStudents: 2,
      students: [
        { id: '1', name: 'John Doe', regNumber: 'CS/21/001', gender: 'Male' },
        {
          id: '2',
          name: 'Jane Smith',
          regNumber: 'CS/21/002',
          gender: 'Female',
        },
      ],
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Software Engineering Year 2',
      batchYear: '2022/2023',
      department: 'Computer Science',
      faculty: 'Engineering',
      totalStudents: 1,
      students: [
        {
          id: '3',
          name: 'Mike Johnson',
          regNumber: 'SE/22/001',
          gender: 'Male',
        },
      ],
      createdAt: '2024-02-10',
    },
  ]);

  const [selectedClassList, setSelectedClassList] = useState<ClassList | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualStudents, setManualStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    regNumber: '',
    gender: 'Male' as 'Male' | 'Female',
  });
  const [classListForm, setClassListForm] = useState({
    name: '',
    batchYear: '',
    department: '',
    faculty: '',
  });

  // const { toast } = useToast();

  const batchYears = [
    '2024/2025',
    '2023/2024',
    '2022/2023',
    '2021/2022',
    '2020/2021',
    '2019/2020',
    '2018/2019',
    '2017/2018',
  ];

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      // Simulate CSV parsing
      const mockStudents: Student[] = [
        {
          id: Date.now().toString(),
          name: 'CSV Student 1',
          regNumber: 'CSV/001',
          gender: 'Male',
        },
        {
          id: (Date.now() + 1).toString(),
          name: 'CSV Student 2',
          regNumber: 'CSV/002',
          gender: 'Female',
        },
      ];
      setManualStudents(mockStudents);
      // toast({
      //   title: "CSV Uploaded",
      //   description: `${mockStudents.length} students loaded from CSV file.`,
      // });
    }
  };

  const addManualStudent = () => {
    if (newStudent.name && newStudent.regNumber) {
      const student: Student = {
        id: Date.now().toString(),
        ...newStudent,
      };
      setManualStudents([...manualStudents, student]);
      setNewStudent({ name: '', regNumber: '', gender: 'Male' });
      // toast({
      //   title: "Student Added",
      //   description: "Student has been added to the list.",
      // });
    }
  };

  const removeStudent = (id: string) => {
    setManualStudents(manualStudents.filter((s) => s.id !== id));
  };

  const createClassList = () => {
    if (
      classListForm.name &&
      classListForm.batchYear &&
      manualStudents.length > 0
    ) {
      const newClassList: ClassList = {
        id: Date.now().toString(),
        ...classListForm,
        students: manualStudents,
        totalStudents: manualStudents.length,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClassLists([...classLists, newClassList]);

      // Reset form
      setClassListForm({
        name: '',
        batchYear: '',
        department: '',
        faculty: '',
      });
      setManualStudents([]);
      setCsvFile(null);
      setView('list');

      // toast({
      //   title: "ClassList Created",
      //   description: `${newClassList.name} has been created with ${newClassList.students.length} students.`,
      // });
    }
  };

  const deleteClassList = (id: string) => {
    setClassLists(classLists.filter((cl) => cl.id !== id));
    setShowDeleteModal(false);
    setSelectedClassList(null);
    // toast({
    //   title: "ClassList Deleted",
    //   description: "The ClassList has been permanently deleted.",
    // });
  };

  const handleCreateClassList = (classListData: {
    name: string;
    faculty: string;
    department: string;
    batchYear: string;
    totalStudents: number;
    students: { name: string; regNo: string; gender: string }[];
  }) => {
    const newClassList: ClassList = {
      id: Date.now().toString(),
      name: classListData.name,
      faculty: classListData.faculty,
      department: classListData.department,
      batchYear: classListData.batchYear,
      totalStudents: classListData.totalStudents,
      students: classListData.students.map((student, index) => ({
        id: `${Date.now()}-${index}`,
        name: student.name,
        regNumber: student.regNo,
        gender: student.gender as 'Male' | 'Female',
      })),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setClassLists([...classLists, newClassList]);
    setShowCreateModal(false);

    // toast({
    //   title: "ClassList Created",
    //   description: `${newClassList.name} has been created with ${newClassList.students.length} students.`,
    // });
  };

  const handleUpdateClassList = (updatedData: {
    id: string;
    name: string;
    faculty: string;
    department: string;
    batchYear: string;
    totalStudents: number;
    createdAt: string;
    students: Array<{
      name: string;
      regNo: string;
      gender: string;
    }>;
  }) => {
    const updatedClassList: ClassList = {
      ...updatedData,
      students: updatedData.students.map((student, index) => ({
        id: student.regNo || `${updatedData.id}-${index}`,
        name: student.name,
        regNumber: student.regNo,
        gender: student.gender as 'Male' | 'Female',
      })),
    };

    setClassLists(
      classLists.map((cl) =>
        cl.id === updatedClassList.id ? updatedClassList : cl,
      ),
    );
    setShowUpdateSheet(false);
    setSelectedClassList(null);
  };

  if (view === 'create') {
    return (
      <div className="space-y-6 animate-slide-in-bottom">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setView('list')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Create New ClassList
            </h1>
            <p className="text-muted-foreground">
              Add students via CSV upload or manual entry
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ClassList Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                ClassList Information
              </CardTitle>
              <CardDescription>
                Basic information about the class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  placeholder="e.g., Computer Science Year 3"
                  value={classListForm.name}
                  onChange={(e) =>
                    setClassListForm({ ...classListForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchYear">Batch Year</Label>
                <Select
                  value={classListForm.batchYear}
                  onValueChange={(value) =>
                    setClassListForm({ ...classListForm, batchYear: value })
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Department"
                    value={classListForm.department}
                    onChange={(e) =>
                      setClassListForm({
                        ...classListForm,
                        department: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input
                    id="faculty"
                    placeholder="Faculty"
                    value={classListForm.faculty}
                    onChange={(e) =>
                      setClassListForm({
                        ...classListForm,
                        faculty: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-chart-2" />
                Upload Student Data
              </CardTitle>
              <CardDescription>
                Upload a CSV file with student information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Upload Student CSV</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      CSV should contain: name, reg_number, gender
                    </p>
                  </div>
                </Label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCsvUpload}
                />
              </div>

              {csvFile && (
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">{csvFile.name}</span>
                  <Badge variant="secondary">
                    {manualStudents.length} students
                  </Badge>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Manual Entry */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Manual Student Entry</CardTitle>
            <CardDescription>
              Add students individually or edit uploaded data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
              />
              <Input
                placeholder="Registration Number"
                value={newStudent.regNumber}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, regNumber: e.target.value })
                }
              />
              <Select
                value={newStudent.gender}
                onValueChange={(value: 'Male' | 'Female') =>
                  setNewStudent({ ...newStudent, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addManualStudent} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>

            {manualStudents.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Registration Number</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.regNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.gender === 'Male'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {student.gender}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setView('list')}>
            Cancel
          </Button>
          <Button
            onClick={createClassList}
            disabled={
              !classListForm.name ||
              !classListForm.batchYear ||
              manualStudents.length === 0
            }
            className="bg-primary hover:bg-primary/90"
          >
            Create ClassList
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in-bottom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              ClassList Management
            </h1>
            <p className="text-muted-foreground">
              Manage student class lists and data
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create ClassList
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{classLists.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total ClassLists
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-2xl font-bold">
                  {classLists.reduce((acc, cl) => acc + cl.students.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-chart-2" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(classLists.map((cl) => cl.batchYear)).size}
                </p>
                <p className="text-sm text-muted-foreground">Batch Years</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ClassLists Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All ClassLists</CardTitle>
          <CardDescription>
            View and manage all created class lists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Batch Year</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classLists.map((classList) => (
                  <TableRow key={classList.id} className="hover:bg-muted/10">
                    <TableCell className="font-medium">
                      {classList.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classList.batchYear}</Badge>
                    </TableCell>
                    <TableCell>{classList.department}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {classList.students.length} students
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {classList.createdAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClassList(classList);
                            setShowUpdateSheet(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClassList(classList);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateClassListSheet
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateClassList={handleCreateClassList}
      />

      <DeleteClassListModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        classListName={selectedClassList?.name || ''}
        onConfirmDelete={() =>
          selectedClassList && deleteClassList(selectedClassList.id)
        }
      />

      <UpdateClassListSheet
        isOpen={showUpdateSheet}
        onClose={() => {
          setShowUpdateSheet(false);
          setSelectedClassList(null);
        }}
        classlist={
          selectedClassList
            ? {
                ...selectedClassList,
                students: selectedClassList.students.map((student) => ({
                  name: student.name,
                  regNo: student.regNumber,
                  gender: student.gender,
                })),
              }
            : null
        }
        onUpdate={handleUpdateClassList}
      />
    </div>
  );
};

export default ClassListManagement;
