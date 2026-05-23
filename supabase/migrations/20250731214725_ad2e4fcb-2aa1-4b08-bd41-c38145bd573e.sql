-- Actualizar registros que tienen id_correlativo vacío usando un approach diferente
DO $$
DECLARE
    rec RECORD;
    new_correlativo TEXT;
BEGIN
    -- Recorrer cada registro que tiene id_correlativo vacío
    FOR rec IN 
        SELECT id_correlativo, area, fecha_conformidad 
        FROM conformidades_servicio 
        WHERE id_correlativo = '' OR id_correlativo IS NULL
        ORDER BY area, fecha_conformidad
    LOOP
        -- Generar el correlativo usando la función existente
        new_correlativo := generate_correlativo_by_area(rec.area);
        
        -- Actualizar solo este registro
        UPDATE conformidades_servicio 
        SET id_correlativo = new_correlativo
        WHERE id_correlativo = rec.id_correlativo 
           OR (id_correlativo IS NULL AND area = rec.area AND fecha_conformidad = rec.fecha_conformidad)
        LIMIT 1;
    END LOOP;
END $$;