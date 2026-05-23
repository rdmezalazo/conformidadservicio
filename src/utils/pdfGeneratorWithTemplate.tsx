import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { DynamicPDFTemplate } from '@/components/DynamicPDFTemplate';
import { supabase } from '@/integrations/supabase/client';
import { Conformidad } from '@/types/conformidad';

interface SignatureData {
  userSignatureUrl: string | null;
  currentUserRole: string | null;
  currentUserArea: string | null;
  responsibleSignatureUrl: string | null;
}

const fetchSignatureData = async (conformidad: Conformidad): Promise<SignatureData> => {
  try {
    // Obtener información del usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        userSignatureUrl: null,
        currentUserRole: null,
        currentUserArea: null,
        responsibleSignatureUrl: conformidad.firma || null,
      };
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

    return {
      userSignatureUrl: profile?.firma_url || null,
      currentUserRole: userRoleData?.role || null,
      currentUserArea,
      responsibleSignatureUrl: conformidad.firma || responsableData?.firma_url || null,
    };
  } catch (error) {
    console.error('Error fetching signature data:', error);
    return {
      userSignatureUrl: null,
      currentUserRole: null,
      currentUserArea: null,
      responsibleSignatureUrl: conformidad.firma || null,
    };
  }
};

export const generatePDFWithTemplate = async (conformidad: Conformidad, includeSignature: boolean = true, returnBlob: boolean = false): Promise<Blob | void> => {
  try {
    // Obtener la plantilla por defecto
    const { data: defaultTemplate, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error || !defaultTemplate) {
      throw new Error('No default template found');
    }

    // Obtener datos de firma
    const signatureData = await fetchSignatureData(conformidad);

    // Parsear los datos de la plantilla
    const layout = Array.isArray(defaultTemplate.layout_data) 
      ? defaultTemplate.layout_data 
      : JSON.parse(defaultTemplate.layout_data as string);
    
    const config = typeof defaultTemplate.pdf_config === 'object' 
      ? defaultTemplate.pdf_config 
      : JSON.parse(defaultTemplate.pdf_config as string);

    // Generar PDF usando la plantilla dinámica
    const blob = await pdf(
      <DynamicPDFTemplate
        conformidad={conformidad}
        config={config}
        layout={layout}
        signatureData={includeSignature ? signatureData : { ...signatureData, userSignatureUrl: null, responsibleSignatureUrl: null }}
      />
    ).toBlob();

    // Si se requiere retornar el blob (para email), no descargar
    if (returnBlob) {
      return blob;
    }

    // Crear URL y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Conformidad_${conformidad.id_correlativo}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error generating PDF with template:', error);
    throw error;
  }
};