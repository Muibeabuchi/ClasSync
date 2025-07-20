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
import { BookOpen, Bell, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { navigationItems } from '@/constants/navigation-constants';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';
// import { ThemeToggle } from '@/components/theme-toggle';

interface LecturerSidebarProps {
  userData: any;
  handleSidebarState: (value: boolean) => void;
}

const LecturerSidebar = ({
  userData,
  // handleSidebarState,
}: LecturerSidebarProps) => {
  const { state } = useSidebar();

  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-1 py-0.5">
          <div
            className={cn('bg-primary p-3 rounded-md shadow-lg', {
              'p-1 rounded-sm': state === 'collapsed',
            })}
          >
            <BookOpen
              className={cn('size-5', {
                'size-4': state === 'collapsed',
              })}
            />
          </div>
          {state === 'expanded' && (
            <div className="flex flex-col flex-1">
              <h2 className="text-base font-medium tracking-tight">Classynk</h2>
              <p className="text-xs font-normal opacity-70">Lecturer Portal</p>
            </div>
          )}
          {/* <ThemeToggle /> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-1 py-2 opacity-70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <Link
                      to={`/dashboard/$role/${item.to}`}
                      activeOptions={{ exact: true }}
                    >
                      {({ isActive }) => {
                        return (
                          <SidebarMenuButton
                            isActive={isActive}
                            // onClick={() => {
                            //   // handleSidebarState(false);
                            // }}
                            tooltip={
                              state === 'collapsed' ? item.label : undefined
                            }
                            className={`
                        h-10 px-3 rounded-sm transition-all duration-200 font-medium text-sm 
                        ${
                          isActive
                            ? 'bg-primary/20 text-primary '
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

      <SidebarFooter className="border-t ">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12  rounded-lg hover:bg-accent transition-colors duration-200 data-[state=open]:bg-accent"
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
                  // onClick={() => onPageChange('profile')}
                  className="cursor-pointer"
                >
                  <Link to="/">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
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
