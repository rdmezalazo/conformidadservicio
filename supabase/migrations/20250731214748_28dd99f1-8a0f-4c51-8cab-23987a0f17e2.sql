-- Actualizar registros con id_correlativo vacío de forma simple
UPDATE conformidades_servicio 
SET id_correlativo = 'CS-REP-0001'
WHERE id_correlativo = '' OR id_correlativo IS NULL;