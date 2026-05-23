import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConformidadStats {
  total: number;
  conformes: number;
  noConformes: number;
  porcentajeConformidad: number;
}

interface ConformidadSimilar {
  id_correlativo: string;
  proveedor: string;
  conformidad: boolean;
  fecha_conformidad: string;
  observaciones: string;
}

interface ConformidadFieldProps {
  value?: 'si' | 'no';
  onValueChange: (value: 'si' | 'no') => void;
  error?: string;
  proveedor?: string;
  nroFactura?: string;
  areaUsuario?: string;
}

export function ConformidadField({ 
  value, 
  onValueChange, 
  error, 
  proveedor,
  nroFactura,
  areaUsuario 
}: ConformidadFieldProps) {
  const [stats, setStats] = useState<ConformidadStats | null>(null);
  const [conformidadesSimilares, setConformidadesSimilares] = useState<ConformidadSimilar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar estadísticas generales del área
  useEffect(() => {
    const loadStats = async () => {
      if (!areaUsuario) return;

      try {
        const { data, error } = await supabase
          .from('conformidades_servicio')
          .select('conformidad')
          .eq('area', areaUsuario);

        if (error) {
          console.error('Error loading stats:', error);
          return;
        }

        const total = data.length;
        const conformes = data.filter(c => c.conformidad).length;
        const noConformes = total - conformes;
        const porcentajeConformidad = total > 0 ? (conformes / total) * 100 : 0;

        setStats({
          total,
          conformes,
          noConformes,
          porcentajeConformidad
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [areaUsuario]);

  // Cargar conformidades similares cuando cambie el proveedor
  useEffect(() => {
    const loadSimilarConformidades = async () => {
      if (!proveedor || proveedor.length < 3) {
        setConformidadesSimilares([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('conformidades_servicio')
          .select('id_correlativo, proveedor, conformidad, fecha_conformidad, observaciones')
          .ilike('proveedor', `%${proveedor}%`)
          .order('fecha_conformidad', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error loading similar conformidades:', error);
          return;
        }

        setConformidadesSimilares(data || []);

        // Mostrar sugerencia inteligente si hay historial
        if (data && data.length > 0) {
          const conformesCount = data.filter(c => c.conformidad).length;
          const porcentajeConformidad = (conformesCount / data.length) * 100;
          
          if (porcentajeConformidad >= 80) {
            toast({
              title: 'Sugerencia inteligente',
              description: `Este proveedor tiene ${porcentajeConformidad.toFixed(0)}% de conformidad histórica`,
              duration: 3000,
            });
          } else if (porcentajeConformidad <= 50) {
            toast({
              title: 'Atención',
              description: `Este proveedor tiene solo ${porcentajeConformidad.toFixed(0)}% de conformidad histórica`,
              variant: 'destructive',
              duration: 3000,
            });
          }
        }
      } catch (error) {
        console.error('Error loading similar conformidades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadSimilarConformidades, 500);
    return () => clearTimeout(debounceTimer);
  }, [proveedor]);

  const getStatsIcon = () => {
    if (!stats) return null;
    
    if (stats.porcentajeConformidad >= 80) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (stats.porcentajeConformidad <= 50) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getStatsColor = () => {
    if (!stats) return 'default';
    
    if (stats.porcentajeConformidad >= 80) return 'default';
    if (stats.porcentajeConformidad >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      {/* Campo principal de conformidad */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Conformidad</Label>
          {stats && (
            <Badge variant={getStatsColor()} className="flex items-center gap-1">
              {getStatsIcon()}
              {stats.porcentajeConformidad.toFixed(0)}% área
            </Badge>
          )}
        </div>
        
        <RadioGroup
          value={value}
          onValueChange={onValueChange}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="si" id="conformidad-si" />
            <Label htmlFor="conformidad-si" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Sí - Conforme
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="conformidad-no" />
            <Label htmlFor="conformidad-no" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              No - No Conforme
            </Label>
          </div>
        </RadioGroup>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Estadísticas del área */}
      {stats && stats.total > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-2">
              Estadísticas del área {areaUsuario}:
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">{stats.conformes}</div>
                <div className="text-muted-foreground">Conformes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{stats.noConformes}</div>
                <div className="text-muted-foreground">No Conformes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{stats.total}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conformidades similares del proveedor */}
      {conformidadesSimilares.length > 0 && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-blue-800 mb-3">
              Historial reciente del proveedor ({conformidadesSimilares.length} registros):
            </div>
            <div className="space-y-2">
              {conformidadesSimilares.map((conformidad) => (
                <div 
                  key={conformidad.id_correlativo}
                  className="flex items-center justify-between p-2 bg-white rounded-md border"
                >
                  <div className="flex items-center gap-2">
                    {conformidad.conformidad ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      {conformidad.id_correlativo}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(conformidad.fecha_conformidad).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={conformidad.conformidad ? 'default' : 'destructive'}>
                    {conformidad.conformidad ? 'Conforme' : 'No Conforme'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="text-sm text-muted-foreground text-center">
          Analizando historial del proveedor...
        </div>
      )}
    </div>
  );
}