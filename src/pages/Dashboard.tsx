import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  CalendarCheck, 
  CalendarDays, 
  DollarSign, 
  User, 
  Users, 
  Clock,
  FileText,
  TrendingUp,
  ArrowRight,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  user_id?: string;
}

interfacependingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [employeeLeaveBalance, setEmployeeLeaveBalance] = useState({
    totalLeaves: 20,
    usedLeaves: 0,
    remainingLeaves: 20,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    presentDays: 0,
    absentDays: 0,
    halfDays: 0,
    leaveDays: 0,
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

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

    // Fetch recent leave requests (personal)
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (leaves) {
      setRecentLeaves(leaves as LeaveRequest[]);
    }

    // Fetch monthly attendance stats for employee
    if (!isHrOrAdmin) {
      const { data: monthAttendance } = await supabase
        .from('attendance')
        .select('status')
        .eq('user_id', user?.id)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (monthAttendance) {
        const stats = {
          presentDays: monthAttendance.filter(a => a.status === 'present').length,
          absentDays: monthAttendance.filter(a => a.status === 'absent').length,
          halfDays: monthAttendance.filter(a => a.status === 'half_day').length,
          leaveDays: monthAttendance.filter(a => a.status === 'leave').length,
        };
        setMonthlyStats(stats);

        // Calculate leave balance
        const totalUsed = stats.leaveDays;
        setEmployeeLeaveBalance({
          totalLeaves: 20,
          usedLeaves: totalUsed,
          remainingLeaves: 20 - totalUsed,
        });
      }
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

      const { count: absentCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'absent');

      // Fetch pending leaves for admin
      const { data: adminPendingLeaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (adminPendingLeaves) {
        setPendingLeaves(adminPendingLeaves as LeaveRequest[]);
      }

      setStats({
        totalEmployees: employeeCount || 0,
        pendingLeaves: pendingCount || 0,
        presentToday: presentCount || 0,
        absentToday: ab?.id)
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
  };Absent Today"
              value={stats.absentToday}
              icon={<AlertCircle className="h-6 w-6" />}
              variant="error"
            />
            <StatCard
              title="Pending Leaves"
              value={stats.pendingLeaves}
              icon={<CalendarDays className="h-6 w-6" />}
              variant="warning
        check_in: now,
        status: 'present',
      });

    if (!error) {4">
            {/* Attendance Card */}
            <Card className="shadow-card border md:col-span-2">
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
                  <div className="pt-2 flex gap-2">
                    {!todayAttendance ? (
                      <Button
                        onClick={handleCheckIn}
                        className="flex-1"
                      >
                        Check In
                      </Button>
                    ) : !todayAttendance.check_out ? (
                      <Button
                        onClick={handleCheckOut}
                        variant="outline"
                        className="flex-1"
                      >
                        Check Out
                      </Button>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground w-full">
                        You've completed your work day ✓
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <StatCard
              title="Leave Balance"
              value={`${employeeLeaveBalance.remainingLeaves} days`}
              description={`${employeeLeaveBalance.usedLeaves} used of ${employeeLeaveBalance.totalLeaves}`}
              icon={<CalendarDays className="h-6 w-6" />}
              variant="success"
            />
            <StatCard
              title="This Month"
              value={`${monthlyStats.presentDays} days`}
              description={`${monthlyStats.absentDays} absent, ${monthlyStats.halfDays} half days`}
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
         isHrOrAdmin ? (
          // HR/Admin View - Pending Leaves
          pendingLeaves.length > 0 && (
            <Card className="shadow-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Pending Leave Approvals
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingLeaves.map((leave) => (
                    <div 
                      key={leave.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5"
                    >
                      <div>
                        <p className="font-medium text-sm capitalize">{leave.leave_type} Leave Request</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Approve</Button>
                        <Button variant="destructive" size="sm">Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          // Employee View - Recent Leaves
          recentLeaves.length > 0 && (
            <Card className="shadow-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Leave Requests
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
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
          )
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
