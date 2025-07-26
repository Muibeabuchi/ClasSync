import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Home, BookOpen, CheckCircle, Inbox, User } from 'lucide-react';

export interface BottomNavItem {
  id: 'home' | 'courses' | 'checkin' | 'inbox' | 'profile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isActive: boolean;
}

export interface MobileBottomNavigationProps {
  activeTab: 'home' | 'courses' | 'checkin' | 'inbox' | 'profile';
  onTabChange: (
    tab: 'home' | 'courses' | 'checkin' | 'inbox' | 'profile',
  ) => void;
  notificationCount?: number;
  className?: string;
}

const navigationItems: Omit<BottomNavItem, 'isActive' | 'badge'>[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: BookOpen,
  },
  {
    id: 'checkin',
    label: 'Check In',
    icon: CheckCircle,
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
  },
];

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  activeTab,
  onTabChange,
  notificationCount,
  className,
}) => {
  const items: BottomNavItem[] = navigationItems.map((item) => ({
    ...item,
    isActive: item.id === activeTab,
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
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              // Base styles
              'relative flex flex-col items-center justify-center',
              'min-h-[48px] min-w-[48px] px-3 py-2',
              'rounded-lg transition-all duration-200',
              'touch-manipulation',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              // Active state
              item.isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              // Touch feedback
              'active:scale-95 active:bg-accent/70',
            )}
            aria-current={item.isActive ? 'page' : undefined}
            aria-label={`${item.label}${item.badge ? ` (${item.badge} notifications)` : ''}`}
          >
            <div className="relative">
              <item.icon
                className={cn(
                  'h-5 w-5 mb-1 transition-colors duration-200',
                  item.isActive ? 'text-primary' : 'text-current',
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
                item.isActive ? 'text-primary' : 'text-current',
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
