import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, CalendarDays, Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: 'paid' | 'sick' | 'unpaid' | 'casual';
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  review_comment: string | null;
  created_at: string;
}

export default function LeavesPage() {
  const { user, isHrOrAdmin } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState<'paid' | 'sick' | 'unpaid' | 'casual'>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user, isHrOrAdmin]);

  const fetchLeaves = async () => {
    if (isHrOrAdmin) {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setLeaves(data as LeaveRequest[]);
      }
    } else {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        setLeaves(data as LeaveRequest[]);
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: user?.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit leave request',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
      setIsDialogOpen(false);
      resetForm();
      fetchLeaves();
    }
    setIsSubmitting(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('leave_requests')
      .update({ 
        status: 'approved',
        reviewed_by: user?.id,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve leave request',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Approved',
        description: 'Leave request has been approved',
      });
      fetchLeaves();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('leave_requests')
      .update({ 
        status: 'rejected',
        reviewed_by: user?.id,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject leave request',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Rejected',
        description: 'Leave request has been rejected',
      });
      fetchLeaves();
    }
  };

  const resetForm = () => {
    setLeaveType('paid');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  if (isLoading) {
    return (
      <DashboardLayout title="Leave Requests" description="Manage time-off requests">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Leave Requests" 
      description={isHrOrAdmin ? "Review and manage all leave requests" : "Apply for and track your leave requests"}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card border bg-info/5 border-info/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                  <CalendarDays className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{leaves.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-warning/5 border-warning/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{leaves.filter(l => l.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-success/5 border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{leaves.filter(l => l.status === 'approved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-destructive/5 border-destructive/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{leaves.filter(l => l.status === 'rejected').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isHrOrAdmin && leaves.filter(l => l.status === 'pending').length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
                <CalendarDays className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-warning">
                  {leaves.filter(l => l.status === 'pending').length} pending request(s)
                </span>
              </div>
            )}
          </div>
          {!isHrOrAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="leave-type">Leave Type</Label>
                    <Select value={leaveType} onValueChange={(v: any) => setLeaveType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for leave..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Request
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Leave Requests Table */}
        <Card className="shadow-card border">
          <CardHeader>
            <CardTitle className="text-lg">
              {isHrOrAdmin ? 'All Leave Requests' : 'My Leave Requests'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isHrOrAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  {isHrOrAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isHrOrAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      {isHrOrAdmin && (
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {leave.profiles?.first_name} {leave.profiles?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{leave.profiles?.employee_id}</p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="capitalize">{leave.leave_type}</TableCell>
                      <TableCell>{format(new Date(leave.start_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.end_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {leave.reason || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={leave.status} />
                      </TableCell>
                      {isHrOrAdmin && (
                        <TableCell>
                          {leave.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                                onClick={() => handleApprove(leave.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(leave.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
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
