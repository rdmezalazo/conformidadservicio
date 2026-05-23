-- Actualizar el usuario Pamela Calcina para que sea Melissa Pari
UPDATE auth.users 
SET 
  encrypted_password = crypt('mpari2025', gen_salt('bf')),
  updated_at = NOW(),
  raw_user_meta_data = jsonb_build_object(
    'first_name', 'Melissa',
    'last_name', 'Pari',
    'username', 'melissa.pari'
  )
WHERE id = '8411c0d6-b9a5-4a1e-8195-80e2588dc1f4'::uuid;

-- Actualizar el perfil del usuario
UPDATE public.profiles 
SET 
  username = 'melissa.pari',
  first_name = 'Melissa',
  last_name = 'Pari',
  updated_at = NOW()
WHERE id = '8411c0d6-b9a5-4a1e-8195-80e2588dc1f4'::uuid;