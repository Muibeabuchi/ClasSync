import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  //   CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  User,
  Mail,
  GraduationCap,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface JoinRequestsPageProps {
  onBack: () => void;
}

const JoinRequestsPage = ({ onBack }: JoinRequestsPageProps) => {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data
  const mockCourses = [
    { id: 'all', name: 'All Courses', code: '' },
    { id: 1, name: 'Advanced Database Systems', code: 'CS401' },
    { id: 2, name: 'Software Engineering', code: 'CS301' },
    { id: 3, name: 'Machine Learning', code: 'CS451' },
  ];

  const mockRequests = [
    {
      id: 1,
      courseId: 1,
      courseName: 'Advanced Database Systems',
      courseCode: 'CS401',
      student: {
        name: 'Alice Johnson',
        regNumber: 'CS/2024/015',
        email: 'alice.johnson@university.edu',
        profileImage: '',
        faculty: 'Computer Science',
        department: 'Software Engineering',
        yearLevel: '4th Year',
        gender: 'Female',
      },
      message:
        'I am very interested in database systems and would like to join this course to enhance my backend development skills.',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'pending',
    },
    {
      id: 2,
      courseId: 1,
      courseName: 'Advanced Database Systems',
      courseCode: 'CS401',
      student: {
        name: 'Bob Wilson',
        regNumber: 'CS/2024/018',
        email: 'bob.wilson@university.edu',
        profileImage: '',
        faculty: 'Computer Science',
        department: 'Data Science',
        yearLevel: '3rd Year',
        gender: 'Male',
      },
      message:
        'This course aligns perfectly with my career goals in data engineering. I have strong SQL fundamentals.',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'pending',
    },
    {
      id: 3,
      courseId: 2,
      courseName: 'Software Engineering',
      courseCode: 'CS301',
      student: {
        name: 'Carol Martinez',
        regNumber: 'CS/2024/022',
        email: 'carol.martinez@university.edu',
        profileImage: '',
        faculty: 'Computer Science',
        department: 'Software Engineering',
        yearLevel: '3rd Year',
        gender: 'Female',
      },
      message:
        'I want to improve my software development methodologies and project management skills.',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'pending',
    },
  ];

  const filteredRequests =
    selectedCourse === 'all'
      ? mockRequests
      : mockRequests.filter(
          (req) => req.courseId.toString() === selectedCourse,
        );

  const handleApprove = () => {
    toast.success(
      'Request Approved ,Student has been approved to join the course',
    );
    setIsModalOpen(false);
  };

  const handleReject = () => {
    toast.error('Request Rejected Join request has been rejected');
    setIsModalOpen(false);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const openRequestModal = (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold">Join Requests</h1>
            <p className="text-sm text-muted-foreground">
              Review and approve student join requests
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredRequests.length} pending
        </Badge>
      </div>

      {/* Course Filter */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select course to filter requests" />
            </SelectTrigger>
            <SelectContent>
              {mockCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  <div>
                    <p className="font-medium text-sm">{course.name}</p>
                    {course.code && (
                      <p className="text-xs text-muted-foreground">
                        {course.code}
                      </p>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Requests Grid */}
      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card
            key={request.id}
            className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-r from-background to-muted/30"
            onClick={() => openRequestModal(request)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-muted">
                    <AvatarImage src={request.student.profileImage} />
                    <AvatarFallback className="text-xs font-medium">
                      {request.student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">
                        {request.student.name}
                      </h3>
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        {request.student.regNumber}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{request.courseName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(request.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      request.status === 'pending' ? 'secondary' : 'default'
                    }
                    className="text-xs px-2 py-1"
                  >
                    {request.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Join Request Details
            </DialogTitle>
            <DialogDescription>
              {`Review the student's request to join ${selectedRequest?.courseName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRequest.student.profileImage} />
                  <AvatarFallback>
                    {selectedRequest.student.name
                      .split(' ')
                      // @ts-expect-error: temporary data
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">
                    {selectedRequest.student.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.student.regNumber}
                  </p>
                </div>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Department</p>
                  <p className="font-medium">
                    {selectedRequest.student.department}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Year Level</p>
                  <p className="font-medium">
                    {selectedRequest.student.yearLevel}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs flex items-center gap-1 mb-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="text-sm">{selectedRequest.student.email}</p>
              </div>

              {/* Request Message */}
              <div>
                <p className="text-muted-foreground text-xs mb-2">Message</p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{selectedRequest.message}</p>
                </div>
              </div>

              {/* Course Info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                <span>Requesting to join {selectedRequest.courseCode}</span>
                <span>•</span>
                <span>{getTimeAgo(selectedRequest.timestamp)}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleReject()}
              className="flex-1"
              size="sm"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => selectedRequest && handleApprove()}
              className="flex-1"
              size="sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JoinRequestsPage;
