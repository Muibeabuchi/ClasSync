import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Search, BookOpen, Users, Clock, Send } from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
// toast
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

// interface JoinCoursePageProps {
//   onBack: () => void;
// }

const JoinCoursePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  //   const { toast } = useToast();

  // Mock available courses
  const availableCourses = [
    {
      id: 4,
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      lecturer: 'Dr. James Wilson',
      department: 'Computer Science',
      faculty: 'School of Physical Sciences',
      semester: 'Harmattan',
      academicYear: '2024/2025',
      maxStudents: 120,
      enrolledStudents: 98,
      schedule: 'Mon, Wed - 10:00 AM',
      description: 'Introduction to fundamental data structures and algorithms',
    },
    {
      id: 5,
      name: 'Computer Networks',
      code: 'CS351',
      lecturer: 'Prof. Maria Garcia',
      department: 'Computer Science',
      faculty: 'School of Physical Sciences',
      semester: 'Harmattan',
      academicYear: '2024/2025',
      maxStudents: 80,
      enrolledStudents: 65,
      schedule: 'Tue, Thu - 2:00 PM',
      description: 'Fundamentals of computer networking and protocols',
    },
    {
      id: 6,
      name: 'Database Management Systems',
      code: 'CS302',
      lecturer: 'Dr. Robert Kim',
      department: 'Computer Science',
      faculty: 'School of Physical Sciences',
      semester: 'Harmattan',
      academicYear: '2024/2025',
      maxStudents: 100,
      enrolledStudents: 89,
      schedule: 'Wed, Fri - 1:00 PM',
      description: 'Design and implementation of database systems',
    },
    {
      id: 7,
      name: 'Web Development',
      code: 'CS275',
      lecturer: 'Engr. Sarah Davis',
      department: 'Computer Science',
      faculty: 'School of Physical Sciences',
      semester: 'Harmattan',
      academicYear: '2024/2025',
      maxStudents: 60,
      enrolledStudents: 55,
      schedule: 'Mon, Fri - 3:00 PM',
      description: 'Modern web development technologies and frameworks',
    },
    {
      id: 8,
      name: 'Artificial Intelligence',
      code: 'CS475',
      lecturer: 'Prof. Ahmed Hassan',
      department: 'Computer Science',
      faculty: 'School of Physical Sciences',
      semester: 'Harmattan',
      academicYear: '2024/2025',
      maxStudents: 40,
      enrolledStudents: 38,
      schedule: 'Tue, Thu - 4:00 PM',
      description: 'Introduction to AI concepts and machine learning',
    },
    {
      id: 9,
      name: 'Cybersecurity Fundamentals',
      code: 'CS380',
      lecturer: 'Dr. Emily Chen',
      department: 'Computer Science',
      faculty: 'School of Physical Sciences',
      semester: 'Harmattan',
      academicYear: '2024/2025',
      maxStudents: 70,
      enrolledStudents: 45,
      schedule: 'Mon, Wed - 11:00 AM',
      description: 'Introduction to cybersecurity principles and practices',
    },
  ];

  const handleSendRequest = () => {
    if (!selectedCourse || !requestMessage.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    toast.success(
      `Your request to join ${selectedCourse.name} has been sent to ${selectedCourse.lecturer}.`,
    );

    setIsDialogOpen(false);
    setSelectedCourse(null);
    setRequestMessage('');
  };

  const filteredCourses = availableCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Join Course</h1>
          <p className="text-gray-600">
            Browse and request to join available courses
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search courses by name, code, lecturer, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Available Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>
                    {course.code} • {course.department}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    course.enrolledStudents >= course.maxStudents
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {course.enrolledStudents >= course.maxStudents
                    ? 'Full'
                    : 'Open'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {course.lecturer
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{course.lecturer}</p>
                  <p className="text-xs text-gray-500">{course.schedule}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">{course.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {course.enrolledStudents}/{course.maxStudents} students
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{course.semester}</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${(course.enrolledStudents / course.maxStudents) * 100}%`,
                  }}
                ></div>
              </div>

              <Dialog
                open={isDialogOpen && selectedCourse?.id === course.id}
                onOpenChange={setIsDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={course.enrolledStudents >= course.maxStudents}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Request to Join
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request to Join Course</DialogTitle>
                    <DialogDescription>
                      Send a request to join {course.name} ({course.code})
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium">{course.name}</h4>
                      <p className="text-sm text-gray-600">
                        {course.code} • {course.lecturer}
                      </p>
                      <p className="text-sm text-gray-600">{course.schedule}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Message to Lecturer
                      </Label>
                      <Textarea
                        placeholder="Explain why you want to join this course..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSendRequest}>Send Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JoinCoursePage;
