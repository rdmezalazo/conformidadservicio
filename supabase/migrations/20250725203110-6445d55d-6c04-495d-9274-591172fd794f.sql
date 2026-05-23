-- Agregar campo firma a la tabla conformidades_servicio
ALTER TABLE public.conformidades_servicio 
ADD COLUMN firma text;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.conformidades_servicio.firma IS 'URL de la imagen de firma del usuario que crea la conformidad';