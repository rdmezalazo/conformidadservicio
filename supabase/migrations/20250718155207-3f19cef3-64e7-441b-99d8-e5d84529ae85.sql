-- Crear tabla para plantillas PDF de conformidades
CREATE TABLE public.pdf_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  layout_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  pdf_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Administradores pueden gestionar plantillas PDF"
ON public.pdf_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Usuarios pueden ver plantillas PDF activas"
ON public.pdf_templates
FOR SELECT
USING (is_active = true AND auth.role() = 'authenticated');

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_pdf_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para timestamps
CREATE TRIGGER update_pdf_templates_updated_at
BEFORE UPDATE ON public.pdf_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_pdf_templates_updated_at();

-- Función para asegurar que solo una plantilla sea por defecto
CREATE OR REPLACE FUNCTION public.ensure_single_default_pdf_template()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se está marcando como plantilla por defecto
  IF NEW.is_default = true THEN
    -- Desmarcar todas las otras plantillas como por defecto
    UPDATE public.pdf_templates 
    SET is_default = false 
    WHERE id != NEW.id AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asegurar una sola plantilla por defecto
CREATE TRIGGER ensure_single_default_pdf_template
BEFORE INSERT OR UPDATE ON public.pdf_templates
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_pdf_template();