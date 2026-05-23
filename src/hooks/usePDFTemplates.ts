import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface PDFTemplate {
  id: string;
  name: string;
  description?: string;
  layout_data: Json;
  pdf_config: Json;
  is_default: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function usePDFTemplates() {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<PDFTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      
      // Encontrar la plantilla por defecto
      const defaultTemp = data?.find(template => template.is_default) || null;
      setDefaultTemplate(defaultTemp);
    } catch (error) {
      console.error('Error fetching PDF templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (
    name: string,
    description: string,
    layoutData: any[],
    pdfConfig: any,
    setAsDefault = false
  ) => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .insert({
          name,
          description,
          layout_data: layoutData,
          pdf_config: pdfConfig,
          is_default: setAsDefault,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Plantilla PDF guardada correctamente",
      });

      // Recargar plantillas
      await fetchTemplates();
      
      return data;
    } catch (error) {
      console.error('Error saving PDF template:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<PDFTemplate>
  ) => {
    try {
      console.log('Updating template with ID:', id, 'Updates:', updates);
      
      const { data, error } = await supabase
        .from('pdf_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating template:', error);
        throw error;
      }

      console.log('Template updated successfully:', data);

      // Actualizar el estado local inmediatamente
      setTemplates(prev => prev.map(template => 
        template.id === id ? { ...template, ...data } : template
      ));

      // También actualizar defaultTemplate si es la plantilla por defecto
      if (data.is_default) {
        setDefaultTemplate(data);
      }

      toast({
        title: "Éxito",
        description: "Plantilla PDF actualizada correctamente",
      });

      // Recargar plantillas para asegurar consistencia
      await fetchTemplates();
      
      return data;
    } catch (error) {
      console.error('Error updating PDF template:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  const setAsDefaultTemplate = async (id: string) => {
    try {
      // Primero, desactivar todas las plantillas predeterminadas
      const { error: resetError } = await supabase
        .from('pdf_templates')
        .update({ is_default: false })
        .eq('is_active', true);

      if (resetError) throw resetError;

      // Luego, establecer la nueva plantilla como predeterminada
      const { error } = await supabase
        .from('pdf_templates')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Plantilla establecida como predeterminada",
      });

      // Recargar plantillas
      await fetchTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      toast({
        title: "Error",
        description: "No se pudo establecer como plantilla predeterminada",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pdf_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Plantilla eliminada correctamente",
      });

      // Recargar plantillas
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting PDF template:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    defaultTemplate,
    loading,
    saveTemplate,
    updateTemplate,
    setAsDefaultTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}