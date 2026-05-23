-- Crear tabla para áreas configurables
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icono_url TEXT,
  descripcion TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para usuarios de empresa
CREATE TABLE public.usuarios_empresa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  puesto TEXT NOT NULL,
  area_id UUID REFERENCES public.areas(id),
  color_personal TEXT NOT NULL DEFAULT '#6366F1',
  avatar_url TEXT,
  firma_url TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para configuración visual
CREATE TABLE public.configuracion_visual (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tema TEXT NOT NULL DEFAULT 'light', -- 'light' | 'dark'
  estilo_visual TEXT NOT NULL DEFAULT 'moderno', -- 'moderno' | 'corporativo' | 'minimalista'
  configuracion JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_visual ENABLE ROW LEVEL SECURITY;

-- Políticas para áreas (accesibles para todos los usuarios autenticados)
CREATE POLICY "Usuarios pueden ver áreas" 
ON public.areas 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Administradores pueden gestionar áreas" 
ON public.areas 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Políticas para usuarios_empresa (accesibles para todos los usuarios autenticados)
CREATE POLICY "Usuarios pueden ver usuarios de empresa" 
ON public.usuarios_empresa 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Administradores pueden gestionar usuarios de empresa" 
ON public.usuarios_empresa 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Políticas para configuración visual (cada usuario maneja su propia configuración)
CREATE POLICY "Usuarios pueden ver su configuración visual" 
ON public.configuracion_visual 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden crear su configuración visual" 
ON public.configuracion_visual 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su configuración visual" 
ON public.configuracion_visual 
FOR UPDATE 
USING (auth.uid() = usuario_id);

-- Triggers para updated_at
CREATE TRIGGER update_areas_updated_at
  BEFORE UPDATE ON public.areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuarios_empresa_updated_at
  BEFORE UPDATE ON public.usuarios_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracion_visual_updated_at
  BEFORE UPDATE ON public.configuracion_visual
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar áreas por defecto
INSERT INTO public.areas (nombre, color, descripcion) VALUES
  ('Logística', '#3B82F6', 'Área de logística y suministros'),
  ('Calidad', '#10B981', 'Área de control de calidad'),
  ('Producción', '#F59E0B', 'Área de producción'),
  ('Administración', '#8B5CF6', 'Área administrativa'),
  ('Ventas', '#EF4444', 'Área de ventas y comercialización');

-- Insertar estilos visuales por defecto (configuración global)
INSERT INTO public.configuracion_visual (usuario_id, tema, estilo_visual, configuracion) VALUES
  (null, 'light', 'moderno', '{
    "colores": {
      "primario": "hsl(220, 91%, 60%)",
      "secundario": "hsl(262, 83%, 67%)",
      "acento": "hsl(142, 76%, 46%)"
    },
    "fuentes": {
      "familia": "Inter",
      "peso": "400",
      "tamaños": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem"
      }
    }
  }')
ON CONFLICT (usuario_id) DO NOTHING;