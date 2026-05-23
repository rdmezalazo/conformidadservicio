-- Actualizar la función create_system_user para manejar roles existentes
CREATE OR REPLACE FUNCTION public.create_system_user(
  user_email text, 
  user_password text, 
  user_first_name text, 
  user_last_name text, 
  user_username text DEFAULT NULL::text, 
  user_role user_role DEFAULT 'evaluator'::user_role
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
  
  -- Asignar rol específico, pero manejar el caso donde ya existe
  -- El trigger handle_new_user puede haber asignado el rol 'evaluator' por defecto
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Si el rol deseado es diferente al evaluator (que es el por defecto), 
  -- actualizar el rol existente
  IF user_role != 'evaluator' THEN
    UPDATE public.user_roles 
    SET role = user_role, created_at = NOW()
    WHERE user_id = new_user_id;
  END IF;
  
  RETURN new_user_id;
END;
$function$;