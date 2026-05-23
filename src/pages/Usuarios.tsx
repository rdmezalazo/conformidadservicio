import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Shield, ShieldCheck, ShieldX, Trash2, UserX, Edit2, Users as UsersIcon, UserPlus, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react';
import { useSystemUsers, SystemUser } from '@/hooks/useSystemUsers';
import { useUsuariosEmpresa } from '@/hooks/useConfiguracion';
import { useAuth } from '@/hooks/useAuth';
import { UsuarioEmpresa } from '@/types/configuracion';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EditResponsableDialog } from '@/components/EditResponsableDialog';

interface CreateUserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  username: string;
  role: 'admin' | 'supervisor' | 'usuario_responsable';
}

interface AddToUsersFormData {
  password: string;
  confirmPassword: string;
  role: 'admin' | 'supervisor' | 'usuario_responsable';
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const Usuarios: React.FC = () => {
  const { users, loading, createUser, addCompanyUserToSystem, deactivateUser, deleteUser, changeUserRole, resetUserPassword } = useSystemUsers();
  const { usuarios: responsables, loading: loadingResponsables, updateUsuario } = useUsuariosEmpresa();
  const { userRole, isAdmin } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isAddToUsersDialogOpen, setIsAddToUsersDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isEditResponsableDialogOpen, setIsEditResponsableDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedResponsable, setSelectedResponsable] = useState<UsuarioEmpresa | null>(null);
  const [editingResponsable, setEditingResponsable] = useState<UsuarioEmpresa | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'supervisor' | 'usuario_responsable'>('supervisor');

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<CreateUserFormData>();
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, control: controlAdd, watch: watchAdd, formState: { errors: errorsAdd } } = useForm<AddToUsersFormData>();
  const { register: registerReset, handleSubmit: handleSubmitReset, reset: resetReset, watch: watchReset, formState: { errors: errorsReset } } = useForm<ResetPasswordFormData>();
  const password = watch('password');
  const passwordAdd = watchAdd('password');
  const passwordReset = watchReset('password');

  const handleCreateUser = async (data: CreateUserFormData) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    const success = await createUser({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      role: data.role
    });

    if (success) {
      setIsCreateDialogOpen(false);
      reset();
    }
  };

  const handleDeactivateUser = async (user: SystemUser) => {
    if (window.confirm(`¿Estás seguro de que deseas desactivar a "${user.email}"?`)) {
      await deactivateUser(user.user_id);
    }
  };

  const handleDeleteUser = async (user: SystemUser) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${user.email}"? Esta acción no se puede deshacer.`)) {
      await deleteUser(user.user_id);
    }
  };

  const handleChangeRole = async () => {
    if (selectedUser) {
      const success = await changeUserRole(selectedUser.user_id, newRole, 'Cambio de rol desde interfaz de administración');
      if (success) {
        setIsRoleDialogOpen(false);
        setSelectedUser(null);
      }
    }
  };

  const handleAddToUsers = async (data: AddToUsersFormData) => {
    if (!selectedResponsable || data.password !== data.confirmPassword) {
      return;
    }

    const success = await addCompanyUserToSystem(
      selectedResponsable.email,
      data.password,
      data.role
    );

    if (success) {
      setIsAddToUsersDialogOpen(false);
      setSelectedResponsable(null);
      resetAdd();
    }
  };

  const handleToggleResponsable = async (responsable: UsuarioEmpresa) => {
    await updateUsuario(responsable.id, { activo: !responsable.activo });
  };

  const handleEditResponsable = (responsable: UsuarioEmpresa) => {
    setEditingResponsable(responsable);
    setIsEditResponsableDialogOpen(true);
  };

  const handleUpdateResponsable = async (id: string, data: Partial<UsuarioEmpresa>) => {
    await updateUsuario(id, data);
    setIsEditResponsableDialogOpen(false);
    setEditingResponsable(null);
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!selectedUser || data.password !== data.confirmPassword) {
      return;
    }

    const success = await resetUserPassword(selectedUser.user_id, data.password);
    if (success) {
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      resetReset();
    }
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4 text-red-500" />;
      case 'supervisor':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'usuario_responsable':
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <ShieldX className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'supervisor':
        return 'secondary';
      case 'usuario_responsable':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      case 'usuario_responsable':
        return 'Usuario Responsable';
      default:
        return 'Evaluador';
    }
  };

  // Función para convertir roles antiguos a los nuevos tipos permitidos
  const mapRoleToAllowed = (role: string): 'admin' | 'supervisor' | 'usuario_responsable' => {
    switch (role) {
      case 'admin':
        return 'admin';
      case 'supervisor':
        return 'supervisor';
      case 'usuario_responsable':
        return 'usuario_responsable';
      default:
        return 'supervisor'; // Por defecto, asignar supervisor a evaluadores
    }
  };

  if (loading || loadingResponsables) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UsersIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              Administra los usuarios del sistema y sus permisos
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit(handleCreateUser)}>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Crear un nuevo usuario que podrá acceder al sistema
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      {...register('first_name', { required: 'El nombre es requerido' })}
                      placeholder="Juan"
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input
                      id="last_name"
                      {...register('last_name', { required: 'El apellido es requerido' })}
                      placeholder="Pérez"
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="jperez"
                  />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password', { 
                        required: 'La contraseña es requerida',
                        minLength: {
                          value: 6,
                          message: 'La contraseña debe tener al menos 6 caracteres'
                        }
                      })}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword', { 
                        required: 'Confirma la contraseña',
                        validate: value => value === password || 'Las contraseñas no coinciden'
                      })}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Controller
                    name="role"
                    control={control}
                    defaultValue="supervisor"
                    rules={{ required: 'El rol es requerido' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {isAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="usuario_responsable">Usuario Responsable</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Usuario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''} en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead>Fecha de registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.username || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.username && (
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.user_role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(user.user_role)}
                      {getRoleLabel(user.user_role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : 'Nunca'
                    }
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(mapRoleToAllowed(user.user_role));
                          setIsRoleDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsResetPasswordDialogOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivateUser(user)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay usuarios registrados</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea el primer usuario del sistema
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer usuario
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de responsables */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Registrado</CardTitle>
          <CardDescription>
            {responsables.length} responsable{responsables.length !== 1 ? 's' : ''} registrado{responsables.length !== 1 ? 's' : ''} en la empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Responsable</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responsables.map((responsable) => (
                <TableRow key={responsable.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={responsable.avatar_url || undefined} />
                        <AvatarFallback 
                          className="text-xs font-medium text-white"
                          style={{ backgroundColor: responsable.color_personal }}
                        >
                          {getInitials(responsable.nombre_completo)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{responsable.nombre_completo}</div>
                        <div className="text-sm text-muted-foreground">{responsable.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{responsable.puesto}</TableCell>
                  <TableCell>
                    {responsable.area ? responsable.area.nombre : 'Sin área asignada'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={responsable.activo ? 'default' : 'secondary'}>
                      {responsable.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedResponsable(responsable);
                          setIsAddToUsersDialogOpen(true);
                        }}
                        disabled={users.some(user => user.email === responsable.email)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {users.some(user => user.email === responsable.email) ? 'Ya es usuario' : 'Agregar a Usuarios'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleResponsable(responsable)}
                      >
                        {responsable.activo ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-600" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditResponsable(responsable)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {responsables.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay responsables registrados</h3>
              <p className="text-sm text-muted-foreground">
                Los responsables se importan automáticamente desde las conformidades
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para agregar responsable a usuarios */}
      <Dialog open={isAddToUsersDialogOpen} onOpenChange={setIsAddToUsersDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleSubmitAdd(handleAddToUsers)}>
            <DialogHeader>
              <DialogTitle>Agregar a Usuarios del Sistema</DialogTitle>
              <DialogDescription>
                Crear usuario para {selectedResponsable?.nombre_completo}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="addPassword">Contraseña *</Label>
                <Input
                  id="addPassword"
                  type="password"
                  {...registerAdd('password', { 
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  placeholder="••••••••"
                />
                {errorsAdd.password && (
                  <p className="text-sm text-destructive">{errorsAdd.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addConfirmPassword">Confirmar contraseña *</Label>
                <Input
                  id="addConfirmPassword"
                  type="password"
                  {...registerAdd('confirmPassword', { 
                    required: 'Confirma la contraseña',
                    validate: value => value === passwordAdd || 'Las contraseñas no coinciden'
                  })}
                  placeholder="••••••••"
                />
                {errorsAdd.confirmPassword && (
                  <p className="text-sm text-destructive">{errorsAdd.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addRole">Rol *</Label>
                <Controller
                  name="role"
                  control={controlAdd}
                  defaultValue="supervisor"
                  rules={{ required: 'El rol es requerido' }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {isAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="usuario_responsable">Usuario Responsable</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errorsAdd.role && (
                  <p className="text-sm text-destructive">{errorsAdd.role.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddToUsersDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar rol */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambiar el rol de {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newRole">Nuevo rol</Label>
              <Select value={newRole} onValueChange={(value: 'admin' | 'supervisor' | 'usuario_responsable') => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="usuario_responsable">Usuario Responsable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole}>
              Cambiar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para reestablecer contraseña */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleSubmitReset(handleResetPassword)}>
            <DialogHeader>
              <DialogTitle>Reestablecer Contraseña</DialogTitle>
              <DialogDescription>
                Cambiar la contraseña de {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resetPassword">Nueva contraseña *</Label>
                <Input
                  id="resetPassword"
                  type="password"
                  {...registerReset('password', { 
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  placeholder="••••••••"
                />
                {errorsReset.password && (
                  <p className="text-sm text-destructive">{errorsReset.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resetConfirmPassword">Confirmar contraseña *</Label>
                <Input
                  id="resetConfirmPassword"
                  type="password"
                  {...registerReset('confirmPassword', { 
                    required: 'Confirma la contraseña',
                    validate: value => value === passwordReset || 'Las contraseñas no coinciden'
                  })}
                  placeholder="••••••••"
                />
                {errorsReset.confirmPassword && (
                  <p className="text-sm text-destructive">{errorsReset.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Reestablecer Contraseña
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar responsable */}
      <EditResponsableDialog
        isOpen={isEditResponsableDialogOpen}
        onClose={() => {
          setIsEditResponsableDialogOpen(false);
          setEditingResponsable(null);
        }}
        responsable={editingResponsable}
        onUpdate={handleUpdateResponsable}
      />
    </div>
  );
};

export default Usuarios;