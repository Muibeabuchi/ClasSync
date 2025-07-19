// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import {
//   Users,
//   Clock,
//   MapPin,
//   Key,
//   // Play,
//   CheckCircle,
//   AlertCircle,
//   // RefreshCw,
//   // Copy,
//   // Pause,
// } from 'lucide-react';
// // import { toast } from 'sonner';
// // import { useCreateAttendanceSession } from '@/feature/attendance/api';
// // import type { Id } from 'convex/_generated/dataModel';

// interface AttendanceSessionSetupProps {
//   courseId: string;
//   courseName: string;
//   onBack: () => void;
// }

// const AttendanceSessionSetup = ({
//   // courseId,
//   courseName,
//   onBack,
// }: AttendanceSessionSetupProps) => {
//   const [requireCode, setRequireCode] = useState(false);
//   const [attendanceCode] = useState('');

//   // const generateAttendanceCode = () => {
//   //   const code = Math.floor(100000 + Math.random() * 900000).toString();
//   //   setAttendanceCode(code);
//   //   toast.success('Attendance Code Generated', {
//   //     description: `New code: ${code}`,
//   //     icon: <Key className="h-4 w-4" />,
//   //   });
//   // };

//   // const startAttendanceSession = async () => {
//   //   if (requireCode && !attendanceCode) {
//   //     generateAttendanceCode();
//   //   }

//   // };

//   // const copyAttendanceCode = () => {
//   //   navigator.clipboard.writeText(attendanceCode);

//   // };

//   // const formatTime = (seconds: number) => {
//   //   const mins = Math.floor(seconds / 60);
//   //   const secs = seconds % 60;
//   //   return `${mins}:${secs.toString().padStart(2, '0')}`;
//   // };

//   return (
//     <div className="space-y-6 animate-slide-in-bottom">
//       {/* Header */}
//       <div className="flex items-center space-x-4">
//         <Button variant="ghost" onClick={onBack}>
//           ← Back to Course
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold gradient-text">
//             Attendance Session
//           </h1>
//           <p className="text-muted-foreground">{courseName}</p>
//         </div>
//       </div>

//       {/* Session Status */}
//       {/* <Card className="glass-card">
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className={`${getPhaseColor()}`}>{getPhaseIcon()}</div>
//               <div>
//                 <h3 className="font-semibold capitalize">
//                   {sessionPhase} Phase
//                 </h3>
//                 <p className="text-sm text-muted-foreground">
//                   {sessionPhase === 'setup' &&
//                     'Configure your attendance session'}
//                   {sessionPhase === 'preparation' &&
//                     'Students are preparing to check in'}
//                   {sessionPhase === 'active' && 'Students can now check in'}
//                   {sessionPhase === 'completed' &&
//                     'Attendance session has ended'}
//                 </p>
//               </div>
//             </div>

//             {(sessionPhase === 'preparation' || sessionPhase === 'active') && (
//               <div className="text-right">
//                 <div className="text-3xl font-bold">
//                   {formatTime(countdown)}
//                 </div>
//                 <div className="text-sm text-muted-foreground">
//                   {sessionPhase === 'preparation'
//                     ? 'until active'
//                     : 'remaining'}
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card> */}

//       <div className="grid gap-6 lg:grid-cols-2">
//         {/* Session Configuration */}
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Users className="h-5 w-5 text-primary" />
//               Session Configuration
//             </CardTitle>
//             <CardDescription>
//               Configure attendance session settings
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Duration Info */}
//             <div className="p-4 bg-muted/20 rounded-lg">
//               <div className="flex items-center gap-2 mb-2">
//                 <Clock className="h-4 w-4 text-chart-1" />
//                 <span className="font-medium">Session Duration</span>
//               </div>
//               <p className="text-sm text-muted-foreground">
//                 Attendance sessions are 1 minute long by default and cannot be
//                 customized. You can change duration from the Settings page.
//               </p>
//             </div>

//             {/* GPS Location */}
//             <div className="p-4 bg-muted/20 rounded-lg">
//               <div className="flex items-center gap-2 mb-2">
//                 <MapPin className="h-4 w-4 text-chart-2" />
//                 <span className="font-medium">Location Requirement</span>
//               </div>
//               <p className="text-sm text-muted-foreground">
//                 Students must be within 50m radius to check in (configured in
//                 Settings)
//               </p>
//             </div>

//             {/* Attendance Code Toggle */}
//             <div className="flex items-center justify-between p-4 border rounded-lg">
//               <div className="flex items-center space-x-3">
//                 <Key className="h-5 w-5 text-chart-3" />
//                 <div>
//                   <Label htmlFor="require-code" className="font-medium">
//                     Require Attendance Code
//                   </Label>
//                   <p className="text-sm text-muted-foreground">
//                     Students must enter a code to check in
//                   </p>
//                 </div>
//               </div>
//               <Switch
//                 id="require-code"
//                 checked={requireCode}
//                 onCheckedChange={setRequireCode}
//                 // disabled={sessionPhase !== 'setup'}
//               />
//             </div>

//             {/* Attendance Code Display */}
//             {/* {requireCode && (
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <Label>Attendance Code</Label>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={generateAttendanceCode}
//                     disabled={sessionPhase === 'active'}
//                   >
//                     <RefreshCw className="h-4 w-4 mr-2" />
//                     Generate New
//                   </Button>
//                 </div>

//                 {attendanceCode ? (
//                   <div className="flex items-center space-x-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
//                     <div className="flex-1">
//                       <div className="text-2xl font-bold font-mono text-primary">
//                         {attendanceCode}
//                       </div>
//                       <p className="text-sm text-muted-foreground">
//                         Share this code with your students
//                       </p>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={copyAttendanceCode}
//                     >
//                       <Copy className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
//                     <p className="text-muted-foreground">
//                       {`Click "Generate New" to create an attendance code`}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )} */}

//             {/* Action Button */}
//             {/* {sessionPhase === 'setup' && (
//               <Button
//                 onClick={startAttendanceSession}
//                 className="w-full bg-primary hover:bg-primary/90"
//                 size="lg"
//               >
//                 <Play className="h-5 w-5 mr-2" />
//                 Start Attendance Session
//               </Button>
//             )} */}
//           </CardContent>
//         </Card>

//         {/* Live Statistics */}
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <CheckCircle className="h-5 w-5 text-green-500" />
//               Live Statistics
//             </CardTitle>
//             <CardDescription>Real-time attendance tracking</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Attendance Progress */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium">Students Checked In</span>
//                 <span className="text-sm text-muted-foreground">
//                   {studentsCheckedIn} / {totalStudents}
//                 </span>
//               </div>
//               <div className="w-full bg-muted/30 rounded-full h-3">
//                 <div
//                   className="bg-primary h-3 rounded-full transition-all duration-500"
//                   style={{
//                     width: `${(studentsCheckedIn / totalStudents) * 100}%`,
//                   }}
//                 />
//               </div>
//               <div className="text-center mt-2">
//                 <Badge variant="secondary">
//                   {Math.round((studentsCheckedIn / totalStudents) * 100)}%
//                   attendance
//                 </Badge>
//               </div>
//             </div>

//             {/* Session Stats */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="text-center p-4 bg-muted/20 rounded-lg">
//                 <div className="text-2xl font-bold text-green-500">
//                   {studentsCheckedIn}
//                 </div>
//                 <div className="text-sm text-muted-foreground">Present</div>
//               </div>
//               <div className="text-center p-4 bg-muted/20 rounded-lg">
//                 <div className="text-2xl font-bold text-red-500">
//                   {totalStudents - studentsCheckedIn}
//                 </div>
//                 <div className="text-sm text-muted-foreground">Absent</div>
//               </div>
//             </div>

//             {/* Session Instructions */}
//             <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
//               <div className="flex items-center gap-2 mb-2">
//                 <AlertCircle className="h-4 w-4 text-blue-500" />
//                 <span className="font-medium text-blue-500">
//                   Instructions for Students
//                 </span>
//               </div>
//               <ul className="text-sm text-muted-foreground space-y-1">
//                 <li>• Open ClassSync mobile app</li>
//                 <li>• Ensure location services are enabled</li>
//                 <li>• Be within 50m of the classroom</li>
//                 {requireCode && (
//                   <li>
//                     • Enter the attendance code:{' '}
//                     <strong>{attendanceCode}</strong>
//                   </li>
//                 )}
//                 <li>{`• Tap "Check In" when session is active`}</li>
//               </ul>
//             </div>

//             {/* {sessionPhase === 'completed' && (
//               <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
//                 <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
//                 <p className="font-medium text-green-500">Session Completed</p>
//                 <p className="text-sm text-muted-foreground">
//                   Final attendance: {studentsCheckedIn}/{totalStudents} students
//                 </p>
//               </div>
//             )} */}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default AttendanceSessionSetup;
