import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, CalendarDays, TrendingUp, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  notes: string | null;
}

export default function AttendancePage() {
  const { user, isHrOrAdmin } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user, isHrOrAdmin]);

  const fetchAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    if (isHrOrAdmin) {
      // Fetch all attendance for admin
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false });

      if (data) {
        setAttendance(data as AttendanceRecord[]);
        calculateStats(data as AttendanceRecord[]);
      }
    } else {
      // Fetch personal attendance
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false });

      if (data) {
        setAttendance(data as AttendanceRecord[]);
        calculateStats(data as AttendanceRecord[]);
        const todayRec = data.find((r: AttendanceRecord) => r.date === today);
        setTodayRecord(todayRec || null);
      }
    }
    setIsLoading(false);
  };

  const calculateStats = (records: AttendanceRecord[]) => {
    const stats = records.reduce(
      (acc, record) => {
        acc[record.status === 'half_day' ? 'halfDay' : record.status]++;
        return acc;
      },
      { present: 0, absent: 0, halfDay: 0, leave: 0 }
    );
    setStats(stats);
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

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Checked In',
        description: 'Your attendance has been recorded',
      });
      fetchAttendance();
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;

    const { error } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', todayRecord.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Checked Out',
        description: 'Have a great day!',
      });
      fetchAttendance();
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'hh:mm a');
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Attendance" description="Track and manage attendance records">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Attendance" 
      description={isHrOrAdmin ? "View and manage all employee attendance" : "Track your attendance records"}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card border bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.present}</p>
                  <p className="text-xs text-muted-foreground">Present Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Clock className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <CalendarDays className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.halfDay}</p>
                  <p className="text-xs text-muted-foreground">Half Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <Users className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.leave}</p>
                  <p className="text-xs text-muted-foreground">Leave Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check In/Out Card for Employees */}
        {!isHrOrAdmin && (
          <Card className="shadow-card border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today's Attendance - {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                {todayRecord ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <StatusBadge status={todayRecord.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Check In:</span>
                      <span className="font-medium">{formatTime(todayRecord.check_in)}</span>
                    </div>
                    {todayRecord.check_out ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Check Out:</span>
                        <span className="font-medium">{formatTime(todayRecord.check_out)}</span>
                      </div>
                    ) : (
                      <Button onClick={handleCheckOut} variant="outline" size="sm">
                        Check Out
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">You haven't checked in yet.</span>
                    <Button onClick={handleCheckIn} size="sm">
                      Check In Now
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Table */}
        <Card className="shadow-card border">
          <CardHeader>
            <CardTitle className="text-lg">
              {isHrOrAdmin ? 'All Attendance Records' : 'My Attendance History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isHrOrAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isHrOrAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((record) => (
                    <TableRow key={record.id}>
                      {isHrOrAdmin && (
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {record.profiles?.first_name} {record.profiles?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{record.profiles?.employee_id}</p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{formatTime(record.check_in)}</TableCell>
                      <TableCell>{formatTime(record.check_out)}</TableCell>
                      <TableCell>
                        <StatusBadge status={record.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
