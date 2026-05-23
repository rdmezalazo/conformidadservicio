import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Building2, Upload } from 'lucide-react';
import { useAreas } from '@/hooks/useConfiguracion';
import { Area } from '@/types/configuracion';
import { useForm } from 'react-hook-form';

interface ConfiguracionAreasFormProps {
  onChanges: (hasChanges: boolean) => void;
}

interface AreaFormData {
  nombre: string;
  descripcion: string;
  color: string;
  icono_url?: string;
}

export const ConfiguracionAreasForm: React.FC<ConfiguracionAreasFormProps> = ({ onChanges }) => {
  const { areas, loading, createArea, updateArea, deleteArea } = useAreas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AreaFormData>();

  const watchedColor = watch('color', '#3B82F6');

  const handleOpenDialog = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setValue('nombre', area.nombre);
      setValue('descripcion', area.descripcion || '');
      setValue('color', area.color);
      setValue('icono_url', area.icono_url || '');
    } else {
      setEditingArea(null);
      reset({
        nombre: '',
        descripcion: '',
        color: '#3B82F6',
        icono_url: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingArea(null);
    reset();
  };

  const onSubmit = async (data: AreaFormData) => {
    try {
      if (editingArea) {
        await updateArea(editingArea.id, {
          nombre: data.nombre,
          descripcion: data.descripcion,
          color: data.color,
          icono_url: data.icono_url || undefined
        });
      } else {
        await createArea({
          nombre: data.nombre,
          descripcion: data.descripcion,
          color: data.color,
          icono_url: data.icono_url || undefined,
          activa: true
        });
      }
      handleCloseDialog();
      onChanges(true);
    } catch (error) {
      console.error('Error saving area:', error);
    }
  };

  const handleDelete = async (area: Area) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el área "${area.nombre}"?`)) {
      try {
        await deleteArea(area.id);
        onChanges(true);
      } catch (error) {
        console.error('Error deleting area:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando áreas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Áreas Configuradas</h3>
          <p className="text-sm text-muted-foreground">
            {areas.length} área{areas.length !== 1 ? 's' : ''} configurada{areas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Área
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {editingArea ? 'Editar Área' : 'Nueva Área'}
                </DialogTitle>
                <DialogDescription>
                  {editingArea 
                    ? 'Modifica los datos del área seleccionada'
                    : 'Configura una nueva área de trabajo'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del área *</Label>
                  <Input
                    id="nombre"
                    {...register('nombre', { required: 'El nombre es requerido' })}
                    placeholder="ej. Logística"
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    {...register('descripcion')}
                    placeholder="Descripción del área y sus responsabilidades"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color distintivo *</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="color"
                      type="color"
                      {...register('color', { required: 'El color es requerido' })}
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
                  {errors.color && (
                    <p className="text-sm text-destructive">{errors.color.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icono_url">URL del ícono (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="icono_url"
                      {...register('icono_url')}
                      placeholder="https://ejemplo.com/icono.svg"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Puedes usar una URL de imagen o subir un archivo
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingArea ? 'Actualizar' : 'Crear'} Área
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de áreas */}
      <div className="grid gap-4">
        {areas.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay áreas configuradas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primera área para organizar mejor tu equipo
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera área
            </Button>
          </Card>
        ) : (
          areas.map((area) => (
            <Card key={area.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: area.color + '20', border: `2px solid ${area.color}` }}
                    >
                      {area.icono_url ? (
                        <img src={area.icono_url} alt={area.nombre} className="w-6 h-6" />
                      ) : (
                        <Building2 className="w-5 h-5" style={{ color: area.color }} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{area.nombre}</h4>
                      {area.descripcion && (
                        <p className="text-sm text-muted-foreground">{area.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: area.color + '20',
                      color: area.color,
                      borderColor: area.color
                    }}
                  >
                    {area.color}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(area)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(area)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};