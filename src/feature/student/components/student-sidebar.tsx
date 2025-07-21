// import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  BookOpen,
  //  Plus,
  Clock,
  Bell,
  LogOut,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';
// import { ThemeToggle } from '@/components/theme-toggle';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    badge: null,
  },
  {
    id: 'courses',
    label: 'My Courses',
    icon: BookOpen,
    badge: '3',
  },
  {
    id: 'attendance',
    label: 'Check In',
    icon: Clock,
    badge: null,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    badge: '3',
  },
];

interface StudentSidebarProps {
  activePage: string;
  onPageChange: (page: any) => void;
  userData: any;
}

const StudentSidebar = ({
  activePage,
  onPageChange,
  userData,
}: StudentSidebarProps) => {
  const { state } = useSidebar();

  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-chart-2 p-1 rounded-sm">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          {state === 'expanded' && (
            <div className="flex flex-col flex-1">
              <h2 className="text-sm font-semibold">ClassSync</h2>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          )}
          {/* <ThemeToggle /> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onPageChange(item.id)}
                      tooltip={state === 'collapsed' ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && state === 'expanded' && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userData?.profileImage} />
                    <AvatarFallback className="rounded-lg">
                      {userData?.fullName
                        ?.split(' ')
                        // @ts-expect-error: temporary data
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {state === 'expanded' && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userData?.fullName}
                      </span>
                      <span className="truncate text-xs">
                        {userData?.regNumber}
                      </span>
                      <span className="truncate text-xs">
                        {userData?.yearLevel} Year • {userData?.department}
                      </span>
                    </div>
                  )}
                  <Bell className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => onPageChange('profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPageChange('settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default StudentSidebar;
