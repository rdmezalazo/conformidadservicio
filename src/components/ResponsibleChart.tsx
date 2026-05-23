import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users } from 'lucide-react';

interface ResponsibleData {
  responsable: string;
  count: number;
  conformes: number;
  color?: string;
}

interface ResponsibleChartProps {
  data: ResponsibleData[];
  title: string;
}

export function ResponsibleChart({ data, title }: ResponsibleChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card className="hover-lift animate-fade-in border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              No hay datos disponibles
            </p>
          </div>
        ) : (
          data.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const conformidadRate = item.count > 0 ? (item.conformes / item.count) * 100 : 0;
            const userColor = item.color || '#6366F1';
            
            return (
              <div 
                key={item.responsable} 
                className="space-y-3 p-3 rounded-lg bg-gradient-to-r from-background to-muted/20 border border-border/50 hover:shadow-md transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header con nombre y estadísticas */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar con color personalizado */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                      style={{ backgroundColor: userColor }}
                    >
                      {item.responsable.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[200px]" title={item.responsable}>
                      {item.responsable}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-foreground">{item.count}</div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold" style={{ color: userColor }}>
                        {conformidadRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">conformes</div>
                    </div>
                  </div>
                </div>
                
                {/* Barras de progreso personalizadas */}
                <div className="space-y-2">
                  {/* Barra principal (total) */}
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-700 ease-out rounded-full shadow-sm"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: userColor,
                        opacity: 0.8
                      }}
                    />
                  </div>
                  
                  {/* Barra de conformidad */}
                  <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-700 ease-out rounded-full shadow-sm"
                      style={{ 
                        width: `${conformidadRate}%`,
                        backgroundColor: userColor,
                        opacity: 1
                      }}
                    />
                  </div>
                </div>
                
                {/* Indicador de rendimiento */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Rendimiento</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    conformidadRate >= 95 ? 'bg-emerald-100 text-emerald-700' :
                    conformidadRate >= 80 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {conformidadRate >= 95 ? 'Excelente' :
                     conformidadRate >= 80 ? 'Bueno' : 'Necesita mejorar'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}