import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Home, BookOpen, ClipboardList, Users, User } from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';

export interface LecturerBottomNavItem {
  id: 'dashboard' | 'courses' | 'classlists' | 'joinRequests' | 'profile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  to: string;
}

export interface MobileLecturerBottomNavigationProps {
  notificationCount?: number;
  className?: string;
}

const navigationItems: Omit<LecturerBottomNavItem, 'badge'>[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: Home,
    to: '/dashboard/lecturer',
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: BookOpen,
    to: '/dashboard/lecturer/courses',
  },
  {
    id: 'classlists',
    label: 'Lists',
    icon: ClipboardList,
    to: '/dashboard/lecturer/classLists',
  },
  {
    id: 'joinRequests',
    label: 'Requests',
    icon: Users,
    to: '/dashboard/lecturer/joinRequests',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    to: '/dashboard/lecturer/profile',
  },
];

export const MobileLecturerBottomNavigation: React.FC<
  MobileLecturerBottomNavigationProps
> = ({ notificationCount, className }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const items: LecturerBottomNavItem[] = navigationItems.map((item) => ({
    ...item,
    badge:
      item.id === 'joinRequests' && notificationCount && notificationCount > 0
        ? notificationCount
        : undefined,
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
      <div className="flex items-center justify-around px-1 py-2">
        {items.map((item) => {
          const isActive =
            currentPath === item.to ||
            (item.to === '/dashboard/lecturer' &&
              currentPath === '/dashboard/lecturer/');

          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                // Base styles
                'relative flex flex-col items-center justify-center',
                'min-h-[52px] min-w-[52px] px-2 py-1.5',
                'rounded-xl transition-all duration-200 ease-out',
                'touch-manipulation select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                // Active state with enhanced styling
                isActive
                  ? 'text-primary bg-primary/15 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                // Enhanced touch feedback
                'active:scale-95 active:bg-accent/80 active:duration-75',
                // Ensure proper spacing on smaller screens
                'flex-1 max-w-[80px]',
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label}${item.badge ? ` (${item.badge} notifications)` : ''}`}
            >
              <div className="relative flex items-center justify-center">
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-0.5 transition-all duration-200',
                    isActive ? 'text-primary scale-110' : 'text-current',
                  )}
                />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      'absolute -top-1.5 -right-1.5',
                      'min-w-[16px] h-[16px] px-1',
                      'text-[9px] font-bold',
                      'flex items-center justify-center',
                      'border-2 border-background',
                      'shadow-sm',
                      // Subtle pulse animation
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
                  'text-[10px] font-medium leading-tight text-center',
                  'transition-all duration-200',
                  'max-w-full truncate',
                  isActive ? 'text-primary font-semibold' : 'text-current',
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

export default MobileLecturerBottomNavigation;
