import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ClassList {
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
}

interface UpdateClassListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  classlist: ClassList | null;
  onUpdate: (updatedClassList: ClassList) => void;
}

const faculties = ['SESET', 'SIMS', 'SOBS', 'SEDS', 'SOHT'];

const departmentsByFaculty: Record<string, string[]> = {
  SESET: [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ],
  SIMS: ['Information Systems', 'Software Engineering', 'Cybersecurity'],
  SOBS: ['Business Administration', 'Marketing', 'Finance', 'Economics'],
  SEDS: [
    'Elementary Education',
    'Secondary Education',
    'Educational Psychology',
  ],
  SOHT: ['Tourism Management', 'Hotel Management', 'Event Management'],
};

const batchYears = [
  '2020/2021',
  '2021/2022',
  '2022/2023',
  '2023/2024',
  '2024/2025',
  '2025/2026',
];

export const UpdateClassListSheet: React.FC<UpdateClassListSheetProps> = ({
  isOpen,
  onClose,
  classlist,
  onUpdate,
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    faculty: '',
    department: '',
    batchYear: '',
  });

  React.useEffect(() => {
    if (classlist) {
      setFormData({
        name: classlist.name,
        faculty: classlist.faculty,
        department: classlist.department,
        batchYear: classlist.batchYear,
      });
    }
  }, [classlist]);

  const handleSave = () => {
    if (!classlist) return;

    const updatedClassList: ClassList = {
      ...classlist,
      name: formData.name,
      faculty: formData.faculty,
      department: formData.department,
      batchYear: formData.batchYear,
    };

    onUpdate(updatedClassList);
    toast.success('ClassList Updated');
    onClose();
  };

  const availableDepartments = formData.faculty
    ? departmentsByFaculty[formData.faculty] || []
    : [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] sm:max-w-none px-2"
      >
        <SheetHeader>
          <SheetTitle>Update ClassList Information</SheetTitle>
          <SheetDescription>
            Update the basic information for this classlist.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">ClassList Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Computer Science 2023 Batch"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="faculty">Faculty</Label>
            <Select
              value={formData.faculty}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  faculty: value,
                  department: '', // Reset department when faculty changes
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
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
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="batchYear">Batch Year</Label>
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
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
