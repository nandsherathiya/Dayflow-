import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'hover:border-primary/50',
  primary: 'hover:border-primary',
  success: 'hover:border-success',
  warning: 'hover:border-warning',
};

const iconBgStyles = {
  default: 'bg-muted group-hover:bg-primary/10',
  primary: 'bg-primary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
};

const iconTextStyles = {
  default: 'text-muted-foreground group-hover:text-primary',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
};

export function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  variant = 'default' 
}: QuickActionCardProps) {
  return (
    <Link to={href} className="group">
      <Card className={cn(
        'card-hover shadow-card border transition-all duration-200',
        variantStyles[variant]
      )}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors',
              iconBgStyles[variant]
            )}>
              <div className={cn(
                'transition-colors',
                iconTextStyles[variant]
              )}>
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
