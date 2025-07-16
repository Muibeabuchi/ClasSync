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
  Users,
  Bell,
  Plus,
  LogOut,
  User,
  CreditCard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
// import { ThemeToggle } from '@/components/theme-toggle';

interface LecturerSidebarProps {
  activePage: string;
  onPageChange: (page: any) => void;
  userData: any;
}

const LecturerSidebar = ({
  activePage,
  onPageChange,
  userData,
}: LecturerSidebarProps) => {
  const { state } = useSidebar();

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
      id: 'create-course',
      label: 'Create Course',
      icon: Plus,
      badge: null,
    },
    {
      id: 'join-requests',
      label: 'Join Requests',
      icon: Users,
      badge: '8',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: '5',
    },
    {
      id: 'classlists',
      label: 'ClassLists',
      icon: Users,
      badge: null,
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      badge: null,
    },
  ];

  const handleSignOut = () => {
    console.log('Signing out...');
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="bg-primary p-2 rounded-lg shadow-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          {state === 'expanded' && (
            <div className="flex flex-col flex-1">
              <h2 className="text-base font-medium tracking-tight">
                ClassSync
              </h2>
              <p className="text-sm font-normal opacity-70">Lecturer Portal</p>
            </div>
          )}
          {/* <ThemeToggle /> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-3 py-2 opacity-70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onPageChange(item.id)}
                      tooltip={state === 'collapsed' ? item.label : undefined}
                      className={`
                        h-10 px-3 rounded-lg transition-all duration-200 font-medium text-sm 
                        ${
                          isActive
                            ? 'bg-primary/20 text-primary border-l-2 border-primary'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-normal">{item.label}</span>
                      {item.badge && state === 'expanded' && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs px-2 py-0.5"
                        >
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

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 px-3 rounded-lg hover:bg-accent transition-colors duration-200 data-[state=open]:bg-accent"
                >
                  <Avatar className="h-8 w-8 rounded-lg border">
                    <AvatarImage src={userData?.profileImage} />
                    <AvatarFallback className="rounded-lg text-sm font-medium">
                      {userData?.fullName
                        ?.split(' ')
                        // @ts-expect-error : temporary data
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {state === 'expanded' && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {userData?.title} {userData?.fullName}
                      </span>
                      <span className="truncate text-xs opacity-70">
                        {userData?.department}
                      </span>
                    </div>
                  )}
                  <Bell className="ml-auto size-4 opacity-70" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg shadow-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => onPageChange('profile')}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive hover:bg-destructive/20 hover:text-destructive cursor-pointer"
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

export default LecturerSidebar;
