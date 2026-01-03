import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface PayrollRecord {
  id: string;
  user_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  month: number;
  year: number;
  payment_date: string | null;
}

export default function PayrollPage() {
  const { user, isHrOrAdmin } = useAuth();
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayroll();
    }
  }, [user, isHrOrAdmin]);

  const fetchPayroll = async () => {
    if (isHrOrAdmin) {
      const { data } = await supabase
        .from('payroll')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (data) {
        setPayroll(data as PayrollRecord[]);
      }
    } else {
      const { data } = await supabase
        .from('payroll')
        .select('*')
        .eq('user_id', user?.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (data) {
        setPayroll(data as PayrollRecord[]);
      }
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return format(new Date(2024, month - 1, 1), 'MMMM');
  };

  const totalEarnings = payroll.reduce((sum, p) => sum + Number(p.net_salary), 0);
  const averageSalary = payroll.length > 0 ? totalEarnings / payroll.length : 0;

  if (isLoading) {
    return (
      <DashboardLayout title="Payroll" description="View salary and payment information">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Payroll" 
      description={isHrOrAdmin ? "Manage employee salaries and payments" : "View your salary slips and payment history"}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {isHrOrAdmin ? (
            <>
              <Card className="shadow-card border bg-primary/5 border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Payroll Records</p>
                      <p className="text-2xl font-bold">{payroll.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card border bg-info/5 border-info/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                      <DollarSign className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expenditure (YTD)</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card border bg-success/5 border-success/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Salary</p>
                      <p className="text-2xl font-bold">{formatCurrency(averageSalary)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : payroll.length > 0 ? (
            <>
              <Card className="shadow-card border bg-primary/5 border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Latest Net Salary</p>
                      <p className="text-2xl font-bold">{formatCurrency(Number(payroll[0]?.net_salary || 0))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card border bg-success/5 border-success/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">YTD Earnings</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card border bg-info/5 border-info/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                      <Calendar className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Monthly</p>
                      <p className="text-2xl font-bold">{formatCurrency(averageSalary)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Payroll Table */}
        <Card className="shadow-card border">
          <CardHeader>
            <CardTitle className="text-lg">
              {isHrOrAdmin ? 'All Payroll Records' : 'Salary History'}
            </CardTitle>
            <CardDescription>
              {isHrOrAdmin 
                ? 'View and manage employee payroll records' 
                : 'View your monthly salary slips'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payroll.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Payroll Records</h3>
                <p className="text-muted-foreground">
                  {isHrOrAdmin 
                    ? 'No payroll records have been created yet.' 
                    : 'Your salary information will appear here once processed.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {isHrOrAdmin && <TableHead>Employee</TableHead>}
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Basic Salary</TableHead>
                    <TableHead className="text-right">Allowances</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Payment Date</TableHead>
                    {!isHrOrAdmin && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.map((record) => (
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
                      <TableCell className="font-medium">
                        {getMonthName(record.month)} {record.year}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(record.basic_salary))}</TableCell>
                      <TableCell className="text-right text-success">
                        +{formatCurrency(Number(record.allowances))}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -{formatCurrency(Number(record.deductions))}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(Number(record.net_salary))}
                      </TableCell>
                      <TableCell>
                        {record.payment_date 
                          ? format(new Date(record.payment_date), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      {!isHrOrAdmin && (
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
