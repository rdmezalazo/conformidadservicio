import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { ConformidadFormData } from '@/types/conformidad';
import { useUserArea } from '@/hooks/useUserArea';
import { ResponsableSearchSelect } from '@/components/ResponsableSearchSelect';
import { UsuarioEmpresa } from '@/hooks/useUsuariosEmpresa';
import { ConformidadField } from '@/components/ConformidadField';

const conformidadSchema = z.object({
  ruc: z.string().regex(/^\d{11}$/, 'RUC debe tener 11 dígitos'),
  proveedor: z.string().min(1, 'Proveedor es requerido'),
  nro_factura: z.string().min(1, 'Número de factura es requerido'),
  nro_centro_costo: z.string().min(1, 'Número de centro de costo es requerido'),
  nro_orden_servicio: z.string().min(1, 'Número de orden de servicio es requerido'),
  nro_of: z.string().optional(),
  solicitante: z.string().optional(),
  fecha_conformidad: z.date({
    required_error: 'Fecha de conformidad es requerida',
  }),
  descripcion_servicio: z.string().min(1, 'Descripción del servicio es requerida'),
  conformidad: z.enum(['si', 'no'], {
    required_error: 'Debe indicar conformidad',
  }),
  observaciones: z.string().optional(),
  responsable: z.string().min(1, 'Responsable es requerido'),
  area: z.string().min(1, 'Área es requerida'),
});

interface ConformidadFormProps {
  onSuccess: () => void;
  isViewMode?: boolean;
  onBackToList?: () => void;
  conformidadId?: string;
}

export function ConformidadForm({ onSuccess, isViewMode = false, onBackToList, conformidadId }: ConformidadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioEmpresa | null>(null);
  const [generatedId, setGeneratedId] = useState<string>('');
  const { userArea, isLoading: userAreaLoading } = useUserArea();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ConformidadFormData>({
    resolver: zodResolver(conformidadSchema),
    defaultValues: {
      fecha_conformidad: new Date(),
    },
  });

  const conformidad = watch('conformidad');

  // Cargar datos de conformidad existente en modo vista
  useEffect(() => {
    const loadConformidadData = async () => {
      if (isViewMode && conformidadId) {
        try {
          const { data, error } = await supabase
            .from('conformidades_servicio')
            .select('*')
            .eq('id_correlativo', conformidadId)
            .single();
          
          if (error) {
            console.error('Error loading conformidad:', error);
            toast({
              title: 'Error',
              description: 'No se pudo cargar la conformidad',
              variant: 'destructive',
            });
          } else if (data) {
            // Establecer el correlativo
            setGeneratedId(data.id_correlativo);
            
            // Llenar el formulario con los datos
            setValue('ruc', data.ruc);
            setValue('proveedor', data.proveedor);
            setValue('nro_factura', data.nro_factura);
            setValue('nro_centro_costo', data.nro_centro_costo);
            setValue('nro_orden_servicio', data.nro_orden_servicio);
            setValue('nro_of', data.nro_of || '');
            setValue('solicitante', data.solicitante || '');
            setValue('fecha_conformidad', new Date(data.fecha_conformidad));
            setValue('descripcion_servicio', data.descripcion_servicio);
            setValue('conformidad', data.conformidad ? 'si' : 'no');
            setValue('observaciones', data.observaciones || '');
            setValue('responsable', data.responsable);
            setValue('area', data.area);
          }
        } catch (error) {
          console.error('Error loading conformidad:', error);
        }
      }
    };

    const generateCorrelativo = async () => {
      if (!isViewMode && userArea) {
        try {
          const { data, error } = await supabase
            .rpc('generate_correlativo_by_area', { area_name: userArea });
          
          if (error) {
            console.error('Error generating correlativo:', error);
          } else {
            setGeneratedId(data || 'CS-GEN-0001');
          }
        } catch (error) {
          console.error('Error generating correlativo:', error);
          setGeneratedId('CS-GEN-0001');
        }
      }
    };

    if (isViewMode && conformidadId) {
      loadConformidadData();
    } else {
      generateCorrelativo();
    }
  }, [isViewMode, conformidadId, userArea, setValue]);

  // Establecer fecha actual y área automáticamente
  useEffect(() => {
    setValue('fecha_conformidad', new Date());
    if (userArea) {
      setValue('area', userArea);
    }
  }, [setValue, userArea]);

  // Manejar cambio de responsable
  const handleUsuarioChange = (usuario: UsuarioEmpresa | null) => {
    setSelectedUsuario(usuario);
    if (usuario) {
      setValue('responsable', usuario.nombre_completo);
      setValue('area', usuario.areas?.nombre || '');
    } else {
      setValue('responsable', '');
      setValue('area', userArea || '');
    }
  };

  const onSubmit = async (data: ConformidadFormData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes estar autenticado para crear conformidades',
          variant: 'destructive',
        });
        return;
      }

      // Obtener la firma del perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('firma_url')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('conformidades_servicio')
        .insert({
          id_correlativo: generatedId, // Usar el ID generado
          ruc: data.ruc,
          proveedor: data.proveedor,
          nro_factura: data.nro_factura,
          nro_centro_costo: data.nro_centro_costo,
          nro_orden_servicio: data.nro_orden_servicio,
          nro_of: data.nro_of || '',
          solicitante: data.solicitante || '',
          fecha_conformidad: format(data.fecha_conformidad, 'yyyy-MM-dd'),
          descripcion_servicio: data.descripcion_servicio,
          conformidad: data.conformidad === 'si',
          observaciones: data.observaciones || '',
          responsable: data.responsable,
          area: data.area,
          usuario_id: user.id,
          firma: profile?.firma_url || null,
        });

      if (error) {
        console.error('Error creating conformidad:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear la conformidad',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Conformidad creada correctamente',
        });
        reset();
        setSelectedUsuario(null);
        setValue('fecha_conformidad', new Date());
        if (userArea) {
          setValue('area', userArea);
        }
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/bb1a0148-f0ff-4c91-9457-9845ede8ab96.png" 
            alt="Livi.gui Logo" 
            className="h-12 w-auto"
          />
          <CardTitle className="text-2xl font-bold flex-1 text-center">
            CONFORMIDAD DE SERVICIO
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_correlativo">ID Correlativo</Label>
              <Input
                id="id_correlativo"
                type="text"
                value={generatedId}
                readOnly
                className="bg-muted text-muted-foreground cursor-not-allowed"
                placeholder="Generando..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC (11 dígitos)</Label>
              <Input
                id="ruc"
                type="text"
                maxLength={11}
                placeholder="12345678901"
                {...register('ruc')}
              />
              {errors.ruc && (
                <p className="text-sm text-destructive">{errors.ruc.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                type="text"
                placeholder="Nombre del proveedor"
                {...register('proveedor')}
              />
              {errors.proveedor && (
                <p className="text-sm text-destructive">{errors.proveedor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nro_factura">Nro Factura</Label>
              <Input
                id="nro_factura"
                type="text"
                placeholder="F001-00000001"
                {...register('nro_factura')}
              />
              {errors.nro_factura && (
                <p className="text-sm text-destructive">{errors.nro_factura.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nro_centro_costo">Nro Centro de Costo</Label>
              <Input
                id="nro_centro_costo"
                type="text"
                placeholder="CC-001"
                {...register('nro_centro_costo')}
              />
              {errors.nro_centro_costo && (
                <p className="text-sm text-destructive">{errors.nro_centro_costo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nro_orden_servicio">Nro Orden Servicio</Label>
              <Input
                id="nro_orden_servicio"
                type="text"
                placeholder="123456"
                {...register('nro_orden_servicio')}
              />
              {errors.nro_orden_servicio && (
                <p className="text-sm text-destructive">{errors.nro_orden_servicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nro_of">Nro OF (Opcional)</Label>
              <Input
                id="nro_of"
                type="text"
                placeholder="OF-001"
                {...register('nro_of')}
              />
              {errors.nro_of && (
                <p className="text-sm text-destructive">{errors.nro_of.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha de Conformidad</Label>
              <Input
                type="text"
                value={format(new Date(), 'dd/MM/yyyy')}
                readOnly
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <ResponsableSearchSelect
                value={watch('responsable')}
                onValueChange={(value) => setValue('responsable', value)}
                onUsuarioChange={handleUsuarioChange}
              />
              {errors.responsable && (
                <p className="text-sm text-destructive">{errors.responsable.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Input
                id="area"
                type="text"
                value={watch('area') || ''}
                readOnly
                className="bg-muted text-muted-foreground cursor-not-allowed"
                placeholder="Se llenará automáticamente"
              />
              {errors.area && (
                <p className="text-sm text-destructive">{errors.area.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion_servicio">Descripción del Servicio</Label>
            <Textarea
              id="descripcion_servicio"
              placeholder="Descripción detallada del servicio recibido"
              rows={4}
              {...register('descripcion_servicio')}
            />
            {errors.descripcion_servicio && (
              <p className="text-sm text-destructive">{errors.descripcion_servicio.message}</p>
            )}
          </div>

          <ConformidadField
            value={conformidad}
            onValueChange={(value) => setValue('conformidad', value as 'si' | 'no')}
            error={errors.conformidad?.message}
            proveedor={watch('proveedor')}
            nroFactura={watch('nro_factura')}
            areaUsuario={userArea || ''}
          />

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
              {...register('observaciones')}
            />
            {errors.observaciones && (
              <p className="text-sm text-destructive">{errors.observaciones.message}</p>
            )}
          </div>

          {isViewMode ? (
            <div className="flex justify-center">
              <Button 
                type="button" 
                onClick={onBackToList}
                className="px-8"
              >
                Regresar a Lista de conformidades
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Conformidad
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedUsuario(null);
                  setValue('fecha_conformidad', new Date());
                  if (userArea) {
                    setValue('area', userArea);
                  }
                }}
                disabled={isLoading}
              >
                Limpiar
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}