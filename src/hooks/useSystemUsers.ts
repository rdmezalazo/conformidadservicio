import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemUser {
  user_id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  user_role: 'admin' | 'supervisor' | 'evaluator' | 'usuario_responsable';
  created_at: string;
  last_sign_in_at: string | null;
}

interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
  role?: 'admin' | 'supervisor' | 'usuario_responsable';
}

export const useSystemUsers = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_users_with_roles');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('create_system_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_first_name: userData.first_name,
        user_last_name: userData.last_name,
        user_username: userData.username || null,
        user_role: userData.role || 'supervisor'
      });

      if (error) throw error;

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente"
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive"
      });
      return false;
    }
  };

  const addCompanyUserToSystem = async (email: string, password: string, role: 'admin' | 'supervisor' | 'usuario_responsable' = 'usuario_responsable'): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('add_company_user_to_system', {
        company_user_email: email,
        user_password: password,
        user_role: role
      });

      if (error) throw error;

      toast({
        title: "Usuario agregado",
        description: "El usuario de empresa ha sido agregado al sistema exitosamente"
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error adding company user to system:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el usuario al sistema",
        variant: "destructive"
      });
      return false;
    }
  };

  const deactivateUser = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('deactivate_system_user', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado exitosamente"
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo desactivar el usuario",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('delete_system_user', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente"
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive"
      });
      return false;
    }
  };

  const changeUserRole = async (userId: string, newRole: 'admin' | 'supervisor' | 'usuario_responsable', reason?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('change_user_role', {
        _user_id: userId,
        _new_role: newRole,
        _reason: reason || null
      });

      if (error) throw error;

      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente"
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error changing user role:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el rol del usuario",
        variant: "destructive"
      });
      return false;
    }
  };

  const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('reset_user_password', {
        target_user_id: userId,
        new_password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Contraseña restablecida",
        description: "La contraseña del usuario ha sido restablecida exitosamente"
      });

      return true;
    } catch (error: any) {
      console.error('Error resetting user password:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo reestablecer la contraseña del usuario",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    createUser,
    addCompanyUserToSystem,
    deactivateUser,
    deleteUser,
    changeUserRole,
    resetUserPassword,
    refetch: fetchUsers
  };
};