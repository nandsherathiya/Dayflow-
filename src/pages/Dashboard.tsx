import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { 
  CalendarCheck, 
  CalendarDays, 
  DollarSign, 
  User, 
  Users, 
  Clock,
  FileText,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'leave';
}

export default function Dashboard() {
  const { user, role, isHrOrAdmin } = useAuth();
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    presentToday: 0,
    monthlyPayroll: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, isHrOrAdmin]);

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user?.id)
      .eq('date', today)
      .single();

    if (attendance) {
      setTodayAttendance(attendance as AttendanceRecord);
    }

    // Fetch recent leave requests
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (leaves) {
      setRecentLeaves(leaves as LeaveRequest[]);
    }

    if (isHrOrAdmin) {
      // Fetch stats for HR/Admin
      const { count: employeeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: presentCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present');

      setStats({
        totalEmployees: employeeCount || 0,
        pendingLeaves: pendingCount || 0,
        presentToday: presentCount || 0,
        monthlyPayroll: 0,
      });
    }
  };

  const handleCheckIn = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('attendance')
      .upsert({
        user_id: user?.id,
        date: today,
        check_in: now,
        status: 'present',
      });

    if (!error) {
      fetchDashboardData();
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    const { error } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', todayAttendance.id);

    if (!error) {
      fetchDashboardData();
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout 
      title={`${greeting()}!`} 
      description={`Welcome back. Here's what's happening today.`}
    >
      <div className="space-y-8 animate-fade-in">
        {/* Quick Stats */}
        {isHrOrAdmin ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={<Users className="h-6 w-6" />}
              variant="primary"
            />
            <StatCard
              title="Present Today"
              value={stats.presentToday}
              icon={<CalendarCheck className="h-6 w-6" />}
              variant="success"
            />
            <StatCard
              title="Pending Leaves"
              value={stats.pendingLeaves}
              icon={<CalendarDays className="h-6 w-6" />}
              variant="warning"
            />
            <StatCard
              title="Monthly Payroll"
              value="$0"
              description="Configure payroll"
              icon={<DollarSign className="h-6 w-6" />}
              variant="info"
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Attendance Card */}
            <Card className="shadow-card border col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {todayAttendance ? (
                      <StatusBadge status={todayAttendance.status} />
                    ) : (
                      <span className="text-sm text-muted-foreground">Not checked in</span>
                    )}
                  </div>
                  {todayAttendance?.check_in && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check In</span>
                      <span className="text-sm font-medium">
                        {format(new Date(todayAttendance.check_in), 'hh:mm a')}
                      </span>
                    </div>
                  )}
                  {todayAttendance?.check_out && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check Out</span>
                      <span className="text-sm font-medium">
                        {format(new Date(todayAttendance.check_out), 'hh:mm a')}
                      </span>
                    </div>
                  )}
                  <div className="pt-2">
                    {!todayAttendance ? (
                      <button
                        onClick={handleCheckIn}
                        className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                      >
                        Check In
                      </button>
                    ) : !todayAttendance.check_out ? (
                      <button
                        onClick={handleCheckOut}
                        className="w-full py-2.5 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
                      >
                        Check Out
                      </button>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">
                        You've completed your work day ✓
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <StatCard
              title="Leave Balance"
              value="12 days"
              description="Paid leave remaining"
              icon={<CalendarDays className="h-6 w-6" />}
              variant="success"
            />
            <StatCard
              title="This Month"
              value="22 days"
              description="Working days attended"
              icon={<TrendingUp className="h-6 w-6" />}
              variant="info"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="My Profile"
              description="View and update your details"
              icon={<User className="h-6 w-6" />}
              href="/profile"
            />
            <QuickActionCard
              title="Attendance"
              description="View attendance history"
              icon={<CalendarCheck className="h-6 w-6" />}
              href="/attendance"
              variant="success"
            />
            <QuickActionCard
              title="Leave Requests"
              description="Apply for time off"
              icon={<CalendarDays className="h-6 w-6" />}
              href="/leaves"
              variant="warning"
            />
            <QuickActionCard
              title="Payroll"
              description="View salary slips"
              icon={<DollarSign className="h-6 w-6" />}
              href="/payroll"
              variant="primary"
            />
          </div>
        </div>

        {/* Recent Leave Requests */}
        {recentLeaves.length > 0 && (
          <Card className="shadow-card border">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLeaves.map((leave) => (
                  <div 
                    key={leave.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm capitalize">{leave.leave_type} Leave</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
