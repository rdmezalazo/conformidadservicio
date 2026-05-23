-- Crear tabla para conformidades de servicio
CREATE TABLE public.conformidades_servicio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_correlativo TEXT NOT NULL UNIQUE,
  ruc TEXT NOT NULL,
  proveedor TEXT NOT NULL,
  nro_factura TEXT NOT NULL,
  nro_centro_costo TEXT NOT NULL,
  nro_orden_servicio INTEGER NOT NULL,
  nro_of TEXT NOT NULL,
  solicitante TEXT NOT NULL,
  fecha_conformidad DATE NOT NULL,
  descripcion_servicio TEXT NOT NULL,
  conformidad BOOLEAN NOT NULL DEFAULT false,
  observaciones TEXT,
  responsable TEXT NOT NULL,
  area TEXT NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conformidades_servicio ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuarios pueden ver sus propias conformidades" 
ON public.conformidades_servicio 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden crear conformidades" 
ON public.conformidades_servicio 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus conformidades" 
ON public.conformidades_servicio 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus conformidades" 
ON public.conformidades_servicio 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Función para generar ID correlativo automático
CREATE OR REPLACE FUNCTION public.generate_correlativo_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  correlativo TEXT;
BEGIN
  -- Obtener el siguiente número secuencial
  SELECT COALESCE(MAX(CAST(SUBSTRING(id_correlativo FROM 8) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.conformidades_servicio
  WHERE id_correlativo LIKE 'CS-LOG-%';
  
  -- Formatear con ceros a la izquierda (4 dígitos)
  correlativo := 'CS-LOG-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN correlativo;
END;
$$;

-- Trigger para auto-generar ID correlativo
CREATE OR REPLACE FUNCTION public.set_correlativo_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id_correlativo IS NULL OR NEW.id_correlativo = '' THEN
    NEW.id_correlativo := public.generate_correlativo_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_correlativo_id
  BEFORE INSERT ON public.conformidades_servicio
  FOR EACH ROW
  EXECUTE FUNCTION public.set_correlativo_id();

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_conformidades_updated_at
  BEFORE UPDATE ON public.conformidades_servicio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();