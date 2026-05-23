-- Actualizar registros que tienen id_correlativo vacío
UPDATE conformidades_servicio 
SET id_correlativo = 'CS-' || UPPER(LEFT(area, 3)) || '-' || LPAD(ROW_NUMBER() OVER (PARTITION BY area ORDER BY fecha_conformidad)::text, 4, '0')
WHERE id_correlativo = '' OR id_correlativo IS NULL;