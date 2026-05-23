-- Eliminar política existente restrictiva
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias conformidades" ON public.conformidades_servicio;

-- Crear políticas más granulares para conformidades
-- 1. Administradores pueden ver todas las conformidades
CREATE POLICY "Administradores pueden ver todas las conformidades" 
ON public.conformidades_servicio 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- 2. Supervisores pueden ver todas las conformidades  
CREATE POLICY "Supervisores pueden ver todas las conformidades" 
ON public.conformidades_servicio 
FOR SELECT 
USING (has_role(auth.uid(), 'supervisor'));

-- 3. Usuarios regulares pueden ver conformidades de su área
-- Primero necesitamos una función para obtener el área del usuario
CREATE OR REPLACE FUNCTION public.get_user_area()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ue.area_id::text
  FROM public.usuarios_empresa ue
  JOIN public.profiles p ON p.id = auth.uid()
  WHERE ue.email = p.first_name || '@' || 'test.com'
  LIMIT 1;
$$;

-- Función alternativa más robusta para obtener área por email del perfil
CREATE OR REPLACE FUNCTION public.get_user_area_by_profile()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER  
AS $$
  SELECT a.nombre
  FROM public.usuarios_empresa ue
  JOIN public.areas a ON a.id = ue.area_id
  JOIN auth.users au ON au.email = ue.email
  WHERE au.id = auth.uid()
  LIMIT 1;
$$;

-- 4. Política para usuarios regulares que ven conformidades de su área
CREATE POLICY "Usuarios pueden ver conformidades de su área" 
ON public.conformidades_servicio 
FOR SELECT 
USING (
  NOT has_role(auth.uid(), 'admin') 
  AND NOT has_role(auth.uid(), 'supervisor')
  AND area = get_user_area_by_profile()
);

-- 5. Usuarios pueden crear sus propias conformidades (mantener existente)
-- Esta política ya existe, solo verificamos que esté bien

-- 6. Política alternativa: usuarios pueden ver sus propias conformidades independientemente del área
CREATE POLICY "Usuarios pueden ver sus propias conformidades creadas" 
ON public.conformidades_servicio 
FOR SELECT 
USING (auth.uid() = usuario_id);