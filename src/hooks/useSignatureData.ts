import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conformidad } from '@/types/conformidad';

interface SignatureData {
  userSignatureUrl: string | null;
  currentUserRole: string | null;
  currentUserArea: string | null;
  responsibleSignatureUrl: string | null;
}

export function useSignatureData(conformidad: Conformidad) {
  const [signatureData, setSignatureData] = useState<SignatureData>({
    userSignatureUrl: null,
    currentUserRole: null,
    currentUserArea: null,
    responsibleSignatureUrl: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSignatureData = async () => {
      try {
        // Obtener información del usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Obtener el perfil del usuario actual para la firma
        const { data: profile } = await supabase
          .from('profiles')
          .select('firma_url')
          .eq('id', user.id)
          .single();

        // Obtener el rol del usuario actual
        const { data: userRoleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        // Obtener el área del usuario actual desde usuarios_empresa
        const { data: usuarioEmpresa } = await supabase
          .from('usuarios_empresa')
          .select(`
            areas (
              nombre
            )
          `)
          .eq('email', user.email)
          .single();

        // Obtener la firma del responsable de la conformidad
        // Buscar al responsable por nombre en usuarios_empresa
        const { data: responsableData } = await supabase
          .from('usuarios_empresa')
          .select('firma_url')
          .eq('nombre_completo', conformidad.responsable)
          .single();

        const currentUserArea = usuarioEmpresa?.areas ? (usuarioEmpresa.areas as any).nombre : null;

        setSignatureData({
          userSignatureUrl: profile?.firma_url || null,
          currentUserRole: userRoleData?.role || null,
          currentUserArea,
          responsibleSignatureUrl: conformidad.firma || responsableData?.firma_url || null,
        });
      } catch (error) {
        console.error('Error fetching signature data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignatureData();
  }, [conformidad]);

  return { signatureData, isLoading };
}