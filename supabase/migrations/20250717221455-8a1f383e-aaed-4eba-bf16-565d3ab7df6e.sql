-- Función para reestablecer contraseña de usuario
CREATE OR REPLACE FUNCTION public.reset_user_password(
    target_user_id uuid, 
    new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario actual es admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Solo los administradores pueden reestablecer contraseñas';
    END IF;
    
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;
    
    -- No permitir cambiar la contraseña del propio usuario (debe usar cambio normal)
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'No puedes cambiar tu propia contraseña desde esta función';
    END IF;
    
    -- Actualizar la contraseña
    UPDATE auth.users 
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = target_user_id;
    
    RETURN FOUND;
END;
$$;