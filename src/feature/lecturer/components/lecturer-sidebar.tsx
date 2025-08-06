// import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  // SidebarTrigger,
} from '@/components/ui/sidebar';
// import { SidebarToggle } from '@/components/ui/sidebar-toggle';
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
import { ThemeDropdownToggle } from '@/components/theme-dropdown-toggle';

interface LecturerSidebarProps {
  fullName?: string;
  profileImage?: string;
}

const LecturerSidebar = ({ fullName, profileImage }: LecturerSidebarProps) => {
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-1 py-0.5">
          <div
            className={cn('bg-primary p-1 rounded-md shadow-lg', {
              'p-1 rounded-sm': state === 'collapsed',
            })}
          >
            <BookOpen
              className={cn('size-4 text-background', {
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
          {/* <SidebarTrigger /> */}
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
                      to={`/dashboard/lecturer/${item.to}`}
                      activeOptions={{ exact: true }}
                    >
                      {({ isActive }) => {
                        return (
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={handleLinkClick}
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
                  <Avatar className="size-5 rounded-md border">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="rounded-lg text-sm font-medium">
                      {fullName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {state === 'expanded' && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{fullName}</span>
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
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <ThemeDropdownToggle />
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
