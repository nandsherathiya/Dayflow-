import { 
  Home, 
  User, 
  CalendarCheck, 
  CalendarDays, 
  DollarSign, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/lib/auth-context';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const employeeNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'My Profile', url: '/profile', icon: User },
  { title: 'Attendance', url: '/attendance', icon: CalendarCheck },
  { title: 'Leave Requests', url: '/leaves', icon: CalendarDays },
  { title: 'Payroll', url: '/payroll', icon: DollarSign },
];

const adminNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Employees', url: '/employees', icon: Users },
  { title: 'Attendance', url: '/attendance', icon: CalendarCheck },
  { title: 'Leave Management', url: '/leaves', icon: CalendarDays },
  { title: 'Payroll', url: '/payroll', icon: DollarSign },
  { title: 'Reports', url: '/reports', icon: FileText },
];

export function AppSidebar() {
  const { user, role, isHrOrAdmin, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navItems = isHrOrAdmin ? adminNavItems : employeeNavItems;
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            D
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">Dayflow</span>
              <span className="text-xs text-sidebar-foreground/60">HRMS</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-2">
            {isHrOrAdmin ? 'Management' : 'Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/dashboard'}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 px-2 py-2 h-auto hover:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                      {user?.email}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 capitalize">
                      {role || 'Employee'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Profile
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
