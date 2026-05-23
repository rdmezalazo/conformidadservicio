-- Agregar el nuevo rol 'usuario_responsable' al enum existente
ALTER TYPE public.user_role ADD VALUE 'usuario_responsable';

-- Actualizar la función get_allowed_menus_for_role para incluir permisos para el nuevo rol
-- Los usuarios responsables tendrán permisos similares a los supervisores pero más limitados

-- Insertar configuración de menús para el nuevo rol
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

-- Actualizar políticas RLS para incluir al usuario responsable en algunas operaciones
-- Los usuarios responsables pueden ver conformidades de su área (similar a evaluadores pero con más permisos)

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