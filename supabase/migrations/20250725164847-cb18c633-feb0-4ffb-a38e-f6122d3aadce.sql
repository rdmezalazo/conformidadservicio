-- Actualizar la plantilla por defecto para agregar la sección de firma del responsable
UPDATE public.pdf_templates 
SET layout_data = jsonb_set(
  layout_data,
  '{-1}',
  '{"type": "text", "x": 400, "y": 680, "width": 180, "height": 60, "text": "____________________", "fontSize": 12, "fontWeight": "normal", "textAlign": "center", "fieldId": "signature_line"}'::jsonb,
  true
)
WHERE is_default = true AND is_active = true;

-- Agregar el texto "Firma del Responsable"
UPDATE public.pdf_templates 
SET layout_data = jsonb_set(
  layout_data,
  '{-1}',
  '{"type": "text", "x": 400, "y": 700, "width": 180, "height": 20, "text": "Firma del Responsable", "fontSize": 10, "fontWeight": "bold", "textAlign": "center", "fieldId": "signature_label"}'::jsonb,
  true
)
WHERE is_default = true AND is_active = true;

-- Agregar el nombre del responsable
UPDATE public.pdf_templates 
SET layout_data = jsonb_set(
  layout_data,
  '{-1}',
  '{"type": "text", "x": 400, "y": 720, "width": 180, "height": 20, "text": "", "fontSize": 10, "fontWeight": "normal", "textAlign": "center", "fieldId": "responsable"}'::jsonb,
  true
)
WHERE is_default = true AND is_active = true;