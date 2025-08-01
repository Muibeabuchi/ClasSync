import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
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
// import { SidebarToggle } from '@/components/ui/sidebar-toggle';
import {
  Home,
  BookOpen,
  Clock,
  Bell,
  LogOut,
  User,
  Settings,
  UserPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';
import { Link } from '@tanstack/react-router';
import { ThemeDropdownToggle } from '@/components/theme-dropdown-toggle';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    badge: null,
    to: '/dashboard/student',
  },
  {
    id: 'courses',
    label: 'My Courses',
    icon: BookOpen,
    to: '/dashboard/student/courses',
  },
  {
    id: 'attendance',
    label: 'Check In',
    icon: Clock,
    badge: null,
    to: '/dashboard/student/attendance',
  },
  {
    id: 'join-requests',
    label: 'Join Requests',
    icon: UserPlus,
    badge: null,
    to: '/dashboard/student/join-requests',
  },
];

interface StudentSidebarProps {
  userData: any;
}

const StudentSidebar = ({ userData }: StudentSidebarProps) => {
  const { state, isMobile, setOpenMobile } = useSidebar();

  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut();
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-2">
          <div className=" p-1 rounded-sm bg-primary ">
            <BookOpen className="h-4 w-4 text-background" />
          </div>
          {state === 'expanded' && (
            <div className="flex flex-col flex-1">
              <h2 className="text-sm font-semibold">ClassSync</h2>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          )}
          {/* <SidebarToggle /> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.id}>
                    <Link to={item.to} activeOptions={{ exact: true }}>
                      {({ isActive }) => {
                        return (
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={handleLinkClick}
                            tooltip={
                              state === 'collapsed' ? item.label : undefined
                            }
                            className={`
                              transition-all duration-200 
                              ${
                                isActive
                                  ? 'bg-primary/20 text-primary'
                                  : 'hover:bg-accent hover:text-accent-foreground'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            {/* {item.badge && state === 'expanded' && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )} */}
                          </SidebarMenuButton>
                        );
                      }}
                    </Link>
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
                  <Avatar className="size-5 rounded-md">
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
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/student/notifications"
                    onClick={handleLinkClick}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/student/profile"
                    onClick={handleLinkClick}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/student/settings"
                    onClick={handleLinkClick}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <ThemeDropdownToggle />
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
