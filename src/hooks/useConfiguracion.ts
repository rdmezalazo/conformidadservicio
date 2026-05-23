import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Area, UsuarioEmpresa, ConfiguracionVisual } from '@/types/configuracion';

export const useAreas = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('activa', true)
        .order('nombre');

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las áreas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createArea = async (area: Omit<Area, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .insert([area])
        .select()
        .single();

      if (error) throw error;
      setAreas(prev => [...prev, data]);
      toast({
        title: "Éxito",
        description: "Área creada correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error creating area:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el área",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateArea = async (id: string, updates: Partial<Area>) => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAreas(prev => prev.map(area => area.id === id ? data : area));
      toast({
        title: "Éxito",
        description: "Área actualizada correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error updating area:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el área",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteArea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('areas')
        .update({ activa: false })
        .eq('id', id);

      if (error) throw error;
      setAreas(prev => prev.filter(area => area.id !== id));
      toast({
        title: "Éxito",
        description: "Área eliminada correctamente"
      });
    } catch (error) {
      console.error('Error deleting area:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el área",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return {
    areas,
    loading,
    createArea,
    updateArea,
    deleteArea,
    refetch: fetchAreas
  };
};

export const useUsuariosEmpresa = () => {
  const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_empresa')
        .select(`
          *,
          area:areas(*)
        `)
        .eq('activo', true)
        .order('nombre_completo');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (usuario: Omit<UsuarioEmpresa, 'id' | 'created_at' | 'updated_at' | 'area'>) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_empresa')
        .insert([usuario])
        .select(`
          *,
          area:areas(*)
        `)
        .single();

      if (error) throw error;
      setUsuarios(prev => [...prev, data]);
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error creating usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUsuario = async (id: string, updates: Partial<UsuarioEmpresa>) => {
    try {
      // Obtener el usuario actual para comparar email
      const currentUser = usuarios.find(u => u.id === id);
      
      // Crear una copia de updates
      const finalUpdates = { ...updates };
      
      // Solo incluir email si es diferente al actual para evitar error de restricción única
      if (currentUser && updates.email && updates.email === currentUser.email) {
        delete finalUpdates.email;
      }

      const { data, error } = await supabase
        .from('usuarios_empresa')
        .update(finalUpdates)
        .eq('id', id)
        .select(`
          *,
          area:areas(*)
        `)
        .single();

      if (error) throw error;
      setUsuarios(prev => prev.map(usuario => usuario.id === id ? data : usuario));
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error updating usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteUsuario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('usuarios_empresa')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
      setUsuarios(prev => prev.filter(usuario => usuario.id !== id));
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
      throw error;
    }
  };

  const importarResponsables = async () => {
    try {
      // Verificar que el usuario está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener responsables únicos de conformidades del usuario actual
      const { data: conformidades, error: conformidadesError } = await supabase
        .from('conformidades_servicio')
        .select('responsable')
        .eq('usuario_id', user.id)  // Solo conformidades del usuario actual
        .not('responsable', 'is', null)
        .not('responsable', 'eq', '');

      if (conformidadesError) throw conformidadesError;

      // Extraer nombres únicos
      const responsablesUnicos = [...new Set(conformidades?.map(c => c.responsable.trim()) || [])];

      if (responsablesUnicos.length === 0) {
        toast({
          title: "Info",
          description: "No se encontraron responsables en tus conformidades"
        });
        return;
      }

      // Obtener usuarios existentes para evitar duplicados
      const { data: usuariosExistentes, error: usuariosError } = await supabase
        .from('usuarios_empresa')
        .select('nombre_completo, email')
        .eq('activo', true);

      if (usuariosError) throw usuariosError;

      const nombresExistentes = new Set(usuariosExistentes?.map(u => u.nombre_completo.toLowerCase()) || []);
      
      // Filtrar responsables que no existen
      const responsablesNuevos = responsablesUnicos.filter(nombre => 
        !nombresExistentes.has(nombre.toLowerCase())
      );

      if (responsablesNuevos.length === 0) {
        toast({
          title: "Info",
          description: "Todos los responsables ya están registrados como usuarios"
        });
        return;
      }

      // Crear usuarios nuevos con datos válidos
      const nuevosUsuarios = responsablesNuevos.map(nombre => ({
        nombre_completo: nombre,
        email: `${nombre.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        puesto: 'Responsable (Importado)',
        color_personal: '#6366F1',
        activo: true,
        area_id: null,
        avatar_url: null,
        firma_url: null
      }));

      const { data: usuariosCreados, error: createError } = await supabase
        .from('usuarios_empresa')
        .insert(nuevosUsuarios)
        .select(`
          *,
          area:areas(*)
        `);

      if (createError) {
        console.error('Error creating users:', createError);
        throw createError;
      }

      // Actualizar estado local
      setUsuarios(prev => [...prev, ...(usuariosCreados || [])]);

      toast({
        title: "Éxito",
        description: `Se importaron ${nuevosUsuarios.length} responsables como usuarios`
      });

      return usuariosCreados;
    } catch (error) {
      console.error('Error importing responsables:', error);
      toast({
        title: "Error",
        description: "No se pudieron importar los responsables",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    importarResponsables,
    refetch: fetchUsuarios
  };
};

export const useConfiguracionVisual = () => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionVisual | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguracion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('configuracion_visual')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setConfiguracion(data as ConfiguracionVisual);
    } catch (error) {
      console.error('Error fetching configuracion:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración visual",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (updates: Partial<ConfiguracionVisual>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuario no autenticado');

      // Asegurar valores por defecto para evitar violaciones de NOT NULL
      const configData = {
        usuario_id: user.id,
        tema: updates.tema || 'light',
        estilo_visual: updates.estilo_visual || 'moderno',
        configuracion: updates.configuracion || {},
        ...updates
      };

      const { data, error } = await supabase
        .from('configuracion_visual')
        .upsert([configData], { 
          onConflict: 'usuario_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setConfiguracion(data as ConfiguracionVisual);
      
      // Aplicar configuración a la aplicación
      applyConfigurationToApp(data as ConfiguracionVisual);
      
      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error updating configuracion:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
      throw error;
    }
  };

  const applyConfigurationToApp = (config: ConfiguracionVisual) => {
    if (!config) return;

    const root = document.documentElement;
    
    // Aplicar tema
    if (config.tema === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Aplicar colores del estilo visual con prioridad sobre los temas
    if (config.configuracion && typeof config.configuracion === 'object') {
      const configuracion = config.configuracion as any;
      
      if (configuracion.colores) {
        // Convertir colores HSL y aplicarlos
        const convertHslToVar = (hslColor: string) => {
          const values = hslColor.replace('hsl(', '').replace(')', '').split(',');
          return values.map(v => v.trim()).join(' ');
        };

        // Aplicar colores personalizados con !important para sobrescribir los del tema
        if (configuracion.colores.primario) {
          const primaryValue = convertHslToVar(configuracion.colores.primario);
          root.style.setProperty('--primary', primaryValue, 'important');
        }
        if (configuracion.colores.secundario) {
          const secondaryValue = convertHslToVar(configuracion.colores.secundario);
          root.style.setProperty('--secondary', secondaryValue, 'important');
        }
        if (configuracion.colores.acento) {
          const accentValue = convertHslToVar(configuracion.colores.acento);
          root.style.setProperty('--accent', accentValue, 'important');
        }
      }

      if (configuracion.fuentes?.familia) {
        root.style.setProperty('--font-family', configuracion.fuentes.familia);
        document.body.style.fontFamily = configuracion.fuentes.familia;
      }
    }
  };

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  return {
    configuracion,
    loading,
    updateConfiguracion,
    refetch: fetchConfiguracion
  };
};