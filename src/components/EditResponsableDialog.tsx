import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { UsuarioEmpresa } from '@/types/configuracion';
import { useAreas } from '@/hooks/useConfiguracion';

interface EditResponsableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  responsable: UsuarioEmpresa | null;
  onUpdate: (id: string, data: Partial<UsuarioEmpresa>) => Promise<void>;
}

interface ResponsableFormData {
  nombre_completo: string;
  email: string;
  puesto: string;
  area_id?: string;
  color_personal: string;
  avatar_url?: string;
  firma_url?: string;
}

export const EditResponsableDialog: React.FC<EditResponsableDialogProps> = ({
  isOpen,
  onClose,
  responsable,
  onUpdate,
}) => {
  const { areas } = useAreas();
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<ResponsableFormData>();

  const watchedColor = watch('color_personal', '#6366F1');

  useEffect(() => {
    if (responsable && isOpen) {
      setValue('nombre_completo', responsable.nombre_completo);
      setValue('email', responsable.email);
      setValue('puesto', responsable.puesto);
      setValue('area_id', responsable.area_id || '');
      setValue('color_personal', responsable.color_personal);
      setValue('avatar_url', responsable.avatar_url || '');
      setValue('firma_url', responsable.firma_url || '');
    }
  }, [responsable, isOpen, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ResponsableFormData) => {
    if (!responsable) return;

    try {
      const updateData: Partial<UsuarioEmpresa> = {
        nombre_completo: data.nombre_completo,
        puesto: data.puesto,
        area_id: data.area_id || undefined,
        color_personal: data.color_personal,
        avatar_url: data.avatar_url || undefined,
        firma_url: data.firma_url || undefined,
      };

      // Solo incluir email si es diferente al actual para evitar error de restricción única
      if (data.email !== responsable.email) {
        updateData.email = data.email;
      }

      await onUpdate(responsable.id, updateData);
      handleClose();
    } catch (error) {
      console.error('Error updating responsable:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Editar Responsable</DialogTitle>
            <DialogDescription>
              Modifica los datos del responsable seleccionado
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_completo">Nombre completo *</Label>
                <Input
                  id="nombre_completo"
                  {...register('nombre_completo', { required: 'El nombre es requerido' })}
                  placeholder="Juan Pérez García"
                />
                {errors.nombre_completo && (
                  <p className="text-sm text-destructive">{errors.nombre_completo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  placeholder="juan.perez@empresa.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="puesto">Puesto *</Label>
                <Input
                  id="puesto"
                  {...register('puesto', { required: 'El puesto es requerido' })}
                  placeholder="Supervisor de Calidad"
                />
                {errors.puesto && (
                  <p className="text-sm text-destructive">{errors.puesto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_id">Área</Label>
                <Controller
                  name="area_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: area.color }}
                              />
                              {area.nombre}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_personal">Color personal *</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color_personal"
                  type="color"
                  {...register('color_personal', { required: 'El color es requerido' })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: watchedColor }}
                  />
                  <span className="text-sm text-muted-foreground">{watchedColor}</span>
                </div>
              </div>
              {errors.color_personal && (
                <p className="text-sm text-destructive">{errors.color_personal.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL del avatar (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="avatar_url"
                    {...register('avatar_url')}
                    placeholder="https://ejemplo.com/avatar.jpg"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firma_url">URL de la firma (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="firma_url"
                    {...register('firma_url')}
                    placeholder="https://ejemplo.com/firma.png"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Actualizar Responsable
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};