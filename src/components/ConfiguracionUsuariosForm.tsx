import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, User, Upload, Mail, Briefcase, Download } from 'lucide-react';
import { useUsuariosEmpresa, useAreas } from '@/hooks/useConfiguracion';
import { UsuarioEmpresa } from '@/types/configuracion';
import { useForm, Controller } from 'react-hook-form';

interface ConfiguracionUsuariosFormProps {
  onChanges: (hasChanges: boolean) => void;
}

interface UsuarioFormData {
  nombre_completo: string;
  email: string;
  puesto: string;
  area_id?: string;
  color_personal: string;
  avatar_url?: string;
  firma_url?: string;
}

export const ConfiguracionUsuariosForm: React.FC<ConfiguracionUsuariosFormProps> = ({ onChanges }) => {
  const { usuarios, loading, createUsuario, updateUsuario, deleteUsuario, importarResponsables } = useUsuariosEmpresa();
  const { areas } = useAreas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioEmpresa | null>(null);
  
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<UsuarioFormData>();

  const watchedColor = watch('color_personal', '#6366F1');

  const handleOpenDialog = (usuario?: UsuarioEmpresa) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setValue('nombre_completo', usuario.nombre_completo);
      setValue('email', usuario.email);
      setValue('puesto', usuario.puesto);
      setValue('area_id', usuario.area_id || '');
      setValue('color_personal', usuario.color_personal);
      setValue('avatar_url', usuario.avatar_url || '');
      setValue('firma_url', usuario.firma_url || '');
    } else {
      setEditingUsuario(null);
      reset({
        nombre_completo: '',
        email: '',
        puesto: '',
        area_id: '',
        color_personal: '#6366F1',
        avatar_url: '',
        firma_url: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUsuario(null);
    reset();
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      if (editingUsuario) {
        // Para actualización, solo incluir email si es diferente para evitar error de restricción única
        const usuarioData: Partial<UsuarioEmpresa> = {
          nombre_completo: data.nombre_completo,
          puesto: data.puesto,
          area_id: data.area_id || undefined,
          color_personal: data.color_personal,
          avatar_url: data.avatar_url || undefined,
          firma_url: data.firma_url || undefined,
        };

        if (data.email !== editingUsuario.email) {
          usuarioData.email = data.email;
        }

        await updateUsuario(editingUsuario.id, usuarioData);
      } else {
        // Para creación, incluir todos los campos incluyendo email
        const usuarioData = {
          nombre_completo: data.nombre_completo,
          email: data.email,
          puesto: data.puesto,
          area_id: data.area_id || undefined,
          color_personal: data.color_personal,
          avatar_url: data.avatar_url || undefined,
          firma_url: data.firma_url || undefined,
          activo: true
        };

        await createUsuario(usuarioData);
      }
      handleCloseDialog();
      onChanges(true);
    } catch (error) {
      console.error('Error saving usuario:', error);
    }
  };

  const handleDelete = async (usuario: UsuarioEmpresa) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a "${usuario.nombre_completo}"?`)) {
      try {
        await deleteUsuario(usuario.id);
        onChanges(true);
      } catch (error) {
        console.error('Error deleting usuario:', error);
      }
    }
  };

  const handleImportarResponsables = async () => {
    if (window.confirm('¿Deseas importar los responsables de las conformidades como usuarios?')) {
      try {
        await importarResponsables();
        onChanges(true);
      } catch (error) {
        console.error('Error importing responsables:', error);
      }
    }
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con botones de acción */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Responsables de Área</h3>
          <p className="text-sm text-muted-foreground">
            {usuarios.length} responsable{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleImportarResponsables}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Importar Responsables
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Responsable
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>
                    {editingUsuario ? 'Editar Responsable' : 'Nuevo Responsable'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUsuario 
                      ? 'Modifica los datos del responsable seleccionado'
                      : 'Agrega un nuevo responsable de área'
                    }
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
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUsuario ? 'Actualizar' : 'Crear'} Responsable
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="grid gap-4">
        {usuarios.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay responsables registrados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Agrega el primer responsable de área
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer responsable
            </Button>
          </Card>
        ) : (
          usuarios.map((usuario) => (
            <Card key={usuario.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={usuario.avatar_url} alt={usuario.nombre_completo} />
                    <AvatarFallback 
                      style={{ backgroundColor: usuario.color_personal + '20', color: usuario.color_personal }}
                    >
                      {getInitials(usuario.nombre_completo)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{usuario.nombre_completo}</h4>
                      {usuario.puesto === 'Responsable (Importado)' && (
                        <Badge variant="outline" className="text-xs">
                          Importado
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: usuario.color_personal + '20',
                          color: usuario.color_personal,
                          borderColor: usuario.color_personal
                        }}
                      >
                        {usuario.color_personal}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {usuario.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {usuario.puesto}
                      </div>
                      {usuario.area && (
                        <Badge variant="outline" className="text-xs">
                          {usuario.area.nombre}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(usuario)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(usuario)}
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