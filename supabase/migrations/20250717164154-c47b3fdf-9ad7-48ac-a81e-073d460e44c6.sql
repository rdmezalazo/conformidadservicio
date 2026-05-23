-- Create function to create system users
CREATE OR REPLACE FUNCTION public.create_system_user(
  user_email text,
  user_password text,
  user_first_name text,
  user_last_name text,
  user_username text DEFAULT NULL,
  user_role user_role DEFAULT 'evaluator'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  final_username text;
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo los administradores pueden crear usuarios del sistema';
  END IF;
  
  -- Validar formato de email
  IF NOT public.validate_email_format(user_email) THEN
    RAISE EXCEPTION 'Formato de email inválido';
  END IF;
  
  -- Verificar que el email no existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'Ya existe un usuario con este email';
  END IF;
  
  -- Generar username único si no se proporciona
  final_username := COALESCE(user_username, split_part(user_email, '@', 1));
  
  -- Crear usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'first_name', user_first_name,
      'last_name', user_last_name,
      'username', final_username
    ),
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;
  
  -- Asignar rol al usuario
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, user_role);
  
  RETURN new_user_id;
END;
$$;

-- Create function to deactivate system users
CREATE OR REPLACE FUNCTION public.deactivate_system_user(
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo los administradores pueden desactivar usuarios del sistema';
  END IF;
  
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- No permitir desactivar al propio usuario
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes desactivar tu propia cuenta';
  END IF;
  
  -- Marcar como eliminado (soft delete)
  UPDATE auth.users 
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = target_user_id
    AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Create function to delete system users
CREATE OR REPLACE FUNCTION public.delete_system_user(
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo los administradores pueden eliminar usuarios del sistema';
  END IF;
  
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- No permitir eliminar al propio usuario
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta';
  END IF;
  
  -- Eliminar datos relacionados primero (cascada manual para evitar problemas)
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Eliminar usuario de auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;