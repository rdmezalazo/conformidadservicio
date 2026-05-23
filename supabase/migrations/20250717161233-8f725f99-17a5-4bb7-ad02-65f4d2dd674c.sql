
-- Primero, insertar las áreas que aparecen en la imagen si no existen
INSERT INTO areas (nombre, color, descripcion, activa) 
VALUES 
  ('TI', '#3B82F6', 'Tecnologías de la Información', true),
  ('Almacén', '#10B981', 'Gestión de Almacén', true),
  ('Calidad', '#F59E0B', 'Control de Calidad', true),
  ('Contabilidad', '#8B5CF6', 'Departamento de Contabilidad', true),
  ('Directorio', '#EF4444', 'Directorio Ejecutivo', true),
  ('Ingenieria', '#06B6D4', 'Departamento de Ingeniería', true),
  ('Logística', '#84CC16', 'Gestión Logística', true),
  ('Mantenimiento', '#F97316', 'Mantenimiento Industrial', true),
  ('Producción', '#EC4899', 'Área de Producción', true),
  ('Recursos Humanos', '#6366F1', 'Gestión de Recursos Humanos', true),
  ('Servicios', '#14B8A6', 'Servicios Generales', true),
  ('SIG', '#A855F7', 'Sistema Integrado de Gestión', true),
  ('SSOMA', '#DC2626', 'Seguridad, Salud Ocupacional y Medio Ambiente', true),
  ('Ventas', '#059669', 'Departamento de Ventas', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar todos los usuarios de la imagen
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 
  users.nombre_completo,
  users.email,
  COALESCE(users.puesto, 'Empleado'),
  areas.id as area_id,
  users.color_personal,
  true as activo
FROM (
  VALUES 
    ('Ronald Meza', 'supervisorti@livigui.com', 'Supervisor TI', 'TI', '#3B82F6'),
    ('Marco Chino', 'almacen2@livigui.com', 'Responsable de Almacén', 'Almacén', '#10B981'),
    ('Christopher Villanueva', 'controldecalidad@livigui.com', 'Control de Calidad', 'Calidad', '#F59E0B'),
    ('Marco Reyes', 'mreyes@livigui.com', 'Contador', 'Contabilidad', '#8B5CF6'),
    ('Nataly Arce', 'contabilidad1@livigui.com', 'Asistente Contable', 'Contabilidad', '#8B5CF6'),
    ('Henry Ancasi', 'contabilidad2@livigui.com', 'Asistente Contable', 'Contabilidad', '#8B5CF6'),
    ('Oscar Pizarro', 'opizarro@livigui.com', 'Director', 'Directorio', '#EF4444'),
    ('Jhon Churata', 'ingenieria2@livigui.com', 'Ingeniero', 'Ingenieria', '#06B6D4'),
    ('Andree Quintanilla Roca', 'asistentelogistica3@livigui.com', 'Asistente Logística', 'Logística', '#84CC16'),
    ('Maria Huerta', 'logistica@livigui.com', 'Jefe de Logística', 'Logística', '#84CC16'),
    ('Willy Ramos', 'mantenimiento@livigui.com', 'Técnico Mantenimiento', 'Mantenimiento', '#F97316'),
    ('Kenjho Ticona', 'mantenimiento@livigui.com', 'Técnico Mantenimiento', 'Mantenimiento', '#F97316'),
    ('Wladimir Villaverde Obregon', 'produccion6@livigui.com', 'Operador Producción', 'Producción', '#EC4899'),
    ('Kenjho Ticona', 'jefeproduccion@livigui.com', 'Jefe de Producción', 'Producción', '#EC4899'),
    ('Wiliams Lazo', 'jefeproduccion@livigui.com', 'Jefe de Producción', 'Producción', '#EC4899'),
    ('Alexander Molina', 'produccion4@livigui.com', 'Operador Producción', 'Producción', '#EC4899'),
    ('Jefe de Producción', 'jefeproduccion@livigui.com', 'Jefe de Producción', 'Producción', '#EC4899'),
    ('Sheyla Zurita', 'recursoshumanos@livigui.com', 'Jefe RRHH', 'Recursos Humanos', '#6366F1'),
    ('Elida Mamani', 'recursoshumanos@livigui.com', 'Asistente RRHH', 'Recursos Humanos', '#6366F1'),
    ('Gabriela Yaco', 'asistenterrhh@livigui.com', 'Asistente RRHH', 'Recursos Humanos', '#6366F1'),
    ('Renato Mendez', 'jefeservicios@livigui.com', 'Jefe de Servicios', 'Servicios', '#14B8A6'),
    ('Denitza Peña', 'sig@livigui.com', 'Responsable SIG', 'SIG', '#A855F7'),
    ('Leydi Carpio', 'ssoma2@livigui.com', 'Especialista SSOMA', 'SSOMA', '#DC2626'),
    ('Maciel Apaza', 'ssoma@livigui.com', 'Jefe SSOMA', 'SSOMA', '#DC2626'),
    ('Yamilet Narvaez', 'ssoma2@livigui.com', 'Especialista SSOMA', 'SSOMA', '#DC2626'),
    ('Andrea Anampa', 'administracionventa@livigui.com', 'Administrador Ventas', 'Ventas', '#059669'),
    ('Escarly Montalban', 'administracionventa2@livigui.com', 'Administrador Ventas', 'Ventas', '#059669'),
    ('Miguel Condori', 'jefeventas.sur@livigui.com', 'Jefe Ventas Sur', 'Ventas', '#059669')
) AS users(nombre_completo, email, puesto, area_nombre, color_personal)
LEFT JOIN areas ON areas.nombre = users.area_nombre
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal,
  updated_at = now();
