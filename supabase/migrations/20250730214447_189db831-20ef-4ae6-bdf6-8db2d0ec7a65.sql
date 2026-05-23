-- Agregar el usuario faltante asistentelogistica@livigui.com al área de Logística
INSERT INTO usuarios_empresa (
  email, 
  nombre_completo, 
  puesto,
  area_id,
  color_personal,
  activo
) VALUES (
  'asistentelogistica@livigui.com',
  'Asistente de Logística', 
  'Asistente de Logística',
  '80f9cadc-0be5-4f15-a5e8-7cda34de3f2c', -- ID del área de Logística
  '#3B82F6', -- Color similar a otros usuarios de Logística
  true
);