
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface MonthlyData {
  month: string;
  count: number;
  conformes: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
  title: string;
}

export function MonthlyChart({ data, title }: MonthlyChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card className="hover-lift animate-fade-in border shadow-sm bg-gradient-to-br from-background to-background/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          {title}
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-6">
            {/* Leyenda mejorada */}
            <div className="flex items-center justify-center gap-8 text-sm bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm" />
                <span className="text-muted-foreground font-medium">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm" />
                <span className="text-muted-foreground font-medium">Conformes</span>
              </div>
            </div>
            
            {/* Gráfico de barras mejorado */}
            <div className="flex items-end justify-between h-56 gap-4 bg-gradient-to-b from-muted/20 to-muted/40 rounded-xl p-6 border border-border/50">
              {data.map((item, index) => {
                const height = (item.count / maxCount) * 100;
                const conformidadRate = item.count > 0 ? (item.conformes / item.count) * 100 : 0;
                const conformesHeight = (item.conformes / maxCount) * 100;
                
                return (
                  <div 
                    key={item.month} 
                    className="flex-1 flex flex-col items-center gap-4 group animate-slide-up hover:scale-105 transition-transform duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative w-full flex justify-center h-40">
                      {/* Container para ambas barras */}
                      <div className="relative w-8 h-full flex flex-col justify-end">
                        {/* Barra total */}
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-lg transition-all duration-700 ease-out group-hover:from-blue-700 group-hover:via-blue-600 group-hover:to-blue-500 shadow-lg border border-blue-400/30 min-h-[6px]"
                          style={{ height: `${Math.max(height, 10)}%` }}
                        />
                        
                        {/* Barra de conformes superpuesta */}
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-lg transition-all duration-700 ease-out shadow-lg border border-emerald-400/30 min-h-[3px]"
                          style={{ height: `${Math.max(conformesHeight, 5)}%` }}
                        />

                        {/* Tooltip en hover */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                          <div className="text-xs font-medium">
                            <div>Total: {item.count}</div>
                            <div>Conformes: {item.conformes}</div>
                            <div>Tasa: {conformidadRate.toFixed(1)}%</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Información del mes mejorada */}
                    <div className="text-center space-y-1 min-h-[4rem]">
                      <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {item.count}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {item.month}
                      </div>
                      <div className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        conformidadRate >= 95 ? "text-emerald-700 bg-emerald-100" :
                        conformidadRate >= 80 ? "text-amber-700 bg-amber-100" :
                        "text-red-700 bg-red-100"
                      )}>
                        {conformidadRate.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-700">
                  {data.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="text-xs text-blue-600">Total General</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-sm font-semibold text-emerald-700">
                  {data.reduce((sum, item) => sum + item.conformes, 0)}
                </div>
                <div className="text-xs text-emerald-600">Conformes</div>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-sm font-semibold text-primary">
                  {data.length > 0 ? ((data.reduce((sum, item) => sum + item.conformes, 0) / data.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-primary/80">Promedio</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
