-- Verificar estructura de conformidades_servicio y arreglar trigger si es necesario
DO $$
BEGIN
  -- Verificar si la tabla conformidades_servicio tiene el campo updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conformidades_servicio' 
    AND column_name = 'updated_at'
    AND table_schema = 'public'
  ) THEN
    -- Si no existe updated_at, agregar la columna
    ALTER TABLE public.conformidades_servicio 
    ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    
    RAISE NOTICE 'Columna updated_at agregada a conformidades_servicio';
  END IF;
  
  -- Ahora eliminar el usuario problemático
  DECLARE
    user_id_to_delete uuid;
  BEGIN
    SELECT id INTO user_id_to_delete
    FROM auth.users
    WHERE email = 'asistentelogistica3@livigui.com'
    AND deleted_at IS NULL;
    
    IF FOUND THEN
      -- Desasociar de conformidades_servicio
      UPDATE public.conformidades_servicio 
      SET usuario_id = NULL
      WHERE usuario_id = user_id_to_delete;
      
      -- Eliminar registros relacionados
      DELETE FROM public.user_roles WHERE user_id = user_id_to_delete;
      DELETE FROM public.profiles WHERE id = user_id_to_delete;
      DELETE FROM public.role_change_logs WHERE user_id = user_id_to_delete OR changed_by = user_id_to_delete;
      
      -- Eliminar usuario
      DELETE FROM auth.users WHERE id = user_id_to_delete;
      
      RAISE NOTICE 'Usuario asistentelogistica3@livigui.com eliminado exitosamente de autenticación';
    ELSE
      RAISE NOTICE 'Usuario asistentelogistica3@livigui.com no encontrado';
    END IF;
  END;
END $$;