-- Corregir la función para generar ID correlativo basado en área
CREATE OR REPLACE FUNCTION public.generate_correlativo_by_area(area_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  correlativo TEXT;
  area_code TEXT;
  pattern TEXT;
BEGIN
  -- Generar código de área de 3 letras basado en el nombre
  CASE area_name
    WHEN 'Logística' THEN area_code := 'LOG';
    WHEN 'Producción' THEN area_code := 'PRO';
    WHEN 'Calidad' THEN area_code := 'CAL';
    WHEN 'Administración' THEN area_code := 'ADM';
    WHEN 'Ventas' THEN area_code := 'VEN';
    WHEN 'TI' THEN area_code := 'TI';
    WHEN 'Mantenimiento' THEN area_code := 'MAN';
    WHEN 'SSOMA' THEN area_code := 'SSO';
    WHEN 'Recursos Humanos' THEN area_code := 'RRH';
    WHEN 'Ingeniería' THEN area_code := 'ING';
    WHEN 'Contabilidad' THEN area_code := 'CON';
    WHEN 'SIG' THEN area_code := 'SIG';
    WHEN 'Directorio' THEN area_code := 'DIR';
    WHEN 'Servicios' THEN area_code := 'SER';
    WHEN 'Almacén' THEN area_code := 'ALM';
    ELSE area_code := 'GEN'; -- Código genérico para áreas no definidas
  END CASE;
  
  -- Construir el patrón a buscar
  pattern := 'CS-' || area_code || '-%';
  
  -- Obtener el siguiente número secuencial para esta área
  -- Extraer solo la parte numérica al final del id_correlativo
  SELECT COALESCE(
    MAX(
      CAST(
        RIGHT(id_correlativo, 4) AS INTEGER
      )
    ), 0
  ) + 1
  INTO next_number
  FROM public.conformidades_servicio
  WHERE id_correlativo LIKE pattern;
  
  -- Formatear con ceros a la izquierda (4 dígitos)
  correlativo := 'CS-' || area_code || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN correlativo;
END;
$$;