import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Clock,
  Users,
  AlertCircle,
  Info,
  CheckCircle,
  // X,
} from 'lucide-react';
// import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'join_request' | 'attendance_ended' | 'system' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedCourse?: string;
  actionRequired?: boolean;
}

interface NotificationInboxProps {
  onBack: () => void;
}

const NotificationInbox = ({ onBack }: NotificationInboxProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'join_request',
      title: 'New Join Request',
      message: 'John Doe wants to join Computer Science 101',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      priority: 'high',
      relatedCourse: 'CS101',
      actionRequired: true,
    },
    {
      id: '2',
      type: 'attendance_ended',
      title: 'Attendance Session Ended',
      message: 'CS101 attendance session completed. 42/45 students checked in.',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: false,
      priority: 'medium',
      relatedCourse: 'CS101',
    },
    {
      id: '3',
      type: 'join_request',
      title: 'New Join Request',
      message: 'Sarah Smith wants to join Software Engineering 201',
      timestamp: '2024-01-15T08:45:00Z',
      isRead: true,
      priority: 'high',
      relatedCourse: 'SE201',
      actionRequired: true,
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
      timestamp: '2024-01-14T16:00:00Z',
      isRead: true,
      priority: 'low',
    },
    {
      id: '5',
      type: 'info',
      title: 'New Feature Available',
      message: 'ClassList management is now available in your dashboard!',
      timestamp: '2024-01-14T14:30:00Z',
      isRead: false,
      priority: 'low',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'action'>(
    'all',
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const actionRequiredCount = notifications.filter(
    (n) => n.actionRequired && !n.isRead,
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'unread' && !notification.isRead) ||
      (filterType === 'action' && notification.actionRequired);

    return matchesSearch && matchesFilter;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    // toast({
    //   title: 'All notifications marked as read',
    //   description: `${unreadCount} notifications updated.`,
    // });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // toast({
    //   title: 'Notification deleted',
    //   description: 'The notification has been removed.',
    // });
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass =
      priority === 'high'
        ? 'text-red-500'
        : priority === 'medium'
          ? 'text-yellow-500'
          : 'text-blue-500';

    switch (type) {
      case 'join_request':
        return <Users className={`h-5 w-5 ${iconClass}`} />;
      case 'attendance_ended':
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />;
      case 'system':
        return <AlertCircle className={`h-5 w-5 ${iconClass}`} />;
      case 'info':
        return <Info className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6 animate-slide-in-bottom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your ClassSync activities
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bell className="h-6 w-6 text-chart-1" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{actionRequiredCount}</p>
                <p className="text-sm text-muted-foreground">Action Required</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterType === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilterType('unread')}
                size="sm"
              >
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={filterType === 'action' ? 'default' : 'outline'}
                onClick={() => setFilterType('action')}
                size="sm"
              >
                <Filter className="h-4 w-4 mr-1" />
                Action Required
                {actionRequiredCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {actionRequiredCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No notifications match your search.'
                  : 'No notifications found.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`glass-card transition-all duration-200 hover:shadow-md ${
                !notification.isRead
                  ? 'border-l-4 border-l-primary bg-primary/5'
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(
                      notification.type,
                      notification.priority,
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3
                            className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                          {notification.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          {notification.relatedCourse && (
                            <Badge variant="outline" className="text-xs">
                              {notification.relatedCourse}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationInbox;
