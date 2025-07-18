import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Users,
  BookOpen,
  // Calendar, Building2,
  BarChart,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Trash2,
  MessageSquare,
  MoreHorizontal,
  ClipboardCheck,
} from 'lucide-react';
import AttendanceSessionModal from './AttendanceSessionModal';
// import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';

interface CourseDetailPageProps {
  courseId: string;
  onBack: () => void;
  onStudentClick: (student: any) => void;
  onAnalyticsClick: (courseId: string) => void;
  onAttendanceClick: (courseId: string) => void;
  onLiveAttendanceClick?: (courseId: string) => void;
  onAttendanceHistoryClick?: (courseId: string) => void;
}

const CourseDetailPage = ({
  courseId,
  onBack,
  onStudentClick,
  // onAnalyticsClick,
  // onAttendanceClick,
  onLiveAttendanceClick,
  onAttendanceHistoryClick,
}: CourseDetailPageProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [requestFilter, setRequestFilter] = useState('pending');

  // Mock course data
  const courseData = {
    id: courseId,
    name: 'Advanced Database Systems',
    code: 'CS401',
    departments: ['Computer Science', 'Software Engineering'],
    semester: 'Harmattan',
    academicYear: '2024/2025',
    enrolledCount: 45,
    description: 'Advanced concepts in database design and management',
  };

  // Mock students data
  const mockStudents = [
    {
      id: '1',
      name: 'John Doe',
      gender: 'Male',
      regNumber: 'CS/2024/001',
      email: 'john.doe@university.edu',
      attendanceRate: 92,
      department: 'Computer Science',
    },
    {
      id: '2',
      name: 'Jane Smith',
      gender: 'Female',
      regNumber: 'CS/2024/002',
      email: 'jane.smith@university.edu',
      attendanceRate: 88,
      department: 'Software Engineering',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      gender: 'Male',
      regNumber: 'CS/2024/003',
      email: 'mike.johnson@university.edu',
      attendanceRate: 45,
      department: 'Computer Science',
    },
  ];

  // Mock join requests
  const mockRequests = [
    {
      id: 'req1',
      student: {
        name: 'Alice Wilson',
        regNumber: 'CS/2024/025',
        email: 'alice.wilson@university.edu',
        department: 'Computer Science',
      },
      status: 'pending',
      requestDate: '2024-01-15',
    },
    {
      id: 'req2',
      student: {
        name: 'Bob Davis',
        regNumber: 'CS/2024/026',
        email: 'bob.davis@university.edu',
        department: 'Software Engineering',
      },
      status: 'approved',
      requestDate: '2024-01-14',
    },
  ];

  const filteredRequests = mockRequests.filter(
    (req) => requestFilter === 'all' || req.status === requestFilter,
  );

  // Analytics calculations
  const avgAttendance = Math.round(
    mockStudents.reduce((sum, student) => sum + student.attendanceRate, 0) /
      mockStudents.length,
  );
  const bestStudent = mockStudents.reduce((best, student) =>
    student.attendanceRate > best.attendanceRate ? student : best,
  );
  const worstStudent = mockStudents.reduce((worst, student) =>
    student.attendanceRate < worst.attendanceRate ? student : worst,
  );
  const lowAttendanceCount = mockStudents.filter(
    (s) => s.attendanceRate < 50,
  ).length;

  const handleSelectAllStudents = (checked: boolean) => {
    setSelectedStudents(checked ? mockStudents.map((s) => s.id) : []);
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setSelectedStudents((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId),
    );
  };

  const handleSelectAllRequests = (checked: boolean) => {
    setSelectedRequests(checked ? filteredRequests.map((r) => r.id) : []);
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    setSelectedRequests((prev) =>
      checked ? [...prev, requestId] : prev.filter((id) => id !== requestId),
    );
  };

  const handleBulkApprove = () => {
    // toast({
    //   title: "Requests Approved",
    //   description: `${selectedRequests.length} join requests have been approved.`,
    // });
    setSelectedRequests([]);
  };

  const handleBulkReject = () => {
    // toast({
    //   title: "Requests Rejected",
    //   description: `${selectedRequests.length} join requests have been rejected.`,
    //   variant: "destructive"
    // });
    setSelectedRequests([]);
  };

  const handleBulkRemoveStudents = () => {
    // toast({
    //   title: "Students Removed",
    //   description: `${selectedStudents.length} students have been removed from the course.`,
    //   variant: "destructive"
    // });
    setSelectedStudents([]);
  };

  const handleBulkMessage = () => {
    // toast({
    //   title: "Message Sent",
    //   description: `Message sent to ${selectedStudents.length} students.`,
    // });
    setSelectedStudents([]);
  };

  const handleStartAttendance = (courseId: string) => {
    if (onLiveAttendanceClick) {
      onLiveAttendanceClick(courseId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:scale-110 transition-transform flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {courseData.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mt-1">
              <span className="font-medium">{courseData.code}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {courseData.departments.join(', ')}
              </span>
              <span className="sm:hidden text-xs">
                {courseData.departments[0]}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden md:inline">
                {courseData.academicYear} ({courseData.semester})
              </span>
              <span className="md:hidden text-xs">
                {courseData.academicYear}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                {courseData.enrolledCount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onAttendanceHistoryClick?.(courseId)}
            className="w-full sm:w-auto text-sm"
          >
            View History
          </Button>
          <AttendanceSessionModal
            courseId={courseId}
            courseName={courseData.name}
            onStartSession={handleStartAttendance}
          >
            <Button className="w-full sm:w-auto text-sm">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Take Attendance
            </Button>
          </AttendanceSessionModal>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="overview"
            className="transition-all text-xs sm:text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="transition-all text-xs sm:text-sm"
          >
            Students
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="transition-all text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Join Requests</span>
            <span className="sm:hidden">Requests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Course Name
                  </Label>
                  <p className="text-sm text-gray-900">{courseData.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Course Code
                  </Label>
                  <p className="text-sm text-gray-900">{courseData.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Departments
                  </Label>
                  <p className="text-sm text-gray-900">
                    {courseData.departments.join(', ')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <p className="text-sm text-gray-900">
                    {courseData.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-green-600" />
                  Class Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {courseData.enrolledCount}
                    </p>
                    <p className="text-xs text-gray-600">Total Students</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {avgAttendance}%
                    </p>
                    <p className="text-xs text-gray-600">Avg Attendance</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      Best: {bestStudent.name}
                    </span>
                    <Badge variant="secondary">
                      {bestStudent.attendanceRate}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      Needs Attention: {worstStudent.name}
                    </span>
                    <Badge variant="destructive">
                      {worstStudent.attendanceRate}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span>
                      {lowAttendanceCount} students below 50% attendance
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6 animate-fade-in">
          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <Card className="border-blue-200 bg-blue-50 animate-scale-in">
              <CardContent className="py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {selectedStudents.length} student(s) selected
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkMessage}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Send Message</span>
                      <span className="sm:hidden">Message</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkRemoveStudents}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Remove Selected</span>
                      <span className="sm:hidden">Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                Manage students enrolled in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedStudents.length === mockStudents.length
                          }
                          onCheckedChange={handleSelectAllStudents}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Reg Number</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => onStudentClick(student)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) =>
                              handleSelectStudent(
                                student.id,
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.regNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.attendanceRate >= 75
                                ? 'default'
                                : student.attendanceRate >= 50
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {student.attendanceRate}%
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => onStudentClick(student)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    checked={selectedStudents.length === mockStudents.length}
                    onCheckedChange={handleSelectAllStudents}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
                {mockStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onStudentClick(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) =>
                              handleSelectStudent(
                                student.id,
                                checked as boolean,
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {student.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {student.regNumber}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => onStudentClick(student)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{student.gender}</span>
                        <Badge
                          variant={
                            student.attendanceRate >= 75
                              ? 'default'
                              : student.attendanceRate >= 50
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {student.attendanceRate}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6 animate-fade-in">
          {/* Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filter Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={requestFilter} onValueChange={setRequestFilter}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedRequests.length > 0 && (
            <Card className="border-green-200 bg-green-50 animate-scale-in">
              <CardContent className="py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {selectedRequests.length} request(s) selected
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleBulkApprove}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Approve Selected</span>
                      <span className="sm:hidden">Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkReject}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Reject Selected</span>
                      <span className="sm:hidden">Reject</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Join Requests</CardTitle>
              <CardDescription>
                Review and manage student join requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedRequests.length === filteredRequests.length
                          }
                          onCheckedChange={handleSelectAllRequests}
                        />
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Reg Number</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedRequests.includes(request.id)}
                            onCheckedChange={(checked) =>
                              handleSelectRequest(
                                request.id,
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.student.name}
                        </TableCell>
                        <TableCell>{request.student.regNumber}</TableCell>
                        <TableCell>{request.student.department}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === 'approved'
                                ? 'default'
                                : request.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    checked={
                      selectedRequests.length === filteredRequests.length
                    }
                    onCheckedChange={handleSelectAllRequests}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
                {filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRequests.includes(request.id)}
                            onCheckedChange={(checked) =>
                              handleSelectRequest(
                                request.id,
                                checked as boolean,
                              )
                            }
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {request.student.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.student.regNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.student.department}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            request.status === 'approved'
                              ? 'default'
                              : request.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetailPage;
