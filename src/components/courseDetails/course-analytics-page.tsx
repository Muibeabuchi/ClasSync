import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  BarChart,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface CourseAnalyticsPageProps {
  courseId: string;
  onBack: () => void;
}

const CourseAnalyticsPage = ({
  //   courseId,
  onBack,
}: CourseAnalyticsPageProps) => {
  // Mock analytics data
  const analyticsData = {
    totalStudents: 45,
    sessionsHeld: 12,
    averageAttendance: 78,
    topStudents: [
      { id: 1, name: 'Alice Johnson', avatar: '', attendance: 98 },
      { id: 2, name: 'Bob Smith', avatar: '', attendance: 95 },
      { id: 3, name: 'Carol Davis', avatar: '', attendance: 92 },
      { id: 4, name: 'David Wilson', avatar: '', attendance: 90 },
      { id: 5, name: 'Emma Brown', avatar: '', attendance: 88 },
    ],
    bottomStudents: [
      { id: 6, name: 'Frank Miller', avatar: '', attendance: 45 },
      { id: 7, name: 'Grace Lee', avatar: '', attendance: 42 },
      { id: 8, name: 'Henry Garcia', avatar: '', attendance: 38 },
      { id: 9, name: 'Ivy Martinez', avatar: '', attendance: 35 },
      { id: 10, name: 'Jack Rodriguez', avatar: '', attendance: 32 },
    ],
  };

  //   const mockAttendanceData = [
  //     { session: 1, attendance: 85 },
  //     { session: 2, attendance: 78 },
  //     { session: 3, attendance: 82 },
  //     { session: 4, attendance: 75 },
  //     { session: 5, attendance: 88 },
  //     { session: 6, attendance: 79 },
  //     { session: 7, attendance: 83 },
  //     { session: 8, attendance: 77 },
  //     { session: 9, attendance: 81 },
  //     { session: 10, attendance: 74 },
  //     { session: 11, attendance: 86 },
  //     { session: 12, attendance: 80 },
  //   ];

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
          <h1 className="text-2xl font-bold text-gray-900">Course Analytics</h1>
          <p className="text-gray-600">
            Advanced Database Systems - Performance insights
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData.totalStudents}
            </div>
            <p className="text-sm text-gray-600">Enrolled Students</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Calendar className="h-8 w-8 text-green-600" />
              <Badge variant="secondary">Sessions</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analyticsData.sessionsHeld}
            </div>
            <p className="text-sm text-gray-600">Sessions Held</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <BarChart className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary">Average</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsData.averageAttendance}%
            </div>
            <p className="text-sm text-gray-600">Avg Attendance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <Badge variant="secondary">Trend</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">+5.2%</div>
            <p className="text-sm text-gray-600">vs Last Month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top 5 Students
            </CardTitle>
            <CardDescription>Best attendance performers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{student.name}</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    {student.attendance}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Bottom 5 Students
            </CardTitle>
            <CardDescription>Students needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.bottomStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{student.name}</span>
                  </div>
                  <Badge variant="destructive">{student.attendance}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Graph Placeholder */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-600" />
            Attendance per Session
          </CardTitle>
          <CardDescription>Session-wise attendance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Attendance Chart Placeholder
              </p>
              <p className="text-sm text-gray-500">
                Interactive chart showing attendance trends across{' '}
                {analyticsData.sessionsHeld} sessions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseAnalyticsPage;
