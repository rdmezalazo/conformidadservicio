-- Corregir la función create_system_user para manejar usuarios existentes
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
  existing_user_id uuid;
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
  
  -- Verificar si el usuario ya existe en auth.users
  SELECT id INTO existing_user_id
  FROM auth.users 
  WHERE email = user_email 
    AND deleted_at IS NULL;
  
  -- Si el usuario ya existe, actualizar su información y rol
  IF existing_user_id IS NOT NULL THEN
    -- Generar username único si no se proporciona
    final_username := COALESCE(user_username, split_part(user_email, '@', 1));
    
    -- Actualizar contraseña del usuario existente
    UPDATE auth.users 
    SET encrypted_password = crypt(user_password, gen_salt('bf')),
        updated_at = NOW(),
        raw_user_meta_data = jsonb_build_object(
          'first_name', user_first_name,
          'last_name', user_last_name,
          'username', final_username
        )
    WHERE id = existing_user_id;
    
    -- Actualizar o insertar perfil
    INSERT INTO public.profiles (id, username, first_name, last_name)
    VALUES (existing_user_id, final_username, user_first_name, user_last_name)
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW();
    
    -- Actualizar rol del usuario (eliminar rol anterior e insertar nuevo)
    DELETE FROM public.user_roles WHERE user_id = existing_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (existing_user_id, user_role);
    
    RETURN existing_user_id;
  END IF;
  
  -- Si el usuario no existe, crearlo como antes
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
  
  -- Asignar rol específico, eliminando cualquier rol previo
  DELETE FROM public.user_roles WHERE user_id = new_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, user_role);
  
  RETURN new_user_id;
END;
$function$;

-- Crear función para añadir usuarios empresa existentes al sistema
CREATE OR REPLACE FUNCTION public.add_company_user_to_system(
  company_user_email text,
  user_password text,
  user_role user_role DEFAULT 'usuario_responsable'::user_role
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_user_id uuid;
  company_user_record RECORD;
  final_username text;
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo los administradores pueden agregar usuarios de empresa al sistema';
  END IF;
  
  -- Obtener información del usuario de empresa
  SELECT * INTO company_user_record
  FROM public.usuarios_empresa
  WHERE email = company_user_email AND activo = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario de empresa no encontrado o inactivo';
  END IF;
  
  -- Verificar si ya existe en auth.users
  SELECT id INTO existing_user_id
  FROM auth.users 
  WHERE email = company_user_email 
    AND deleted_at IS NULL;
  
  -- Extraer nombre y apellido del nombre completo
  final_username := split_part(company_user_email, '@', 1);
  
  -- Si ya existe, solo actualizar rol y contraseña
  IF existing_user_id IS NOT NULL THEN
    -- Actualizar contraseña
    UPDATE auth.users 
    SET encrypted_password = crypt(user_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = existing_user_id;
    
    -- Actualizar o insertar perfil usando información de empresa
    INSERT INTO public.profiles (id, username, first_name, last_name)
    VALUES (
      existing_user_id, 
      final_username, 
      split_part(company_user_record.nombre_completo, ' ', 1),
      CASE 
        WHEN array_length(string_to_array(company_user_record.nombre_completo, ' '), 1) > 1 
        THEN array_to_string(
          (string_to_array(company_user_record.nombre_completo, ' '))[2:], ' '
        )
        ELSE ''
      END
    )
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW();
    
    -- Actualizar rol (eliminar anterior e insertar nuevo)
    DELETE FROM public.user_roles WHERE user_id = existing_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (existing_user_id, user_role);
    
    RETURN existing_user_id;
  END IF;
  
  -- Crear nuevo usuario
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
    company_user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'first_name', split_part(company_user_record.nombre_completo, ' ', 1),
      'last_name', CASE 
        WHEN array_length(string_to_array(company_user_record.nombre_completo, ' '), 1) > 1 
        THEN array_to_string(
          (string_to_array(company_user_record.nombre_completo, ' '))[2:], ' '
        )
        ELSE ''
      END,
      'username', final_username
    ),
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO existing_user_id;
  
  -- Asignar rol
  INSERT INTO public.user_roles (user_id, role)
  VALUES (existing_user_id, user_role);
  
  RETURN existing_user_id;
END;
$function$;