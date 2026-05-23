import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id_correlativo: string;
  proveedor: string;
  conformidad: boolean;
  fecha: string;
}

interface RecentActivityProps {
  data: ActivityItem[];
  title: string;
}

export function RecentActivity({ data, title }: RecentActivityProps) {
  return (
    <Card className="hover-lift animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {title}
          <div className="h-2 w-2 rounded-full bg-warning animate-pulse-subtle" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-muted-foreground/20" />
            </div>
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div 
                key={item.id_correlativo} 
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0 transition-all duration-200",
                  item.conformidad 
                    ? 'bg-success shadow-lg shadow-success/20' 
                    : 'bg-destructive shadow-lg shadow-destructive/20'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {item.id_correlativo}
                    </span>
                    <Badge 
                      variant={item.conformidad ? 'default' : 'destructive'} 
                      className="text-xs font-medium px-2 py-0.5"
                    >
                      {item.conformidad ? 'Conforme' : 'No Conforme'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate" title={item.proveedor}>
                    {item.proveedor}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                  {formatDistanceToNow(new Date(item.fecha), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}