import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Home, BookOpen, CheckCircle, Inbox, User } from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';

export interface BottomNavItem {
  id: 'home' | 'courses' | 'checkin' | 'inbox' | 'profile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  to: string;
}

export interface MobileBottomNavigationProps {
  notificationCount?: number;
  className?: string;
}

const navigationItems: Omit<BottomNavItem, 'badge'>[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    to: '/dashboard/student',
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: BookOpen,
    to: '/dashboard/student/courses',
  },
  {
    id: 'checkin',
    label: 'Check In',
    icon: CheckCircle,
    to: '/dashboard/student/attendance',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
    to: '/dashboard/student/notifications',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    to: '/dashboard/student/profile',
  },
];

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  notificationCount,
  className,
}) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const items: BottomNavItem[] = navigationItems.map((item) => ({
    ...item,
    badge:
      item.id === 'inbox' && notificationCount ? notificationCount : undefined,
  }));

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background/95 backdrop-blur-sm',
        'border-t border-border',
        'safe-area-bottom', // For devices with home indicator
        // Ensure consistent height
        'mobile-bottom-nav-height',
        className,
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive =
            currentPath === item.to ||
            (item.to === '/dashboard/student' &&
              currentPath === '/dashboard/student/');

          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                // Base styles
                'relative flex flex-col items-center justify-center',
                'min-h-[48px] min-w-[48px] px-3 py-2',
                'rounded-lg transition-all duration-200',
                'touch-manipulation',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                // Active state
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                // Touch feedback
                'active:scale-95 active:bg-accent/70',
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label}${item.badge ? ` (${item.badge} notifications)` : ''}`}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-1 transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-current',
                  )}
                />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      'absolute -top-2 -right-2',
                      'min-w-[18px] h-[18px] px-1',
                      'text-[10px] font-semibold',
                      'flex items-center justify-center',
                      'animate-pulse',
                    )}
                  >
                    {typeof item.badge === 'number' && item.badge > 99
                      ? '99+'
                      : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium leading-none',
                  'transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-current',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
