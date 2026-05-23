import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UsuarioEmpresa {
  id: string;
  nombre_completo: string;
  email: string;
  puesto: string;
  area_id: string;
  activo: boolean;
  areas?: {
    id: string;
    nombre: string;
  };
}

export function useUsuariosEmpresa() {
  const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios_empresa')
          .select(`
            id,
            nombre_completo,
            email,
            puesto,
            area_id,
            activo,
            areas:area_id (
              id,
              nombre
            )
          `)
          .eq('activo', true)
          .order('nombre_completo');

        if (error) {
          console.error('Error fetching usuarios empresa:', error);
        } else {
          setUsuarios(data || []);
        }
      } catch (error) {
        console.error('Error fetching usuarios empresa:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return { usuarios, isLoading };
}