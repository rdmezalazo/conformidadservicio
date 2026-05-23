-- Insertar configuración de menús para el nuevo rol usuario_responsable
INSERT INTO public.role_menu_config (role, available_menus)
VALUES (
  'usuario_responsable',
  '[
    {"id": "dashboard", "name": "Dashboard", "url": "/", "icon": "Home"},
    {"id": "conformidades", "name": "Lista de Conformidades", "url": "/conformidades", "icon": "List"},
    {"id": "nueva-conformidad", "name": "Nueva Conformidad", "url": "/nueva-conformidad", "icon": "Plus"},
    {"id": "carga-masiva", "name": "Carga Masiva", "url": "/carga-masiva", "icon": "Upload"}
  ]'::jsonb
)
ON CONFLICT (role) DO UPDATE SET
  available_menus = EXCLUDED.available_menus,
  updated_at = now();

-- Agregar política para que usuarios responsables puedan ver todas las conformidades de su área
CREATE POLICY "Usuarios responsables pueden ver conformidades de su área"
ON public.conformidades_servicio
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'usuario_responsable'::user_role) 
  AND area = get_user_area_by_profile()
);

-- Permitir a usuarios responsables actualizar conformidades de su área
CREATE POLICY "Usuarios responsables pueden actualizar conformidades de su área"
ON public.conformidades_servicio
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'usuario_responsable'::user_role) 
  AND area = get_user_area_by_profile()
);

-- Permitir a usuarios responsables crear conformidades
CREATE POLICY "Usuarios responsables pueden crear conformidades"
ON public.conformidades_servicio
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'usuario_responsable'::user_role) 
  AND auth.uid() = usuario_id
);