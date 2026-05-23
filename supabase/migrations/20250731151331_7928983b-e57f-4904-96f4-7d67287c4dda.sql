-- Investigar y eliminar todos los triggers problemáticos en conformidades_servicio
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  -- Buscar todos los triggers en la tabla conformidades_servicio
  FOR trigger_rec IN 
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_table = 'conformidades_servicio'
    AND event_object_schema = 'public'
  LOOP
    -- Eliminar cada trigger encontrado
    EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.trigger_name || ' ON public.conformidades_servicio';
    RAISE NOTICE 'Trigger eliminado: %', trigger_rec.trigger_name;
  END LOOP;
  
  -- Verificar que no queden triggers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'conformidades_servicio'
    AND event_object_schema = 'public'
  ) THEN
    RAISE NOTICE 'Todos los triggers eliminados de conformidades_servicio';
  END IF;
END $$;