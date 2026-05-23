-- Primero, arreglar el problema del trigger en conformidades_servicio
-- Agregar la columna updated_at que falta o eliminar el trigger
DO $$
BEGIN
  -- Verificar si existe un trigger problemático en conformidades_servicio
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'conformidades_servicio'
    AND trigger_name LIKE '%updated_at%'
  ) THEN
    -- Eliminar el trigger problemático si la tabla no tiene updated_at
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'conformidades_servicio' 
      AND column_name = 'updated_at'
      AND table_schema = 'public'
    ) THEN
      DROP TRIGGER IF EXISTS update_conformidades_servicio_updated_at ON public.conformidades_servicio;
      RAISE NOTICE 'Trigger problemático eliminado de conformidades_servicio';
    END IF;
  END IF;
END $$;