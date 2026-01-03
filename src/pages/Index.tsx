import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  CalendarCheck, 
  CalendarDays, 
  DollarSign, 
  Users, 
  Shield, 
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Employee Management',
      description: 'Manage employee profiles, departments, and organizational structure efficiently.',
    },
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      title: 'Attendance Tracking',
      description: 'Real-time check-in/out with comprehensive attendance history and reports.',
    },
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: 'Leave Management',
      description: 'Streamlined leave requests with approval workflows and balance tracking.',
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Payroll Visibility',
      description: 'Clear salary breakdowns and downloadable pay slips for employees.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Role-Based Access',
      description: 'Secure access controls for employees, HR, and administrators.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics & Reports',
      description: 'Insightful dashboards and reports for data-driven decisions.',
    },
  ];

  const benefits = [
    'Streamline HR operations',
    'Reduce administrative workload',
    'Improve employee experience',
    'Real-time data visibility',
    'Secure and compliant',
    'Mobile responsive',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              D
            </div>
            <span className="font-bold text-xl">Dayflow</span>
          </div>
          <Link to="/auth">
            <Button>
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Enterprise-grade HRMS
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Every workday,{' '}
            <span className="text-primary">perfectly aligned</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your HR operations with Dayflow. Manage employees, track attendance, 
            handle leave requests, and oversee payroll — all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="px-8">
                Start Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage HR</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern HR teams and employees alike.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-card border shadow-card card-hover"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Built for modern workplaces
              </h2>
              <p className="text-muted-foreground mb-8">
                Dayflow is designed to simplify HR management while providing employees 
                with the tools they need for self-service.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="inline-block mt-8">
                <Button>
                  Get Started Today
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border shadow-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl mx-auto mb-4">
                    D
                  </div>
                  <p className="text-lg font-semibold">Dayflow Dashboard</p>
                  <p className="text-sm text-muted-foreground">Your HR command center</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your HR?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join companies that trust Dayflow for their HR management needs.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8">
              Start Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              D
            </div>
            <span className="font-semibold">Dayflow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Dayflow HRMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
