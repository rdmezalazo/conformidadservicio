-- Agregar política para que administradores puedan eliminar todos los registros
CREATE POLICY "Administradores pueden eliminar todas las conformidades" 
ON public.conformidades_servicio 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Crear función para eliminar todos los registros de conformidades
CREATE OR REPLACE FUNCTION public.delete_all_conformidades()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Verificar que el usuario es administrador
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo los administradores pueden eliminar todos los registros';
  END IF;
  
  -- Eliminar todos los registros y contar cuántos se eliminaron
  DELETE FROM public.conformidades_servicio;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;