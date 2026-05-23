import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'violet' | 'teal' | 'orange' | 'pink' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: "border-border/50 hover:border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent",
  violet: "border-violet/20 hover:border-violet/40 bg-gradient-to-br from-violet/10 via-violet/5 to-background shadow-glow-violet",
  teal: "border-teal/20 hover:border-teal/40 bg-gradient-to-br from-teal/10 via-teal/5 to-background shadow-glow-teal",
  orange: "border-orange/20 hover:border-orange/40 bg-gradient-to-br from-orange/10 via-orange/5 to-background shadow-glow-orange",
  pink: "border-pink/20 hover:border-pink/40 bg-gradient-to-br from-pink/10 via-pink/5 to-background shadow-glow-pink",
  success: "border-success/20 hover:border-success/40 bg-gradient-to-br from-success/10 via-success/5 to-background shadow-glow-teal",
  warning: "border-warning/20 hover:border-warning/40 bg-gradient-to-br from-warning/10 via-warning/5 to-background shadow-glow-orange",
  info: "border-info/20 hover:border-info/40 bg-gradient-to-br from-info/10 via-info/5 to-background shadow-glow",
};

export function StatCard({ title, value, description, icon: Icon, trend, className, variant = 'default' }: StatCardProps) {
  const getIconColor = () => {
    switch (variant) {
      case 'violet': return 'text-violet';
      case 'teal': return 'text-teal';
      case 'orange': return 'text-orange';
      case 'pink': return 'text-pink';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'info': return 'text-info';
      default: return 'text-primary';
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'violet': return 'bg-violet/10 group-hover:bg-violet/20';
      case 'teal': return 'bg-teal/10 group-hover:bg-teal/20';
      case 'orange': return 'bg-orange/10 group-hover:bg-orange/20';
      case 'pink': return 'bg-pink/10 group-hover:bg-pink/20';
      case 'success': return 'bg-success/10 group-hover:bg-success/20';
      case 'warning': return 'bg-warning/10 group-hover:bg-warning/20';
      case 'info': return 'bg-info/10 group-hover:bg-info/20';
      default: return 'bg-primary/10 group-hover:bg-primary/20';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden hover-lift animate-fade-in group transition-all duration-300 hover:shadow-lg",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full transition-colors", getIconBg())}>
          <Icon className={cn("h-4 w-4", getIconColor())} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium",
                trend.isPositive 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {trend.isPositive ? "↗" : "↘"} {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
            {description && (
              <span>
                {description}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}