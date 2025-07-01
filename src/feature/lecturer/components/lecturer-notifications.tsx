import { useState } from 'react';
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  // BookOpen,
} from 'lucide-react';

const LecturerNotifications = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'join_request',
      title: 'New Join Request',
      message:
        'Alice Johnson has requested to join CS401 - Advanced Database Systems',
      timestamp: '5 minutes ago',
      isRead: false,
      course: 'CS401',
      priority: 'high',
    },
    {
      id: 2,
      type: 'student_message',
      title: 'Message from Student',
      message: 'Bob Wilson asked about Assignment 3 requirements in CS301',
      timestamp: '2 hours ago',
      isRead: false,
      course: 'CS301',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'attendance_low',
      title: 'Low Attendance Alert',
      message: 'Carol Martinez attendance has dropped below 75% in CS451',
      timestamp: '1 day ago',
      isRead: true,
      course: 'CS451',
      priority: 'high',
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'join_request':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'student_message':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'attendance_low':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with course activities</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} unread</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="join_request">Join Requests</SelectItem>
              <SelectItem value="student_message">Student Messages</SelectItem>
              <SelectItem value="attendance_low">Attendance Alerts</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`hover:shadow-md transition-shadow ${
              !notification.isRead
                ? 'border-l-4 border-l-blue-500 bg-blue-50'
                : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {notification.course && (
                        <Badge variant="outline" className="text-xs">
                          {notification.course}
                        </Badge>
                      )}
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LecturerNotifications;
