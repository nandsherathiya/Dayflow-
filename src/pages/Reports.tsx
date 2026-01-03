import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BarChart3, PieChart, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';

export default function ReportsPage() {
  const { isHrOrAdmin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAttendanceRecords: 0,
    totalLeaveRequests: 0,
    avgAttendanceRate: 0,
  });

  useEffect(() => {
    if (isHrOrAdmin) {
      fetchReportData();
    }
  }, [isHrOrAdmin]);

  const fetchReportData = async () => {
    const today = new Date();
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

    // Fetch overall stats
    const { count: employeeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true });

    const { count: leaveCount } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true });

    // Calculate average attendance rate
    const { data: currentMonthAttendance } = await supabase
      .from('attendance')
      .select('status')
      .gte('date', monthStart)
      .lte('date', monthEnd);

    let avgRate = 0;
    if (currentMonthAttendance && currentMonthAttendance.length > 0) {
      const presentCount = currentMonthAttendance.filter(a => a.status === 'present').length;
      avgRate = Math.round((presentCount / currentMonthAttendance.length) * 100);
    }

    setStats({
      totalEmployees: employeeCount || 0,
      totalAttendanceRecords: attendanceCount || 0,
      totalLeaveRequests: leaveCount || 0,
      avgAttendanceRate: avgRate,
    });

    // Fetch attendance summary
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .gte('date', monthStart)
      .lte('date', monthEnd);

    if (attendance) {
      const summary = attendance.reduce((acc: any, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {});

      setAttendanceData([
        { name: 'Present', value: summary.present || 0, color: 'hsl(142, 71%, 40%)' },
        { name: 'Absent', value: summary.absent || 0, color: 'hsl(0, 72%, 51%)' },
        { name: 'Half Day', value: summary.half_day || 0, color: 'hsl(38, 92%, 50%)' },
        { name: 'Leave', value: summary.leave || 0, color: 'hsl(210, 92%, 45%)' },
      ]);
    }

    // Fetch leave summary
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('status')
      .gte('created_at', monthStart);

    if (leaves) {
      const summary = leaves.reduce((acc: any, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {});

      setLeaveData([
        { name: 'Pending', value: summary.pending || 0, color: 'hsl(38, 92%, 50%)' },
        { name: 'Approved', value: summary.approved || 0, color: 'hsl(142, 71%, 40%)' },
        { name: 'Rejected', value: summary.rejected || 0, color: 'hsl(0, 72%, 51%)' },
      ]);
    }

    // Generate monthly trend (last 6 months)
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(today, i);
      const monthName = format(month, 'MMM');
      
      const { count: presentCount } = await supabase
  if (!isHrOrAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Reports" description="Analytics and insights">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      description="Comprehensive insights and data visualization"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Key Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card border bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                  <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold">{stats.avgAttendanceRate}%</p>
                </div>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Records</p>
                  <p className="text-2xl font-bold">{stats.totalAttendanceRecords}</p>
                </div>
                <Calendar className="h-5 w-5 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Leave Requests</p>
                  <p className="text-2xl font-bold">{stats.totalLeaveRequests}</p>
                </div>
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .gte('date', format(startOfMonth(month), 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth(month), 'yyyy-MM-dd'))
        .eq('status', 'present');

      const { count: leaveCount } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', format(startOfMonth(month), 'yyyy-MM-dd'))
        .lte('start_date', format(endOfMonth(month), 'yyyy-MM-dd'))
        .eq('status', 'approved');

      trend.push({
        month: monthName,
        attendance: presentCount || 0,
        leaves: leaveCount || 0,
      });
    }
    setMonthlyTrend(trend);
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Reports" description="Analytics and insights">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isHrOrAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Reports" description="Analytics and insights">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports & Analytics" description="View attendance and leave insights">
      <div className="space-y-6 animate-fade-in">
        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Distribution */}
          <Card className="shadow-card border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Attendance Distribution
              </CardTitle>
              <CardDescription>Current month attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No attendance data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Leave Requests Distribution */}
          <Card className="shadow-card border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Leave Requests Status
              </CardTitle>
              <CardDescription>Current month leave request status</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No leave data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={leaveData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card className="shadow-card border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Trend
            </CardTitle>
            <CardDescription>Attendance and leave trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(174, 62%, 38%)" name="Present Days" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leaves" fill="hsl(38, 92%, 50%)" name="Approved Leaves" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
