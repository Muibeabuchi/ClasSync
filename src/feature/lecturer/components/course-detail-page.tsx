// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   ArrowLeft,
//   Users,
//   BookOpen,
//   //   Calendar,
//   //   Building2,
//   BarChart,
//   TrendingUp,
//   AlertTriangle,
//   Check,
//   X,
//   Trash2,
//   MessageSquare,
//   MoreHorizontal,
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { toast } from 'sonner';
// import { Label } from '@/components/ui/label';

// interface CourseDetailPageProps {
//   courseId: string;
//   onBack: () => void;
//   onStudentClick: (student: any) => void;
//   onAnalyticsClick: (courseId: string) => void;
//   onAttendanceClick: (courseId: string) => void;
//   onLiveAttendanceClick: () => void;
//   onAttendanceHistoryClick:()=>void
// }

// const CourseDetailPage = ({
//   courseId,
//   onBack,
//   onStudentClick,
//   //   onAnalyticsClick,
//   //   onAttendanceClick,
// }: CourseDetailPageProps) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
//   const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
//   const [requestFilter, setRequestFilter] = useState('pending');

//   // Mock course data
//   const courseData = {
//     id: courseId,
//     name: 'Advanced Database Systems',
//     code: 'CS401',
//     departments: ['Computer Science', 'Software Engineering'],
//     semester: 'Harmattan',
//     academicYear: '2024/2025',
//     enrolledCount: 45,
//     description: 'Advanced concepts in database design and management',
//   };

//   // Mock students data
//   const mockStudents = [
//     {
//       id: '1',
//       name: 'John Doe',
//       gender: 'Male',
//       regNumber: 'CS/2024/001',
//       email: 'john.doe@university.edu',
//       attendanceRate: 92,
//       department: 'Computer Science',
//     },
//     {
//       id: '2',
//       name: 'Jane Smith',
//       gender: 'Female',
//       regNumber: 'CS/2024/002',
//       email: 'jane.smith@university.edu',
//       attendanceRate: 88,
//       department: 'Software Engineering',
//     },
//     {
//       id: '3',
//       name: 'Mike Johnson',
//       gender: 'Male',
//       regNumber: 'CS/2024/003',
//       email: 'mike.johnson@university.edu',
//       attendanceRate: 45,
//       department: 'Computer Science',
//     },
//   ];

//   // Mock join requests
//   const mockRequests = [
//     {
//       id: 'req1',
//       student: {
//         name: 'Alice Wilson',
//         regNumber: 'CS/2024/025',
//         email: 'alice.wilson@university.edu',
//         department: 'Computer Science',
//       },
//       status: 'pending',
//       requestDate: '2024-01-15',
//     },
//     {
//       id: 'req2',
//       student: {
//         name: 'Bob Davis',
//         regNumber: 'CS/2024/026',
//         email: 'bob.davis@university.edu',
//         department: 'Software Engineering',
//       },
//       status: 'approved',
//       requestDate: '2024-01-14',
//     },
//   ];

//   const filteredRequests = mockRequests.filter(
//     (req) => requestFilter === 'all' || req.status === requestFilter,
//   );

//   // Analytics calculations
//   const avgAttendance = Math.round(
//     mockStudents.reduce((sum, student) => sum + student.attendanceRate, 0) /
//       mockStudents.length,
//   );
//   const bestStudent = mockStudents.reduce((best, student) =>
//     student.attendanceRate > best.attendanceRate ? student : best,
//   );
//   const worstStudent = mockStudents.reduce((worst, student) =>
//     student.attendanceRate < worst.attendanceRate ? student : worst,
//   );
//   const lowAttendanceCount = mockStudents.filter(
//     (s) => s.attendanceRate < 50,
//   ).length;

//   const handleSelectAllStudents = (checked: boolean) => {
//     setSelectedStudents(checked ? mockStudents.map((s) => s.id) : []);
//   };

//   const handleSelectStudent = (studentId: string, checked: boolean) => {
//     setSelectedStudents((prev) =>
//       checked ? [...prev, studentId] : prev.filter((id) => id !== studentId),
//     );
//   };

//   const handleSelectAllRequests = (checked: boolean) => {
//     setSelectedRequests(checked ? filteredRequests.map((r) => r.id) : []);
//   };

//   const handleSelectRequest = (requestId: string, checked: boolean) => {
//     setSelectedRequests((prev) =>
//       checked ? [...prev, requestId] : prev.filter((id) => id !== requestId),
//     );
//   };

//   const handleBulkApprove = () => {
//     toast.success(
//       `Requests Approved ${selectedRequests.length} join requests have been approved.`,
//     );
//     setSelectedRequests([]);
//   };

//   const handleBulkReject = () => {
//     toast.success(
//       `Requests Rejected ${selectedRequests.length} join requests have been rejected.`,
//     );
//     setSelectedRequests([]);
//   };

//   const handleBulkRemoveStudents = () => {
//     toast.success(
//       `Students Removed ${selectedStudents.length} students have been removed from the course.`,
//     );
//     setSelectedStudents([]);
//   };

//   const handleBulkMessage = () => {
//     toast.success(
//       `Message Sent Message sent to ${selectedStudents.length} students.`,
//     );
//     setSelectedStudents([]);
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex items-center space-x-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={onBack}
//           className="hover:scale-110 transition-transform"
//         >
//           <ArrowLeft className="h-4 w-4" />
//         </Button>
//         <div className="flex-1">
//           <h1 className="text-2xl font-bold text-foreground">
//             {courseData.name}
//           </h1>
//           <div className="flex items-center gap-4 text-muted-foreground">
//             <span>{courseData.code}</span>
//             <span>•</span>
//             <span>{courseData.departments.join(', ')}</span>
//             <span>•</span>
//             <span>
//               {courseData.academicYear} ({courseData.semester})
//             </span>
//             <span>•</span>
//             <span className="flex items-center gap-1">
//               <Users className="h-4 w-4" />
//               {courseData.enrolledCount} students
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <Tabs
//         value={activeTab}
//         onValueChange={setActiveTab}
//         className="space-y-6"
//       >
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="overview" className="transition-all">
//             Overview
//           </TabsTrigger>
//           <TabsTrigger value="students" className="transition-all">
//             Students
//           </TabsTrigger>
//           <TabsTrigger value="requests" className="transition-all">
//             Join Requests
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview" className="space-y-6 animate-fade-in">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <BookOpen className="h-5 w-5 text-primary" />
//                   Course Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label className="text-sm font-medium text-muted-foreground">
//                     Course Name
//                   </Label>
//                   <p className="text-sm text-foreground">{courseData.name}</p>
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium text-muted-foreground">
//                     Course Code
//                   </Label>
//                   <p className="text-sm text-foreground">{courseData.code}</p>
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium text-muted-foreground">
//                     Departments
//                   </Label>
//                   <p className="text-sm text-foreground">
//                     {courseData.departments.join(', ')}
//                   </p>
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium text-muted-foreground">
//                     Description
//                   </Label>
//                   <p className="text-sm text-foreground">
//                     {courseData.description}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <BarChart className="h-5 w-5 text-chart-2" />
//                   Class Analytics
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="text-center p-3 bg-primary/10 rounded-lg">
//                     <p className="text-2xl font-bold text-primary">
//                       {courseData.enrolledCount}
//                     </p>
//                     <p className="text-xs text-muted-foreground">
//                       Total Students
//                     </p>
//                   </div>
//                   <div className="text-center p-3 bg-chart-2/10 rounded-lg">
//                     <p className="text-2xl font-bold text-chart-2">
//                       {avgAttendance}%
//                     </p>
//                     <p className="text-xs text-muted-foreground">
//                       Avg Attendance
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2 text-sm">
//                     <TrendingUp className="h-4 w-4 text-chart-2" />
//                     <span className="font-medium">
//                       Best: {bestStudent.name}
//                     </span>
//                     <Badge variant="secondary">
//                       {bestStudent.attendanceRate}%
//                     </Badge>
//                   </div>

//                   <div className="flex items-center gap-2 text-sm">
//                     <AlertTriangle className="h-4 w-4 text-destructive" />
//                     <span className="font-medium">
//                       Needs Attention: {worstStudent.name}
//                     </span>
//                     <Badge variant="destructive">
//                       {worstStudent.attendanceRate}%
//                     </Badge>
//                   </div>

//                   <div className="flex items-center gap-2 text-sm">
//                     <AlertTriangle className="h-4 w-4 text-chart-5" />
//                     <span>
//                       {lowAttendanceCount} students below 50% attendance
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         <TabsContent value="students" className="space-y-6 animate-fade-in">
//           {/* Bulk Actions */}
//           {selectedStudents.length > 0 && (
//             <Card className="border-primary/20 bg-primary/5 animate-scale-in">
//               <CardContent className="py-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">
//                     {selectedStudents.length} student(s) selected
//                   </span>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={handleBulkMessage}
//                     >
//                       <MessageSquare className="h-4 w-4 mr-1" />
//                       Send Message
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={handleBulkRemoveStudents}
//                     >
//                       <Trash2 className="h-4 w-4 mr-1" />
//                       Remove Selected
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           <Card>
//             <CardHeader>
//               <CardTitle>Enrolled Students</CardTitle>
//               <CardDescription>
//                 Manage students enrolled in this course
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-12">
//                       <Checkbox
//                         checked={
//                           selectedStudents.length === mockStudents.length
//                         }
//                         onCheckedChange={handleSelectAllStudents}
//                       />
//                     </TableHead>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Gender</TableHead>
//                     <TableHead>Reg Number</TableHead>
//                     <TableHead>Attendance</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {mockStudents.map((student) => (
//                     <TableRow
//                       key={student.id}
//                       className="hover:bg-muted/50 transition-colors cursor-pointer"
//                       onClick={() => onStudentClick(student)}
//                     >
//                       <TableCell onClick={(e) => e.stopPropagation()}>
//                         <Checkbox
//                           checked={selectedStudents.includes(student.id)}
//                           onCheckedChange={(checked) =>
//                             handleSelectStudent(student.id, checked as boolean)
//                           }
//                         />
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {student.name}
//                       </TableCell>
//                       <TableCell>{student.gender}</TableCell>
//                       <TableCell>{student.regNumber}</TableCell>
//                       <TableCell>
//                         <Badge
//                           variant={
//                             student.attendanceRate >= 75
//                               ? 'default'
//                               : student.attendanceRate >= 50
//                                 ? 'secondary'
//                                 : 'destructive'
//                           }
//                         >
//                           {student.attendanceRate}%
//                         </Badge>
//                       </TableCell>
//                       <TableCell onClick={(e) => e.stopPropagation()}>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="sm">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent>
//                             <DropdownMenuItem
//                               onClick={() => onStudentClick(student)}
//                             >
//                               View Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem>Remove</DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="requests" className="space-y-6 animate-fade-in">
//           {/* Filter */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg">Filter Requests</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Select value={requestFilter} onValueChange={setRequestFilter}>
//                 <SelectTrigger className="w-full max-w-md">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Requests</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="approved">Approved</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                 </SelectContent>
//               </Select>
//             </CardContent>
//           </Card>

//           {/* Bulk Actions */}
//           {selectedRequests.length > 0 && (
//             <Card className="border-chart-2/20 bg-chart-2/5 animate-scale-in">
//               <CardContent className="py-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">
//                     {selectedRequests.length} request(s) selected
//                   </span>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="default"
//                       onClick={handleBulkApprove}
//                     >
//                       <Check className="h-4 w-4 mr-1" />
//                       Approve Selected
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={handleBulkReject}
//                     >
//                       <X className="h-4 w-4 mr-1" />
//                       Reject Selected
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           <Card>
//             <CardHeader>
//               <CardTitle>Join Requests</CardTitle>
//               <CardDescription>
//                 Review and manage student join requests
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-12">
//                       <Checkbox
//                         checked={
//                           selectedRequests.length === filteredRequests.length
//                         }
//                         onCheckedChange={handleSelectAllRequests}
//                       />
//                     </TableHead>
//                     <TableHead>Student</TableHead>
//                     <TableHead>Reg Number</TableHead>
//                     <TableHead>Department</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredRequests.map((request) => (
//                     <TableRow
//                       key={request.id}
//                       className="hover:bg-muted/50 transition-colors"
//                     >
//                       <TableCell>
//                         <Checkbox
//                           checked={selectedRequests.includes(request.id)}
//                           onCheckedChange={(checked) =>
//                             handleSelectRequest(request.id, checked as boolean)
//                           }
//                         />
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {request.student.name}
//                       </TableCell>
//                       <TableCell>{request.student.regNumber}</TableCell>
//                       <TableCell>{request.student.department}</TableCell>
//                       <TableCell>
//                         <Badge
//                           variant={
//                             request.status === 'approved'
//                               ? 'default'
//                               : request.status === 'rejected'
//                                 ? 'destructive'
//                                 : 'secondary'
//                           }
//                         >
//                           {request.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         {request.status === 'pending' && (
//                           <div className="flex gap-1">
//                             <Button size="sm" variant="default">
//                               <Check className="h-4 w-4" />
//                             </Button>
//                             <Button size="sm" variant="destructive">
//                               <X className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default CourseDetailPage;
