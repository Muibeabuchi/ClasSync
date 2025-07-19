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
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';

interface CourseDetailsFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
}

const CourseDetailsForm = ({
  formData,
  onInputChange,
}: CourseDetailsFormProps) => {
  // Generate academic years from 2020/2021 to 2030/2031
  const academicYears = [];
  for (let year = 2020; year <= 2030; year++) {
    academicYears.push(`${year}/${year + 1}`);
  }

  const departments = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Cybersecurity',
    'Data Science',
    'Computer Engineering',
  ];

  return (
    <Card className="hover:shadow-md transition-shadow animate-slide-in-right">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Course Details
        </CardTitle>
        <CardDescription>
          Enter the basic information for your course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name *</Label>
            <Input
              id="courseName"
              value={formData.courseName}
              onChange={(e) => onInputChange('courseName', e.target.value)}
              placeholder="e.g., Advanced Database Systems"
              className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code *</Label>
            <Input
              id="courseCode"
              value={formData.courseCode}
              onChange={(e) => onInputChange('courseCode', e.target.value)}
              placeholder="e.g., CS401"
              className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Brief description of the course..."
            rows={3}
            className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <Select
              value={formData.academicYear}
              onValueChange={(value) => onInputChange('academicYear', value)}
            >
              <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={formData.semester}
              onValueChange={(value) => onInputChange('semester', value)}
            >
              <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                <SelectItem value="harmattan">Harmattan Semester</SelectItem>
                <SelectItem value="rain">Rain Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => onInputChange('department', value)}
          >
            <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="animate-scale-in">
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseDetailsForm;
