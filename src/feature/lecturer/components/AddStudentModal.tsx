import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  regNo: string;
  gender: string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  existingRegNumbers: string[];
}

const AddStudentModal = ({
  isOpen,
  onClose,
  onAddStudent,
  existingRegNumbers,
}: AddStudentModalProps) => {
  const [studentForm, setStudentForm] = useState({
    name: '',
    regNo: '',
    gender: '',
  });
  // const { toast } = useToast();

  const handleSubmit = () => {
    // Validation
    if (
      !studentForm.name.trim() ||
      !studentForm.regNo.trim() ||
      !studentForm.gender
    ) {
      // toast({
      //   title: "Validation Error",
      //   description: "All fields are required.",
      //   variant: "destructive"
      // });
      return;
    }

    if (studentForm.regNo.length !== 11) {
      // toast({
      //   title: "Validation Error",
      //   description: "Registration number must be exactly 11 characters.",
      //   variant: "destructive"
      // });
      return;
    }

    if (existingRegNumbers.includes(studentForm.regNo)) {
      // toast({
      //   title: "Validation Error",
      //   description: "Registration number already exists in this class list.",
      //   variant: "destructive"
      // });
      return;
    }

    onAddStudent(studentForm);
    setStudentForm({ name: '', regNo: '', gender: '' });
    onClose();

    // toast({
    //   title: "Student Added",
    //   description: "Student has been added successfully to the class list."
    // });
  };

  const handleClose = () => {
    setStudentForm({ name: '', regNo: '', gender: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            {`Enter the student's information to add them to the class list.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name *</Label>
            <Input
              id="studentName"
              placeholder="Enter full name"
              value={studentForm.name}
              onChange={(e) =>
                setStudentForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regNumber">Registration Number *</Label>
            <Input
              id="regNumber"
              placeholder="Enter 11-digit reg number"
              value={studentForm.regNo}
              onChange={(e) =>
                setStudentForm((prev) => ({ ...prev, regNo: e.target.value }))
              }
              maxLength={11}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={studentForm.gender}
              onValueChange={(value) =>
                setStudentForm((prev) => ({ ...prev, gender: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
