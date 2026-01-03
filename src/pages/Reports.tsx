import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';
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
  ResponsiveContainer 
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';

export default function ReportsPage() {
  const { isHrOrAdmin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    if (isHrOrAdmin) {
      fetchReportData();
    }
  }, [isHrOrAdmin]);

  const fetchReportData = async () => {
    const today = new Date();
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

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
        .from('attendance')
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
