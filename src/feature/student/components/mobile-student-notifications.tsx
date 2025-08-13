import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobilePageContainer } from '@/components/mobile/MobilePageContainer';
import {
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Filter,
  Check,
  // X,
  // MoreHorizontal,
  Trash2,
  Mail,
  MailOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  type:
    | 'attendance'
    | 'join_approved'
    | 'join_rejected'
    | 'message'
    | 'course_update'
    | 'attendance_reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  course?: string;
  priority: 'high' | 'medium' | 'low';
}

interface SwipeState {
  id: number | null;
  startX: number;
  currentX: number;
  isDragging: boolean;
  direction: 'left' | 'right' | null;
}

const MobileStudentNotifications = () => {
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    id: null,
    startX: 0,
    currentX: 0,
    isDragging: false,
    direction: null,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  // Mock notifications - in real app, this would come from Convex
  const [notifications, setNotifications] = useState<Notification[]>([
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
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Clock className="h-4 w-4 text-chart-2" />;
      case 'join_approved':
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
      case 'join_rejected':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'message':
      case 'course_update':
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'attendance_reminder':
        return <AlertTriangle className="h-4 w-4 text-chart-5" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive bg-destructive/5';
      case 'medium':
        return 'border-l-chart-5 bg-chart-5/5';
      case 'low':
        return 'border-l-primary bg-primary/5';
      default:
        return 'border-l-muted-foreground bg-muted/50';
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'read', label: 'Read', count: notifications.length - unreadCount },
    {
      value: 'attendance',
      label: 'Attendance',
      count: notifications.filter((n) => n.type === 'attendance').length,
    },
    {
      value: 'join_approved',
      label: 'Approved',
      count: notifications.filter((n) => n.type === 'join_approved').length,
    },
    {
      value: 'message',
      label: 'Messages',
      count: notifications.filter(
        (n) => n.type === 'message' || n.type === 'course_update',
      ).length,
    },
  ];

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent, notificationId: number) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setSwipeState({
      id: notificationId,
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: false,
      direction: null,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || swipeState.id === null) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Only start dragging if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
      e.preventDefault(); // Prevent scrolling

      setSwipeState((prev) => ({
        ...prev,
        currentX: touch.clientX,
        isDragging: true,
        direction: deltaX > 0 ? 'right' : 'left',
      }));
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !swipeState.isDragging) {
      setSwipeState({
        id: null,
        startX: 0,
        currentX: 0,
        isDragging: false,
        direction: null,
      });
      touchStartRef.current = null;
      return;
    }

    const deltaX = swipeState.currentX - swipeState.startX;
    const threshold = 80; // Minimum swipe distance

    if (Math.abs(deltaX) > threshold && swipeState.id !== null) {
      if (deltaX > 0) {
        // Swipe right - mark as read/unread
        toggleReadStatus(swipeState.id);
      } else {
        // Swipe left - delete notification
        deleteNotification(swipeState.id);
      }
    }

    setSwipeState({
      id: null,
      startX: 0,
      currentX: 0,
      isDragging: false,
      direction: null,
    });
    touchStartRef.current = null;
  };

  const toggleReadStatus = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: !notification.isRead }
          : notification,
      ),
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const getSwipeTransform = (notificationId: number) => {
    if (swipeState.id !== notificationId || !swipeState.isDragging) {
      return 'translateX(0)';
    }

    const deltaX = Math.max(
      -120,
      Math.min(120, swipeState.currentX - swipeState.startX),
    );
    return `translateX(${deltaX}px)`;
  };

  const getSwipeOpacity = (notificationId: number) => {
    if (swipeState.id !== notificationId || !swipeState.isDragging) {
      return 1;
    }

    const deltaX = Math.abs(swipeState.currentX - swipeState.startX);
    return Math.max(0.7, 1 - deltaX / 200);
  };

  return (
    <MobilePageContainer
      // showHeader={true}
      headerTitle="Notifications"
      headerActions={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="touch-target-min mobile-tap-feedback"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col">
        {/* Mobile Filter Pills */}
        {showFilters && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter(option.value);
                    setShowFilters(false);
                  }}
                  className={cn(
                    'h-8 px-3 text-xs touch-target-min mobile-tap-feedback',
                    filter === option.value &&
                      'bg-primary text-primary-foreground',
                  )}
                >
                  {option.label}
                  {option.count > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'ml-1 text-xs h-4 px-1',
                        filter === option.value
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {option.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {unreadCount > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="touch-target-min mobile-tap-feedback"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All as Read
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No notifications found
              </h3>
              <p className="text-muted-foreground text-sm">
                {filter === 'all'
                  ? "You're all caught up!"
                  : `No ${filter} notifications to show`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="relative overflow-hidden"
                onTouchStart={(e) => handleTouchStart(e, notification.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Swipe Action Background */}
                {swipeState.id === notification.id && swipeState.isDragging && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 z-0">
                    {swipeState.direction === 'right' && (
                      <div className="flex items-center gap-2 text-chart-2">
                        {notification.isRead ? (
                          <Mail className="h-5 w-5" />
                        ) : (
                          <MailOpen className="h-5 w-5" />
                        )}
                        <span className="text-sm font-medium">
                          {notification.isRead ? 'Mark Unread' : 'Mark Read'}
                        </span>
                      </div>
                    )}
                    {swipeState.direction === 'left' && (
                      <div className="ml-auto flex items-center gap-2 text-destructive">
                        <span className="text-sm font-medium">Delete</span>
                        <Trash2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                )}

                {/* Notification Card */}
                <Card
                  className={cn(
                    'relative z-10 transition-all duration-200',
                    'mobile-touch-feedback touch-target-min',
                    !notification.isRead && [
                      'border-l-4',
                      getPriorityColor(notification.priority),
                    ],
                    notification.isRead && 'opacity-75',
                  )}
                  style={{
                    transform: getSwipeTransform(notification.id),
                    opacity: getSwipeOpacity(notification.id),
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={cn(
                            'p-2 rounded-full',
                            notification.type === 'attendance' &&
                              'bg-chart-2/10',
                            notification.type === 'join_approved' &&
                              'bg-chart-2/10',
                            notification.type === 'join_rejected' &&
                              'bg-destructive/10',
                            (notification.type === 'message' ||
                              notification.type === 'course_update') &&
                              'bg-primary/10',
                            notification.type === 'attendance_reminder' &&
                              'bg-chart-5/10',
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-base leading-tight text-foreground">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {notification.course && (
                              <Badge variant="outline" className="text-xs">
                                {notification.course}
                              </Badge>
                            )}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground/80">
                            {notification.timestamp}
                          </p>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReadStatus(notification.id);
                              }}
                              className="h-8 w-8 p-0 touch-target-min mobile-tap-feedback"
                            >
                              {notification.isRead ? (
                                <Mail className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-8 w-8 p-0 touch-target-min mobile-tap-feedback text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Swipe Instructions */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Swipe right to mark as read/unread • Swipe left to delete
            </p>
          </div>
        )}
      </div>
    </MobilePageContainer>
  );
};

export default MobileStudentNotifications;
