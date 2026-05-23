import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Conformidad } from '@/types/conformidad';
import { generatePDFWithTemplate } from '@/utils/pdfGeneratorWithTemplate';
import { supabase } from '@/integrations/supabase/client';

interface SendEmailParams {
  conformidad: Conformidad;
  toEmail: string;
  ccEmail?: string;
  subject: string;
  message: string;
  includeFirma: boolean;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: string;
  statusCode?: number;
  recipient?: string;
  timestamp?: string;
  attachments?: number;
}

export function useEmailSender() {
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { conformidad, toEmail, ccEmail, subject, message, includeFirma } = params;

      console.log('🚀 Iniciando proceso de envío de email...');
      console.log('📧 Destinatario:', toEmail);
      console.log('📋 Conformidad:', conformidad.id_correlativo);

      // Validación exhaustiva de entrada
      if (!toEmail?.trim()) {
        throw new Error('El email destinatario es requerido');
      }

      if (!subject?.trim()) {
        throw new Error('El asunto del email es requerido');
      }

      if (!conformidad?.id_correlativo?.trim()) {
        throw new Error('ID correlativo de conformidad es requerido');
      }

      // Validar formato de email con regex más estricto
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(toEmail.trim())) {
        throw new Error('El formato del email destinatario no es válido');
      }

      // Validar formato de email CC si se proporciona
      if (ccEmail && ccEmail.trim() && !emailRegex.test(ccEmail.trim())) {
        throw new Error('El formato del email CC no es válido');
      }

      // Generar PDF como base64 para adjunto
      let pdfBase64: string | undefined;
      
      try {
        console.log('📄 Generando PDF para adjunto...');
        const pdfBlob = await generatePDFWithTemplate(conformidad, includeFirma, true) as Blob;
        
        if (pdfBlob && pdfBlob.size > 0) {
          // Verificar tamaño del PDF (límite de 10MB para Resend)
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (pdfBlob.size > maxSize) {
            console.warn('⚠️ PDF demasiado grande, enviando sin adjunto');
            toast({
              title: 'Advertencia',
              description: 'El PDF es demasiado grande para adjuntar. Se enviará sin adjunto.',
              variant: 'default',
            });
          } else {
            const buffer = await pdfBlob.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            bytes.forEach((byte) => binary += String.fromCharCode(byte));
            pdfBase64 = btoa(binary);
            console.log('✅ PDF generado exitosamente, tamaño:', pdfBlob.size, 'bytes');
          }
        }
      } catch (pdfError) {
        console.warn('⚠️ Error al generar PDF para adjunto:', pdfError);
        toast({
          title: 'Advertencia',
          description: 'No se pudo generar el PDF adjunto. Se enviará solo el email.',
          variant: 'default',
        });
      }

      console.log('🌐 Llamando a la Edge Function...');

      // Llamar a la Edge Function de Supabase con timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado')), 30000);
      });

      const emailPromise = supabase.functions.invoke('send-conformidad-email', {
        body: {
          toEmail: toEmail.trim(),
          ccEmail: ccEmail?.trim(),
          subject: subject.trim(),
          message: message.trim(),
          conformidad,
          pdfBase64,
          includeFirma
        }
      });

      const { data, error } = await Promise.race([emailPromise, timeoutPromise]) as any;

      console.log('📨 Respuesta de la edge function:', { 
        success: data?.success, 
        messageId: data?.messageId,
        error: error?.message || data?.error 
      });

      // Manejo de errores de Supabase
      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw new Error(error.message || 'Error al conectar con el servicio de email');
      }

      // Verificar respuesta de la Edge Function
      const response = data as EmailResponse;
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      if (response.success === false) {
        console.error('❌ Error reportado por la Edge Function:', response.error);
        
        // Manejar errores específicos de Resend
        if (response.statusCode === 403) {
          throw new Error('Error de configuración del dominio de email. Contacte al administrador.');
        } else if (response.statusCode === 422) {
          throw new Error('Datos del email inválidos. Verifique el formato y contenido.');
        } else if (response.statusCode === 429) {
          throw new Error('Límite de envío de emails excedido. Intente más tarde.');
        }
        
        throw new Error(response.error || 'Error al enviar el email');
      }

      if (!response.messageId) {
        throw new Error('No se recibió ID de confirmación del email');
      }

      // Éxito confirmado
      console.log('✅ Email enviado exitosamente con ID:', response.messageId);
      
      const recipients = ccEmail ? `${toEmail} (CC: ${ccEmail})` : toEmail;
      toast({
        title: '✅ Email Enviado Exitosamente',
        description: `La conformidad ${conformidad.id_correlativo} ha sido enviada a ${recipients}${pdfBase64 ? ' con PDF adjunto' : ''}`,
      });

      return true;

    } catch (error) {
      console.error('💥 Error al enviar email:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Clasificación y manejo específico de errores
      let userFriendlyMessage = errorMessage;
      let variant: 'destructive' | 'default' = 'destructive';
      
      if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
        userFriendlyMessage = 'La operación tardó demasiado tiempo. Verifique su conexión e intente nuevamente.';
      } else if (errorMessage.includes('configuración del dominio')) {
        userFriendlyMessage = 'Error de configuración del servicio de email. Contacte al administrador del sistema.';
      } else if (errorMessage.includes('formato') || errorMessage.includes('válido')) {
        userFriendlyMessage = errorMessage;
      } else if (errorMessage.includes('Límite de envío')) {
        userFriendlyMessage = 'Se ha excedido el límite de envío de emails. Intente más tarde.';
      } else if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('conexión')) {
        userFriendlyMessage = 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
      } else if (errorMessage.includes('requerido')) {
        userFriendlyMessage = errorMessage;
        variant = 'default';
      }
      
      toast({
        title: variant === 'destructive' ? '❌ Error al Enviar Email' : '⚠️ Datos Incompletos',
        description: userFriendlyMessage,
        variant,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading,
  };
}