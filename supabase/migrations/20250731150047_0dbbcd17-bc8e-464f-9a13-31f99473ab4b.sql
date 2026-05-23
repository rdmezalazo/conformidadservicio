-- Función para eliminar usuarios específicos de autenticación sin verificación de rol
CREATE OR REPLACE FUNCTION public.force_delete_auth_users(user_emails text[])
RETURNS TABLE(email text, deleted boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_email text;
  user_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  -- Procesar cada email sin verificación de roles (función administrativa)
  FOREACH user_email IN ARRAY user_emails
  LOOP
    -- Buscar el usuario en auth.users
    SELECT id INTO user_record
    FROM auth.users
    WHERE auth.users.email = user_email
    AND deleted_at IS NULL;
    
    IF FOUND THEN
      BEGIN
        -- Actualizar conformidades_servicio para desasociar el usuario
        -- Cambiar usuario_id a NULL para registros de este usuario
        UPDATE public.conformidades_servicio 
        SET usuario_id = NULL
        WHERE usuario_id = user_record.id;
        
        -- Eliminar registros relacionados del usuario en tablas públicas
        DELETE FROM public.user_roles WHERE user_id = user_record.id;
        DELETE FROM public.profiles WHERE id = user_record.id;
        DELETE FROM public.role_change_logs WHERE user_id = user_record.id OR changed_by = user_record.id;
        
        -- Eliminar usuario de auth.users
        DELETE FROM auth.users WHERE id = user_record.id;
        
        -- Verificar si se eliminó
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = user_email AND deleted_at IS NULL) THEN
          email := user_email;
          deleted := true;
          reason := 'Usuario eliminado exitosamente de autenticación';
          deleted_count := deleted_count + 1;
          RETURN NEXT;
        ELSE
          email := user_email;
          deleted := false;
          reason := 'Error: Usuario no se pudo eliminar';
          RETURN NEXT;
        END IF;
        
      EXCEPTION WHEN OTHERS THEN
        email := user_email;
        deleted := false;
        reason := 'Error: ' || SQLERRM;
        RETURN NEXT;
      END;
    ELSE
      email := user_email;
      deleted := false;
      reason := 'Usuario no encontrado en autenticación';
      RETURN NEXT;
    END IF;
  END LOOP;
  
  -- Log de la operación
  RAISE NOTICE 'Eliminados % usuarios de autenticación', deleted_count;
  
  RETURN;
END;
$function$;

-- Ejecutar la función para eliminar los usuarios específicos
SELECT * FROM public.force_delete_auth_users(
  ARRAY['asistentelogistica3@livigui.com', 'asistentelogistica@livigui.com']
);