import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDefaultPDFTemplate() {
  const [defaultTemplate, setDefaultTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefaultTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from('pdf_templates')
          .select('*')
          .eq('is_default', true)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching default template:', error);
          setDefaultTemplate(null);
        } else {
          setDefaultTemplate(data);
        }
      } catch (error) {
        console.error('Error fetching default template:', error);
        setDefaultTemplate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultTemplate();
  }, []);

  const getTemplateData = () => {
    if (!defaultTemplate) return { layout: null, config: null };

    try {
      const layout = Array.isArray(defaultTemplate.layout_data) 
        ? defaultTemplate.layout_data 
        : JSON.parse(defaultTemplate.layout_data as string);
      
      const config = typeof defaultTemplate.pdf_config === 'object' 
        ? defaultTemplate.pdf_config 
        : JSON.parse(defaultTemplate.pdf_config as string);

      return { layout, config };
    } catch (error) {
      console.error('Error parsing template data:', error);
      return { layout: null, config: null };
    }
  };

  return {
    defaultTemplate,
    loading,
    getTemplateData,
  };
}