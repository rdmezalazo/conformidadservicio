import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserArea() {
  const [userArea, setUserArea] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUserArea() {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        // Buscar el usuario en la tabla usuarios_empresa por email
        const { data: usuarioEmpresa, error } = await supabase
          .from('usuarios_empresa')
          .select(`
            area_id,
            areas (
              nombre
            )
          `)
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error fetching user area:', error);
          setUserArea(null);
        } else if (usuarioEmpresa?.areas) {
          setUserArea((usuarioEmpresa.areas as any).nombre);
        } else {
          setUserArea(null);
        }
      } catch (error) {
        console.error('Error:', error);
        setUserArea(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserArea();
  }, [user?.email]);

  return { userArea, isLoading };
}