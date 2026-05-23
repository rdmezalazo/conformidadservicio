-- Eliminar el usuario restante deshabilitando temporalmente triggers
DO $$
DECLARE
  user_id_to_delete uuid;
BEGIN
  -- Buscar el usuario que queda
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
    
    -- Deshabilitar triggers temporalmente y eliminar usuario
    SET session_replication_role = 'replica';
    DELETE FROM auth.users WHERE id = user_id_to_delete;
    SET session_replication_role = 'origin';
    
    RAISE NOTICE 'Usuario asistentelogistica3@livigui.com eliminado exitosamente';
  ELSE
    RAISE NOTICE 'Usuario asistentelogistica3@livigui.com no encontrado';
  END IF;
END $$;