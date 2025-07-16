import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CourseDetailsForm from '@/components/courseDetails/course-details-form';
import CourseCreatedSuccess from '@/components/courseDetails/course-created-success';
import { toast } from 'sonner';
import StudentUploadSection from './student-upload-section';
import StudentPreviewTable from './student-preview-table';

interface CreateCoursePageProps {
  onBack: () => void;
  onStudentClick: (student: any) => void;
}

const CreateCoursePage = ({
  onBack,
  onStudentClick,
}: CreateCoursePageProps) => {
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    description: '',
    semester: '',
    academicYear: '',
    department: '',
  });
  const [csvData, setCsvData] = useState<any[]>([]);
  const [courseCreated, setCourseCreated] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  //   const { toast } = useToast();

  // Mock CSV data with Gender column
  const mockCsvData = [
    {
      id: 1,
      regNumber: 'CS/2024/001',
      fullName: 'John Doe',
      email: 'john.doe@university.edu',
      gender: 'Male',
      department: 'Computer Science',
      yearLevel: '4th',
    },
    {
      id: 2,
      regNumber: 'CS/2024/002',
      fullName: 'Jane Smith',
      email: 'jane.smith@university.edu',
      gender: 'Female',
      department: 'Information Technology',
      yearLevel: '4th',
    },
    {
      id: 3,
      regNumber: 'CS/2024/003',
      fullName: 'Mike Johnson',
      email: 'mike.johnson@university.edu',
      gender: 'Male',
      department: 'Software Engineering',
      yearLevel: '3rd',
    },
    {
      id: 4,
      regNumber: 'CS/2024/004',
      fullName: 'Sarah Wilson',
      email: 'sarah.wilson@university.edu',
      gender: 'Female',
      department: 'Data Science',
      yearLevel: '4th',
    },
    {
      id: 5,
      regNumber: 'CS/2024/005',
      fullName: 'David Brown',
      email: 'david.brown@university.edu',
      gender: 'Male',
      department: 'Computer Engineering',
      yearLevel: '2nd',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate CSV processing with fade-in animation
      setTimeout(() => {
        setCsvData(mockCsvData);
        toast.success(
          `CSV Uploaded Successfully ${mockCsvData.length} student records loaded`,
        );
      }, 1000);
    }
  };

  const handleCreateCourse = () => {
    if (!formData.courseName || !formData.courseCode) {
      toast.info(
        `Missing Information,Please fill in the course name and code.`,
      );
      return;
    }

    // Simulate course creation
    const generatedLink = `https://classsync.app/join/${formData.courseCode.toLowerCase()}`;
    setJoinLink(generatedLink);
    setCourseCreated(true);

    toast.success(
      `Course Created Successfully! ${formData.courseName} has been created with ${csvData.length} students.`,
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:scale-110 transition-transform"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Create New Course
          </h1>
          <p className="text-muted-foreground">
            Set up a new course and manage student enrollment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CourseDetailsForm
          formData={formData}
          onInputChange={handleInputChange}
        />

        <StudentUploadSection csvData={csvData} onCsvUpload={handleCsvUpload} />
      </div>

      <StudentPreviewTable csvData={csvData} onStudentClick={onStudentClick} />

      <CourseCreatedSuccess
        courseCreated={courseCreated}
        joinLink={joinLink}
        courseName={formData.courseName}
        studentCount={csvData.length}
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="hover:scale-105 transition-transform"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateCourse}
          disabled={courseCreated}
          className="hover:scale-105 transition-transform"
        >
          {courseCreated ? 'Course Created' : 'Create Course'}
        </Button>
      </div>
    </div>
  );
};

export default CreateCoursePage;
