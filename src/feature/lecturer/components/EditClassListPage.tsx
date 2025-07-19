import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Download,
  Users,
  Calendar,
  School,
} from 'lucide-react';
import AddStudentModal from './AddStudentModal';
// import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  regNo: string;
  gender: string;
}

interface ClassList {
  id: string;
  name: string;
  faculty: string;
  department: string;
  batchYear: string;
  totalStudents: number;
  createdAt: string;
  students: Student[];
}

interface EditClassListPageProps {
  classListId: string;
  onBack: () => void;
}

const EditClassListPage = ({ classListId, onBack }: EditClassListPageProps) => {
  const [classListData, setClassListData] = useState<ClassList | null>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editedStudent, setEditedStudent] = useState<Partial<Student>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Mock data - In real app, this would come from API
  useEffect(() => {
    const mockClassLists: ClassList[] = [
      {
        id: '1',
        name: 'Electrical Engineering 2020 Batch',
        faculty: 'SESET',
        department: 'Electrical Engineering',
        batchYear: '2020/2021',
        totalStudents: 45,
        createdAt: '2024-09-15',
        students: [
          {
            id: '1',
            name: 'Adaobi James',
            regNo: '20201234567',
            gender: 'Female',
          },
          { id: '2', name: 'Uche Emeka', regNo: '20209876543', gender: 'Male' },
          {
            id: '3',
            name: 'Chioma Okafor',
            regNo: '20205555555',
            gender: 'Female',
          },
          {
            id: '4',
            name: 'Ibrahim Musa',
            regNo: '20201111111',
            gender: 'Male',
          },
          {
            id: '5',
            name: 'Fatima Ali',
            regNo: '20208888888',
            gender: 'Female',
          },
        ],
      },
      {
        id: '2',
        name: 'Mechatronics 2019 Batch',
        faculty: 'SESET',
        department: 'Mechatronics Engineering',
        batchYear: '2019/2020',
        totalStudents: 32,
        createdAt: '2024-08-20',
        students: [
          {
            id: '6',
            name: 'Kemi Adebayo',
            regNo: '19198765432',
            gender: 'Female',
          },
          {
            id: '7',
            name: 'Tunde Ogundimu',
            regNo: '19191111111',
            gender: 'Male',
          },
        ],
      },
    ];

    const foundClassList = mockClassLists.find((cl) => cl.id === classListId);
    setClassListData(foundClassList || null);
  }, [classListId]);

  const getFacultyColor = (faculty: string) => {
    const colors = {
      SESET: 'bg-blue-100 text-blue-800 border-blue-200',
      SEET: 'bg-green-100 text-green-800 border-green-200',
      SEMS: 'bg-purple-100 text-purple-800 border-purple-200',
      SLS: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      colors[faculty as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  };

  const startEditingStudent = (student: Student) => {
    setEditingStudent(student.id);
    setEditedStudent({ ...student });
  };

  const cancelEditingStudent = () => {
    setEditingStudent(null);
    setEditedStudent({});
  };

  const saveEditedStudent = () => {
    if (!classListData || !editingStudent) return;

    // Validate the edited student
    if (
      !editedStudent.name?.trim() ||
      !editedStudent.regNo?.trim() ||
      !editedStudent.gender
    ) {
      // toast({
      //   title: 'Validation error',
      //   description: 'All fields are required.',
      //   variant: 'destructive',
      // });
      return;
    }

    if (editedStudent.regNo && editedStudent.regNo.length !== 11) {
      // toast({
      //   title: 'Validation error',
      //   description: 'Registration number must be exactly 11 characters.',
      //   variant: 'destructive',
      // });
      return;
    }

    // Check for duplicate registration numbers
    const isDuplicate = classListData.students.some(
      (s) => s.id !== editingStudent && s.regNo === editedStudent.regNo,
    );

    if (isDuplicate) {
      // toast({
      //   title: 'Validation error',
      //   description: 'Registration number already exists in this class list.',
      //   variant: 'destructive',
      // });
      return;
    }

    // Update the student
    const updatedStudents = classListData.students.map((s) =>
      s.id === editingStudent ? ({ ...s, ...editedStudent } as Student) : s,
    );

    setClassListData({
      ...classListData,
      students: updatedStudents,
    });

    setEditingStudent(null);
    setEditedStudent({});
    setHasChanges(true);

    // toast({
    //   title: 'Student updated',
    //   description: 'Student information has been updated successfully.',
    // });
  };

  const deleteStudent = (studentId: string) => {
    if (!classListData) return;

    const updatedStudents = classListData.students.filter(
      (s) => s.id !== studentId,
    );
    setClassListData({
      ...classListData,
      students: updatedStudents,
      totalStudents: updatedStudents.length,
    });
    setHasChanges(true);

    // toast({
    //   title: 'Student removed',
    //   description: 'Student has been removed from the class list.',
    // });
  };

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    if (!classListData) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      ...studentData,
    };

    const updatedStudents = [...classListData.students, newStudent];
    setClassListData({
      ...classListData,
      students: updatedStudents,
      totalStudents: updatedStudents.length,
    });

    setHasChanges(true);
  };

  const saveAllChanges = () => {
    // In a real app, this would make an API call to save changes
    setHasChanges(false);
    // toast({
    //   title: 'Changes saved',
    //   description: 'All changes have been saved successfully.',
    // });
  };

  const exportToCSV = () => {
    if (!classListData) return;

    const csvContent = [
      'Name,Registration Number,Gender',
      ...classListData.students.map((s) => `${s.name},${s.regNo},${s.gender}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${classListData.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    // toast({
    //   title: 'Export successful',
    //   description: 'Class list has been exported as CSV.',
    // });
  };

  if (!classListData) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ClassLists
          </Button>
        </div>
        <div className="text-center py-12">
          <School className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">ClassList not found</h3>
          <p className="text-muted-foreground">
            The requested class list could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ClassLists
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {hasChanges && (
            <Button onClick={saveAllChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* ClassList Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <School className="h-6 w-6" />
            <span>{classListData.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Faculty</p>
                <Badge
                  variant="outline"
                  className={getFacultyColor(classListData.faculty)}
                >
                  {classListData.faculty}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{classListData.department}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Batch Year</p>
                <Badge variant="outline">{classListData.batchYear}</Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="font-medium">{classListData.students.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students</CardTitle>
            <Button onClick={() => setIsAddStudentModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {classListData.students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No students yet</h3>
              <p className="text-muted-foreground mb-4">
                Add students to this class list to get started.
              </p>
              <Button onClick={() => setIsAddStudentModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Student
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classListData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        {editingStudent === student.id ? (
                          <Input
                            value={editedStudent.name || ''}
                            onChange={(e) =>
                              setEditedStudent((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Student name"
                          />
                        ) : (
                          <span className="font-medium">{student.name}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {editingStudent === student.id ? (
                          <Input
                            value={editedStudent.regNo || ''}
                            onChange={(e) =>
                              setEditedStudent((prev) => ({
                                ...prev,
                                regNo: e.target.value,
                              }))
                            }
                            placeholder="Registration number"
                            maxLength={11}
                          />
                        ) : (
                          <span className="font-mono">{student.regNo}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {editingStudent === student.id ? (
                          <Select
                            value={editedStudent.gender || ''}
                            onValueChange={(value) =>
                              setEditedStudent((prev) => ({
                                ...prev,
                                gender: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{student.gender}</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {editingStudent === student.id ? (
                            <>
                              <Button size="sm" onClick={saveEditedStudent}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditingStudent}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingStudent(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteStudent(student.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
        existingRegNumbers={classListData?.students.map((s) => s.regNo) || []}
      />
    </div>
  );
};

export default EditClassListPage;
