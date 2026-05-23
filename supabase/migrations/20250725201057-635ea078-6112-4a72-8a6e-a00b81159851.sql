-- Agregar campo firma_url a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN firma_url text;

-- Crear bucket para firmas si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('firmas-usuarios', 'firmas-usuarios', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para el bucket de firmas de usuarios
CREATE POLICY "Los usuarios pueden ver todas las firmas" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'firmas-usuarios');

CREATE POLICY "Los usuarios pueden subir su propia firma" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'firmas-usuarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Los usuarios pueden actualizar su propia firma" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'firmas-usuarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Los usuarios pueden eliminar su propia firma" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'firmas-usuarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);