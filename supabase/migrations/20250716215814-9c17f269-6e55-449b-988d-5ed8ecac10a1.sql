-- Crear un usuario de prueba directamente en la base de datos
-- Nota: Este es solo para propósitos de desarrollo/prueba

-- Insertar en auth.users (esto normalmente se hace a través de la API de auth)
-- Para producción, siempre usar el registro normal

-- Crear función para crear usuario de prueba
CREATE OR REPLACE FUNCTION create_test_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si ya existe el usuario de prueba
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@test.com'
  ) THEN
    -- Insertar usuario de prueba
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
      'admin@test.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      '',
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Usuario de prueba creado: admin@test.com / admin123';
  ELSE
    RAISE NOTICE 'El usuario de prueba ya existe';
  END IF;
END;
$$;

-- Ejecutar la función
SELECT create_test_user();