-- Insertar áreas automáticamente basándose en las conformidades existentes
INSERT INTO areas (nombre, color, descripcion, activa)
SELECT DISTINCT 
  area as nombre,
  -- Asignar colores aleatorios pero consistentes usando hash
  CASE 
    WHEN area = 'Almacén' THEN '#8B5CF6'
    WHEN area = 'Calidad' THEN '#10B981'
    WHEN area = 'Contabilidad' THEN '#F59E0B'
    WHEN area = 'Directorio' THEN '#EF4444'
    WHEN area = 'Ingeniería' THEN '#3B82F6'
    WHEN area = 'Logística' THEN '#6366F1'
    WHEN area = 'Mantenimiento' THEN '#84CC16'
    WHEN area = 'Producción' THEN '#F97316'
    WHEN area = 'Recursos Humanos' THEN '#EC4899'
    WHEN area = 'Servicios' THEN '#06B6D4'
    WHEN area = 'SIG' THEN '#8B5CF6'
    WHEN area = 'SSOMA' THEN '#DC2626'
    WHEN area = 'TI' THEN '#6B7280'
    WHEN area = 'Ventas' THEN '#059669'
    ELSE '#3B82F6'
  END as color,
  'Área de ' || area as descripcion,
  true as activa
FROM conformidades_servicio 
WHERE area NOT IN (SELECT nombre FROM areas)
ON CONFLICT (nombre) DO NOTHING;