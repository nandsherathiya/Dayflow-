import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Users, Mail, Phone, Building2, Briefcase, Calendar, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';

interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  department: string | null;
  designation: string | null;
  date_of_joining: string | null;
  avatar_url: string | null;
}

export default function EmployeesPage() {
  const { isHrOrAdmin, isLoading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (isHrOrAdmin) {
      fetchEmployees();
    }
  }, [isHrOrAdmin]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      // Extract unique departments
      const depts = Array.from(new Set(data.map(emp => emp.department).filter(Boolean))) as string[];
      setDepartments(depts);
      .order('first_name');

    if (data) {
      setEmployees(data as Employee[]);
    }
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Employees" description="Manage employee directory">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
const matchesSearch = (
      emp.first_name.toLowerCase().includes(searchLower) ||
      emp.last_name.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.employee_id.toLowerCase().includes(searchLower) ||
      (emp.department?.toLowerCase().includes(searchLower) ?? false)
    );

    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const openEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailDialogOpen(true);
  }return (
      emp.first_name.toLowerCase().includes(searchLower) ||
      emp.last_name.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Filtered Results</p>
                  <p className="text-2xl font-bold">{filteredEmployees.length}</p>
                </div>
                <Search className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Departments</p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                </div>
                <Building2 className="h-5 w-5 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Table */}
        <Card className="shadow-card border">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg">Employee Directory</CardTitle>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <TableHead>Actions
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div
        {/* Employee Table */}
        <Card className="shadow-card border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Employee Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <Tab  <TableCell>
                            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEmployeeDetails(employee)}
                                >
                                  <Edit2 className="h-4 w-4" />

        {/* Employee Detail Dialog */}
        {selectedEmployee && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Employee Details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedEmployee.avatar_url || ''} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.designation || 'N/A'}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </p>
                      <p className="font-medium break-all">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </p>
                      <p className="font-medium">{selectedEmployee.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Employee ID
                      </p>
                      <p className="font-mono font-medium">{selectedEmployee.employee_id}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Department
                      </p>
                      <p className="font-medium">{selectedEmployee.department || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Designation
                      </p>
                      <p className="font-medium">{selectedEmployee.designation || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date of Joining
                      </p>
                      <p className="font-medium">
                        {selectedEmployee.date_of_joining 
                          ? format(new Date(selectedEmployee.date_of_joining), 'MMMM d, yyyy')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Edit Employee</Button>
                  <Button variant="outline" className="flex-1">View Full History</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )                          </TableCell>
                        leHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const initials = `${employee.first_name[0] || ''}${employee.last_name[0] || ''}`.toUpperCase();
                      const role = employee.user_roles?.[0]?.role || 'employee';
                      
                      return (
                        <TableRow key={employee.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={employee.avatar_url || ''} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {employee.first_name} {employee.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">{employee.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{employee.employee_id}</TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell>{employee.designation || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={role === 'admin' ? 'default' : role === 'hr' ? 'secondary' : 'outline'} className="capitalize">
                              {role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {employee.date_of_joining 
                              ? format(new Date(employee.date_of_joining), 'MMM d, yyyy')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
