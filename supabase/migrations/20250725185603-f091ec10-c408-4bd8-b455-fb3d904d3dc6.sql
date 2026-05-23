-- Eliminar la política existente que limita a usuarios responsables a ver solo su área
DROP POLICY IF EXISTS "Usuarios responsables pueden ver conformidades de su área" ON public.conformidades_servicio;

-- Crear nueva política para usuarios responsables del área de Logística (pueden ver todas las conformidades)
CREATE POLICY "Usuarios de Logística pueden ver todas las conformidades" 
ON public.conformidades_servicio 
FOR SELECT 
USING (
  has_role(auth.uid(), 'usuario_responsable'::user_role) 
  AND get_user_area_by_profile() = 'Logística'
);

-- Crear nueva política para usuarios responsables de otras áreas (solo pueden ver las de su área)
CREATE POLICY "Usuarios responsables no-Logística pueden ver conformidades de su área" 
ON public.conformidades_servicio 
FOR SELECT 
USING (
  has_role(auth.uid(), 'usuario_responsable'::user_role) 
  AND get_user_area_by_profile() != 'Logística'
  AND area = get_user_area_by_profile()
);