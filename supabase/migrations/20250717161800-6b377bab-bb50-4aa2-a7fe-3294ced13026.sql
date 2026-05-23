
-- Primero, insertar las áreas que aparecen en la imagen si no existen
INSERT INTO areas (nombre, color, descripcion, activa) 
VALUES 
  ('TI', '#3B82F6', 'Tecnologías de la Información', true),
  ('Almacén', '#10B981', 'Gestión de Almacén', true),
  ('Calidad', '#F59E0B', 'Control de Calidad', true),
  ('Contabilidad', '#8B5CF6', 'Departamento de Contabilidad', true),
  ('Directorio', '#EF4444', 'Directorio Ejecutivo', true),
  ('Ingeniería', '#06B6D4', 'Departamento de Ingeniería', true),
  ('Logística', '#84CC16', 'Gestión Logística', true),
  ('Mantenimiento', '#F97316', 'Mantenimiento Industrial', true),
  ('Producción', '#EC4899', 'Área de Producción', true),
  ('Recursos Humanos', '#6366F1', 'Gestión de Recursos Humanos', true),
  ('Servicios', '#14B8A6', 'Servicios Generales', true),
  ('SIG', '#A855F7', 'Sistema Integrado de Gestión', true),
  ('SSOMA', '#DC2626', 'Seguridad, Salud Ocupacional y Medio Ambiente', true),
  ('Ventas', '#059669', 'Departamento de Ventas', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar usuarios uno por uno para mejor manejo de errores
-- Ronald Meza - TI
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Ronald Meza', 'supervisorti@livigui.com', 'Supervisor TI', a.id, '#3B82F6', true
FROM areas a WHERE a.nombre = 'TI'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Marco Chino - Almacén
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Marco Chino', 'almacen2@livigui.com', 'Responsable de Almacén', a.id, '#10B981', true
FROM areas a WHERE a.nombre = 'Almacén'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Christopher Villanueva - Calidad
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Christopher Villanueva', 'controldecalidad@livigui.com', 'Control de Calidad', a.id, '#F59E0B', true
FROM areas a WHERE a.nombre = 'Calidad'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Marco Reyes - Contabilidad
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Marco Reyes', 'mreyes@livigui.com', 'Contador', a.id, '#8B5CF6', true
FROM areas a WHERE a.nombre = 'Contabilidad'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Nataly Arce - Contabilidad
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Nataly Arce', 'contabilidad1@livigui.com', 'Asistente Contable', a.id, '#8B5CF6', true
FROM areas a WHERE a.nombre = 'Contabilidad'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Henrry Ancasi - Contabilidad
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Henrry Ancasi', 'contabilidad2@livigui.com', 'Asistente Contable', a.id, '#8B5CF6', true
FROM areas a WHERE a.nombre = 'Contabilidad'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Oscar Pizarro - Directorio
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Oscar Pizarro', 'opizarro@livigui.com', 'Director', a.id, '#EF4444', true
FROM areas a WHERE a.nombre = 'Directorio'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Jhon Churata - Ingeniería
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Jhon Churata', 'ingenieria2@livigui.com', 'Ingeniero', a.id, '#06B6D4', true
FROM areas a WHERE a.nombre = 'Ingeniería'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Andree Quintanilla Roca - Logística
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Andree Quintanilla Roca', 'asistentelogistica3@livigui.com', 'Asistente Logística', a.id, '#84CC16', true
FROM areas a WHERE a.nombre = 'Logística'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Maria Huerta - Logística
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Maria Huerta', 'logistica@livigui.com', 'Jefe de Logística', a.id, '#84CC16', true
FROM areas a WHERE a.nombre = 'Logística'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Willy Ramos - Mantenimiento
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Willy Ramos', 'mantenimiento@livigui.com', 'Técnico Mantenimiento', a.id, '#F97316', true
FROM areas a WHERE a.nombre = 'Mantenimiento'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Kenjho Ticona - Mantenimiento (primer registro)
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Kenjho Ticona', 'kenjho.mantenimiento@livigui.com', 'Técnico Mantenimiento', a.id, '#F97316', true
FROM areas a WHERE a.nombre = 'Mantenimiento'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Wladimir Villaverde Obregon - Producción
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Wladimir Villaverde Obregon', 'produccion6@livigui.com', 'Operador Producción', a.id, '#EC4899', true
FROM areas a WHERE a.nombre = 'Producción'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Kenjho Ticona - Producción (segundo registro con email diferente)
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Kenjho Ticona', 'jefeproduccion@livigui.com', 'Jefe de Producción', a.id, '#EC4899', true
FROM areas a WHERE a.nombre = 'Producción'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Wiliams Lazo - Producción
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Wiliams Lazo', 'wiliams.produccion@livigui.com', 'Jefe de Producción', a.id, '#EC4899', true
FROM areas a WHERE a.nombre = 'Producción'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Alexander Molina - Producción
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Alexander Molina', 'produccion4@livigui.com', 'Operador Producción', a.id, '#EC4899', true
FROM areas a WHERE a.nombre = 'Producción'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Jefe de Producción (registro genérico)
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Jefe de Producción', 'jefe.produccion.general@livigui.com', 'Jefe de Producción', a.id, '#EC4899', true
FROM areas a WHERE a.nombre = 'Producción'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Sheyla Zurita - Recursos Humanos
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Sheyla Zurita', 'recursoshumanos@livigui.com', 'Jefe RRHH', a.id, '#6366F1', true
FROM areas a WHERE a.nombre = 'Recursos Humanos'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Elida Mamani - Recursos Humanos
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Elida Mamani', 'elida.rrhh@livigui.com', 'Asistente RRHH', a.id, '#6366F1', true
FROM areas a WHERE a.nombre = 'Recursos Humanos'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Gabriela Yaco - Recursos Humanos
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Gabriela Yaco', 'asistenterrhh@livigui.com', 'Asistente RRHH', a.id, '#6366F1', true
FROM areas a WHERE a.nombre = 'Recursos Humanos'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Renato Mendez - Servicios
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Renato Mendez', 'jefeservicios@livigui.com', 'Jefe de Servicios', a.id, '#14B8A6', true
FROM areas a WHERE a.nombre = 'Servicios'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Denitza Peña - SIG
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Denitza Peña', 'sig@livigui.com', 'Responsable SIG', a.id, '#A855F7', true
FROM areas a WHERE a.nombre = 'SIG'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Leydi Carpio - SSOMA
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Leydi Carpio', 'ssoma2@livigui.com', 'Especialista SSOMA', a.id, '#DC2626', true
FROM areas a WHERE a.nombre = 'SSOMA'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Maciel Apaza - SSOMA
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Maciel Apaza', 'ssoma@livigui.com', 'Jefe SSOMA', a.id, '#DC2626', true
FROM areas a WHERE a.nombre = 'SSOMA'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Yamilet Narvaez - SSOMA
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Yamilet Narvaez', 'yamilet.ssoma@livigui.com', 'Especialista SSOMA', a.id, '#DC2626', true
FROM areas a WHERE a.nombre = 'SSOMA'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Andrea Anampa - Ventas
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Andrea Anampa', 'administracionventa@livigui.com', 'Administrador Ventas', a.id, '#059669', true
FROM areas a WHERE a.nombre = 'Ventas'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Escarly Montalban - Ventas
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Escarly Montalban', 'administracionventa2@livigui.com', 'Administrador Ventas', a.id, '#059669', true
FROM areas a WHERE a.nombre = 'Ventas'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;

-- Miguel Condori - Ventas
INSERT INTO usuarios_empresa (nombre_completo, email, puesto, area_id, color_personal, activo)
SELECT 'Miguel Condori', 'jefeventas.sur@livigui.com', 'Jefe Ventas Sur', a.id, '#059669', true
FROM areas a WHERE a.nombre = 'Ventas'
ON CONFLICT (email) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  puesto = EXCLUDED.puesto,
  area_id = EXCLUDED.area_id,
  color_personal = EXCLUDED.color_personal;
