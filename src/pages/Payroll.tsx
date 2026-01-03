import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, DollarSign, TrendingUp, Calendar, Download, PrinterIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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

  const totalDeductions = payroll.reduce((sum, p) => sum + Number(p.deductions), 0);
  const totalAllowances = payroll.reduce((sum, p) => sum + Number(p.allowances), 0);

  const handleDownloadSlip = (record: PayrollRecord) => {
    // Placeholder for download functionality
    const slipData = `
SALARY SLIP
${getMonthName(record.month)} ${record.year}

Basic Salary: ${formatCurrency(Number(record.basic_salary))}
Allowances: ${formatCurrency(Number(record.allowances))}
Deductions: ${formatCurrency(Number(record.deductions))}
Net Salary: ${formatCurrency(Number(record.net_salary))}

Payment Date: ${record.payment_date ? format(new Date(record.payment_date), 'MMM d, yyyy') : 'Pending'}
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(slipData));
    element.setAttribute('download', `salary-slip-${record.month}-${record.year}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);2 lg:grid-cols-4">
            <Card className="shadow-card border bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Month</p>
                    <p className="text-2xl font-bold">{formatCurrency(Number(payroll[0]?.net_salary || 0))}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">YTD Earnings</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border bg-info/5 border-info/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Average Monthly</p>
                    <p className="text-2xl font-bold">{formatCurrency(averageSalary)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                    <Calendar className="h-5 w-5 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Records Count</p>
                    <p className="text-2xl font-bold">{payroll.length}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <FileText className="h-5 w-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isHrOrAdmin && payroll.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-card border bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Payroll</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Allowances</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalAllowances)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Deductions</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDeductions)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border bg-info/5 border-info/20">
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Records Count</p>
                  <p className="text-2xl font-bold">{payroll.length}</p>
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
                  </div> className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openPayrollDetails(record)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                          </Dialog>

        {/* Payroll Detail Dialog */}
        {selectedPayroll && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Salary Slip - {getMonthName(selectedPayroll.month)} {selectedPayroll.year}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2">Salary Details</h3>
                </div>

                {/* Income Section */}
                <div>
                  <h4 className="font-semibold mb-3 text-success">EARNINGS</h4>
                  <div className="space-y-2 border-l-2 border-success/30 pl-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic Salary</span>
                      <span className="font-medium">{formatCurrency(Number(selectedPayroll.basic_salary))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allowances</span>
                      <span className="font-medium text-success">+{formatCurrency(Number(selectedPayroll.allowances))}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-success/20">
                      <span className="font-semibold">Gross Salary</span>
                      <span className="font-bold text-success">
                        {formatCurrency(Number(selectedPayroll.basic_salary) + Number(selectedPayroll.allowances))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions Section */}
                <div>
                  <h4 className="font-semibold mb-3 text-destructive">DEDUCTIONS</h4>
                  <div className="space-y-2 border-l-2 border-destructive/30 pl-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deductions</span>
                      <span className="font-medium text-destructive">-{formatCurrency(Number(selectedPayroll.deductions))}</span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Net Salary</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(Number(selectedPayroll.net_salary))}
                    </span>
                  </div>
                  {selectedPayroll.payment_date && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Payment Date: {format(new Date(selectedPayroll.payment_date), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => handleDownloadSlip(selectedPayroll)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Slip
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )                            onClick={() => handleDownloadSlip(record)}
                            className="ml-2"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Downloadund">Average Monthly</p>
                    <p className="text-2xl font-bold">{formatCurrency(averageSalary)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
