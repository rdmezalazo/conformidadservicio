import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conformidad } from '@/types/conformidad';
import { toast } from '@/hooks/use-toast';

export function useConformidades() {
  const [conformidades, setConformidades] = useState<Conformidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConformidades = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('conformidades_servicio')
        .select('*')
        .order('id_correlativo', { ascending: false });

      if (error) {
        console.error('Error fetching conformidades:', error);
        setError(error.message);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las conformidades',
          variant: 'destructive',
        });
      } else {
        setConformidades(data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('Error:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConformidad = useCallback(async (idCorrelativo: string) => {
    try {
      const { error } = await supabase
        .from('conformidades_servicio')
        .delete()
        .eq('id_correlativo', idCorrelativo);

      if (error) {
        console.error('Error deleting conformidad:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la conformidad',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Éxito',
        description: 'Conformidad eliminada correctamente',
      });

      // Actualizar la lista local
      setConformidades(prev => prev.filter(c => c.id_correlativo !== idCorrelativo));
      return true;
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const updateConformidad = useCallback(async (idCorrelativo: string, updates: Partial<Conformidad>) => {
    try {
      const { error } = await supabase
        .from('conformidades_servicio')
        .update(updates)
        .eq('id_correlativo', idCorrelativo);

      if (error) {
        console.error('Error updating conformidad:', error);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar la conformidad',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Éxito',
        description: 'Conformidad actualizada correctamente',
      });

      // Actualizar la lista local
      setConformidades(prev => 
        prev.map(c => 
          c.id_correlativo === idCorrelativo 
            ? { ...c, ...updates }
            : c
        )
      );
      return true;
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  useEffect(() => {
    fetchConformidades();
  }, [fetchConformidades]);

  return {
    conformidades,
    isLoading,
    error,
    fetchConformidades,
    deleteConformidad,
    updateConformidad,
    refresh: fetchConformidades,
  };
}