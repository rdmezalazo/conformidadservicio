
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAreas } from '@/hooks/useConfiguracion';

interface AreaData {
  area: string;
  count: number;
  conformes: number;
}

interface AreaChartProps {
  data: AreaData[];
  title: string;
}

export function AreaChart({ data, title }: AreaChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const { areas } = useAreas();

  const getAreaColor = (areaName: string) => {
    const area = areas.find(a => a.nombre === areaName);
    return area?.color || 'hsl(var(--primary))';
  };

  const getAreaColorWithOpacity = (areaName: string, opacity: number) => {
    const color = getAreaColor(areaName);
    if (color.startsWith('hsl(')) {
      return color.replace(')', `, ${opacity})`);
    }
    return `${color}${Math.round(opacity * 255).toString(16)}`;
  };

  return (
    <Card className="hover-lift animate-fade-in border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          {title}
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <div className="w-8 h-8 rounded bg-muted-foreground/20" />
            </div>
            <p className="text-sm text-muted-foreground">
              No hay datos disponibles
            </p>
          </div>
        ) : (
          data.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const conformidadRate = item.count > 0 ? (item.conformes / item.count) * 100 : 0;
            const areaColor = getAreaColor(item.area);
            
            return (
              <div 
                key={item.area} 
                className="space-y-3 group animate-slide-up p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: areaColor }}
                    />
                    <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors" title={item.area}>
                      {item.area}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground font-medium">{item.count} total</span>
                    <div 
                      className="px-3 py-1 rounded-full text-white font-semibold shadow-sm"
                      style={{ backgroundColor: areaColor }}
                    >
                      {conformidadRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* Barra principal de cantidad */}
                  <div className="relative h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${areaColor}, ${getAreaColorWithOpacity(item.area, 0.8)})`
                      }}
                    />
                  </div>
                  
                  {/* Barra de conformidad */}
                  <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                      style={{ 
                        width: `${conformidadRate}%`,
                        backgroundColor: conformidadRate >= 80 ? 'hsl(var(--success))' : 
                                        conformidadRate >= 60 ? 'hsl(var(--warning))' : 
                                        'hsl(var(--destructive))'
                      }}
                    />
                  </div>
                </div>
                
                {/* Indicadores de rendimiento */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conformes: {item.conformes}</span>
                  <span>No conformes: {item.count - item.conformes}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
