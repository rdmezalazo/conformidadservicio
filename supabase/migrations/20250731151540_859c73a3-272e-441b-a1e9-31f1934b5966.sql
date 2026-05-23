-- Finalmente eliminar el usuario sin problemas de triggers
DO $$
DECLARE
  user_id_to_delete uuid;
  dummy_user_id uuid;
BEGIN
  -- Buscar el usuario a eliminar
  SELECT id INTO user_id_to_delete
  FROM auth.users
  WHERE email = 'asistentelogistica3@livigui.com'
  AND deleted_at IS NULL;
  
  IF FOUND THEN
    RAISE NOTICE 'Usuario encontrado con ID: %', user_id_to_delete;
    
    -- Buscar un usuario admin/supervisor para transferir registros
    SELECT id INTO dummy_user_id
    FROM auth.users
    WHERE (email LIKE '%admin%' OR email LIKE '%supervisor%')
    AND deleted_at IS NULL
    AND id != user_id_to_delete
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Si no hay admin/supervisor, usar cualquier otro usuario
    IF NOT FOUND THEN
      SELECT id INTO dummy_user_id
      FROM auth.users
      WHERE deleted_at IS NULL
      AND id != user_id_to_delete
      ORDER BY created_at ASC
      LIMIT 1;
    END IF;
    
    IF FOUND THEN
      -- Transferir conformidades al usuario dummy
      UPDATE public.conformidades_servicio 
      SET usuario_id = dummy_user_id
      WHERE usuario_id = user_id_to_delete;
      
      RAISE NOTICE 'Conformidades transferidas al usuario: %', dummy_user_id;
    ELSE
      -- Si no hay otros usuarios, permitir NULL en usuario_id
      ALTER TABLE public.conformidades_servicio ALTER COLUMN usuario_id DROP NOT NULL;
      
      UPDATE public.conformidades_servicio 
      SET usuario_id = NULL
      WHERE usuario_id = user_id_to_delete;
      
      RAISE NOTICE 'Conformidades desasociadas (usuario_id = NULL)';
    END IF;
    
    -- Limpiar tablas relacionadas
    DELETE FROM public.user_roles WHERE user_id = user_id_to_delete;
    DELETE FROM public.profiles WHERE id = user_id_to_delete;
    DELETE FROM public.role_change_logs WHERE user_id = user_id_to_delete OR changed_by = user_id_to_delete;
    
    -- Eliminar usuario de autenticación
    DELETE FROM auth.users WHERE id = user_id_to_delete;
    
    -- Verificar eliminación
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'asistentelogistica3@livigui.com' AND deleted_at IS NULL) THEN
      RAISE NOTICE 'ÉXITO: Usuario asistentelogistica3@livigui.com eliminado de autenticación';
    ELSE
      RAISE NOTICE 'ERROR: No se pudo eliminar el usuario';
    END IF;
  ELSE
    RAISE NOTICE 'Usuario asistentelogistica3@livigui.com no encontrado en auth.users';
  END IF;
END $$;