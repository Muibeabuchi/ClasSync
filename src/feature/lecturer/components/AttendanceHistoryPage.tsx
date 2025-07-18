import { useState } from 'react';
// import { useParams, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  //  ArrowLeft,
  Eye,
  Filter,
  Download,
  Calendar,
} from 'lucide-react';

interface AttendanceSession {
  id: string;
  date: string;
  timeStarted: string;
  studentsPresent: number;
  totalStudents: number;
  duration: string;
  requiredCode: boolean;
  status: 'completed' | 'incomplete';
}

const AttendanceHistoryPage = () => {
  // const { courseId } = useParams({
  //   from: ""
  // });
  // const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data
  const sessions: AttendanceSession[] = [
    {
      id: '1',
      date: 'July 15, 2025',
      timeStarted: '10:15 AM',
      studentsPresent: 34,
      totalStudents: 40,
      duration: '1 min',
      requiredCode: true,
      status: 'completed',
    },
    {
      id: '2',
      date: 'July 12, 2025',
      timeStarted: '10:18 AM',
      studentsPresent: 38,
      totalStudents: 40,
      duration: '1 min',
      requiredCode: false,
      status: 'completed',
    },
    {
      id: '3',
      date: 'July 10, 2025',
      timeStarted: '10:12 AM',
      studentsPresent: 29,
      totalStudents: 40,
      duration: '1 min',
      requiredCode: true,
      status: 'completed',
    },
    {
      id: '4',
      date: 'July 8, 2025',
      timeStarted: '10:20 AM',
      studentsPresent: 0,
      totalStudents: 40,
      duration: '0 min',
      requiredCode: false,
      status: 'incomplete',
    },
  ];

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'completed' && session.status !== 'completed') return false;
    if (filter === 'incomplete' && session.status !== 'incomplete')
      return false;
    if (filter === 'with_code' && !session.requiredCode) return false;
    return true;
  });

  const getAttendanceRate = (present: number, total: number) => {
    return Math.round((present / total) * 100);
  };

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 80)
      return <Badge className="bg-green-100 text-green-800">{rate}%</Badge>;
    if (rate >= 60) return <Badge variant="secondary">{rate}%</Badge>;
    return <Badge variant="destructive">{rate}%</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" onClick={() => navigate(`/dashboard/courses/${courseId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance History
            </h1>
            <p className="text-gray-600">CSC 401 - Compiler Design</p>
          </div>
        </div>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {sessions.length}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  sessions.reduce(
                    (acc, s) =>
                      acc +
                      getAttendanceRate(s.studentsPresent, s.totalStudents),
                    0,
                  ) / sessions.length,
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Avg Attendance</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sessions.filter((s) => s.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {sessions.filter((s) => s.requiredCode).length}
              </div>
              <div className="text-sm text-gray-600">Used Code</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="completed">Completed Only</SelectItem>
                  <SelectItem value="incomplete">Incomplete Only</SelectItem>
                  <SelectItem value="with_code">With Code Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>
            Showing {filteredSessions.length} of {sessions.length} sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Date</TableHead>
                <TableHead>Time Started</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Code Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {session.date}
                    </div>
                  </TableCell>
                  <TableCell>{session.timeStarted}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {session.studentsPresent}/{session.totalStudents}
                      </span>
                      {getAttendanceBadge(
                        getAttendanceRate(
                          session.studentsPresent,
                          session.totalStudents,
                        ),
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>
                    {session.requiredCode ? (
                      <Badge variant="outline">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === 'completed'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {session.status === 'completed'
                        ? 'Completed'
                        : 'Incomplete'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      // onClick={() => navigate(`/dashboard/attendance/session/${session.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistoryPage;
