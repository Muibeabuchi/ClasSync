import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

// interface StudentNotificationsProps {
//   onBack: () => void;
// }

const StudentNotifications = () => {
  const [filter, setFilter] = useState('all');

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'attendance',
      title: 'Attendance Session Active',
      message:
        'CS401 - Advanced Database Systems attendance is now open. Check in before 10:15 AM.',
      timestamp: '5 minutes ago',
      isRead: false,
      course: 'CS401',
      priority: 'high',
    },
    {
      id: 2,
      type: 'join_approved',
      title: 'Join Request Approved',
      message:
        'Your request to join CS451 - Machine Learning has been approved by Engr. Lisa Chen.',
      timestamp: '2 hours ago',
      isRead: false,
      course: 'CS451',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'message',
      title: 'Course Update',
      message:
        'Assignment 3 deadline for Software Engineering has been extended to next Friday.',
      timestamp: '1 day ago',
      isRead: true,
      course: 'CS301',
      priority: 'medium',
    },
    {
      id: 4,
      type: 'attendance_reminder',
      title: 'Low Attendance Warning',
      message:
        'Your attendance in CS301 - Software Engineering is below 75%. Please attend upcoming classes.',
      timestamp: '2 days ago',
      isRead: true,
      course: 'CS301',
      priority: 'high',
    },
    {
      id: 5,
      type: 'join_rejected',
      title: 'Join Request Declined',
      message:
        'Your request to join CS380 - Cybersecurity Fundamentals was declined. Course is at capacity.',
      timestamp: '3 days ago',
      isRead: true,
      course: 'CS380',
      priority: 'low',
    },
    {
      id: 6,
      type: 'course_update',
      title: 'Schedule Change',
      message:
        'Machine Learning class on Friday has been moved to 2:00 PM instead of 11:00 AM.',
      timestamp: '1 week ago',
      isRead: true,
      course: 'CS451',
      priority: 'medium',
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'join_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'join_rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'message':
      case 'course_update':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'attendance_reminder':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your courses and activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} unread</Badge>
        )}
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="join_approved">Join Approved</SelectItem>
                <SelectItem value="join_rejected">Join Rejected</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="course_update">Course Updates</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setFilter('all')}>
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`hover:shadow-md transition-shadow ${
              !notification.isRead
                ? 'border-l-4 ' + getPriorityColor(notification.priority)
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
                  <p className="text-xs text-gray-500">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600">Try adjusting your filter settings</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentNotifications;
