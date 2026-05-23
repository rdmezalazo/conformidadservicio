import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConformidadEmailRequest {
  toEmail: string;
  ccEmail?: string;
  subject: string;
  message: string;
  conformidad: {
    id_correlativo: string;
    proveedor: string;
    area: string;
    fecha_conformidad: string;
    conformidad: boolean;
    responsable: string;
    nro_factura: string;
    descripcion_servicio: string;
    observaciones?: string;
  };
  pdfBase64?: string;
  includeFirma: boolean;
}

interface ResendApiError {
  statusCode: number;
  error: string;
}

// Enhanced email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

// Configure sender email
function getSenderEmail(): string {
  // Use verified domain email for production
  return "Conformidades Livigui <conformidades@livigui.com>";
}

// Generate email HTML template
function generateEmailHTML(conformidad: any, message: string, pdfBase64?: string, includeFirma?: boolean): string {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString || 'N/A';
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Conformidad de Servicio</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: #1D5F82; padding: 30px 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; text-align: center;">
            CONFORMIDAD DE SERVICIO
          </h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px; text-align: center;">
            LIVIGUI PERU S.A.C.
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <!-- Status Badge -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; padding: 10px 20px; border-radius: 20px; background-color: ${conformidad.conformidad ? '#dcfce7' : '#fef2f2'}; border: 2px solid ${conformidad.conformidad ? '#22c55e' : '#ef4444'};">
              <span style="color: ${conformidad.conformidad ? '#166534' : '#dc2626'}; font-weight: 600; font-size: 14px;">
                ${conformidad.conformidad ? '✓ CONFORME' : '✗ NO CONFORME'}
              </span>
            </div>
          </div>
          
          <!-- Conformidad Details -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              📋 Detalles de la Conformidad
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 40%;">ID Correlativo:</td>
                <td style="padding: 8px 0; color: #6b7280;">${conformidad.id_correlativo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Proveedor:</td>
                <td style="padding: 8px 0; color: #6b7280;">${conformidad.proveedor || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Área:</td>
                <td style="padding: 8px 0; color: #6b7280;">${conformidad.area || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Fecha:</td>
                <td style="padding: 8px 0; color: #6b7280;">${formatDate(conformidad.fecha_conformidad)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Responsable:</td>
                <td style="padding: 8px 0; color: #6b7280;">${conformidad.responsable || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">N° Factura:</td>
                <td style="padding: 8px 0; color: #6b7280;">${conformidad.nro_factura || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Descripción:</td>
                <td style="padding: 8px 0; color: #6b7280;">${conformidad.descripcion_servicio || 'N/A'}</td>
              </tr>
              ${conformidad.observaciones ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Observaciones:</td>
                <td style="padding: 8px 0; color: #6b7280;">${conformidad.observaciones}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <!-- Message -->
          ${message ? `
          <div style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
              💬 Mensaje
            </h3>
            <div style="color: #6b7280; line-height: 1.6; white-space: pre-line;">${message}</div>
          </div>
          ` : ''}
          
          <!-- Attachment Info -->
          ${pdfBase64 ? `
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">📎</span>
              <div>
                <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px;">
                  Documento adjunto incluido
                </p>
                <p style="margin: 5px 0 0 0; color: #92400e; font-size: 12px;">
                  conformidad-${conformidad.id_correlativo}.pdf
                </p>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Este email fue enviado automáticamente desde el Sistema de Conformidades
          </p>
          <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
            LIVIGUI PERU SAC - Por favor, no responder a este correo
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ 
        error: "Método no permitido", 
        success: false 
      }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  let requestData: ConformidadEmailRequest;

  try {
    requestData = await req.json();
  } catch (error) {
    console.error("Error parsing request JSON:", error);
    return new Response(
      JSON.stringify({ 
        error: "Formato de datos inválido", 
        success: false 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { 
      toEmail, 
      ccEmail,
      subject, 
      message, 
      conformidad, 
      pdfBase64, 
      includeFirma 
    } = requestData;

    console.log("📧 Processing email request for:", toEmail);
    console.log("📋 Conformidad ID:", conformidad?.id_correlativo);

    // Comprehensive validation
    const validationErrors: string[] = [];

    if (!toEmail?.trim()) validationErrors.push("Email destinatario es requerido");
    if (!subject?.trim()) validationErrors.push("Asunto es requerido");
    if (!conformidad?.id_correlativo?.trim()) validationErrors.push("ID correlativo de conformidad es requerido");

    if (validationErrors.length > 0) {
      console.error("❌ Validation errors:", validationErrors);
      return new Response(
        JSON.stringify({ 
          error: "Datos incompletos",
          success: false,
          details: validationErrors.join(", ")
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!isValidEmail(toEmail.trim())) {
      console.error("❌ Invalid email format:", toEmail);
      return new Response(
        JSON.stringify({ 
          error: "Formato de email inválido",
          success: false,
          details: `Email "${toEmail}" no tiene un formato válido`
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate CC email format if provided
    if (ccEmail && ccEmail.trim() && !isValidEmail(ccEmail.trim())) {
      console.error("❌ Invalid CC email format:", ccEmail);
      return new Response(
        JSON.stringify({ 
          error: "Formato de email CC inválido",
          success: false,
          details: `Email CC "${ccEmail}" no tiene un formato válido`
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Prepare attachments if PDF is provided
    const attachments = pdfBase64 ? [{
      filename: `conformidad-${conformidad.id_correlativo}.pdf`,
      content: pdfBase64,
      contentType: 'application/pdf'
    }] : [];

    console.log("📎 Attachments to send:", attachments.length);

    // Send email using Resend
    console.log("🚀 Sending email via Resend API...");
    console.log("📧 CC Email:", ccEmail || 'None');
    
    const emailData: any = {
      from: getSenderEmail(),
      to: [toEmail.trim()],
      subject: subject.trim(),
      html: generateEmailHTML(conformidad, message || '', pdfBase64, includeFirma),
      attachments: attachments
    };

    // Add CC if provided
    if (ccEmail && ccEmail.trim()) {
      emailData.cc = [ccEmail.trim()];
    }

    const emailResponse = await resend.emails.send(emailData);

    console.log("📧 Resend API response:", JSON.stringify(emailResponse, null, 2));
    console.log("🔑 Using API Key:", Deno.env.get("RESEND_API_KEY") ? "CONFIGURED" : "MISSING");
    console.log("📤 From email:", getSenderEmail());

    // Handle Resend API errors
    if (emailResponse.error) {
      const resendError = emailResponse.error as ResendApiError;
      console.error("❌ Resend API error:", resendError);
      
      // Handle specific error types
      let userFriendlyError = "Error al enviar el email";
      let statusCode = 500;
      
      if (resendError.statusCode === 403) {
        userFriendlyError = "Error de autenticación con el servicio de email. Verificar configuración de dominio.";
        statusCode = 403;
      } else if (resendError.statusCode === 422) {
        userFriendlyError = "Datos del email inválidos. Verificar formato y contenido.";
        statusCode = 422;
      } else if (resendError.statusCode === 429) {
        userFriendlyError = "Límite de envío de emails excedido. Intente más tarde.";
        statusCode = 429;
      }
      
      return new Response(
        JSON.stringify({ 
          error: userFriendlyError,
          success: false,
          details: resendError.error,
          statusCode: resendError.statusCode
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if we have a successful response
    if (!emailResponse.data?.id) {
      console.error("❌ No message ID returned from Resend");
      return new Response(
        JSON.stringify({ 
          error: "Respuesta inesperada del servicio de email",
          success: false,
          details: "No se recibió ID de mensaje"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Success response
    const messageId = emailResponse.data.id;
    console.log("✅ Email sent successfully with ID:", messageId);
    
    const recipients = ccEmail ? `${toEmail.trim()} (CC: ${ccEmail.trim()})` : toEmail.trim();
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageId,
        message: "Email enviado exitosamente",
        recipient: recipients,
        timestamp: new Date().toISOString(),
        attachments: attachments.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("💥 Unexpected error in send-conformidad-email function:", error);
    console.error("Stack trace:", error.stack);
    
    // Classify error types for better user feedback
    let errorMessage = "Error interno del servidor";
    let statusCode = 500;
    
    if (error.name === "TypeError" && error.message?.includes("fetch")) {
      errorMessage = "Error de conexión con el servicio de email";
      statusCode = 503;
    } else if (error.name === "SyntaxError" || error.message?.includes("JSON")) {
      errorMessage = "Error al procesar los datos del email";
      statusCode = 422;
    } else if (error.message?.includes("timeout") || error.message?.includes("TIMEOUT")) {
      errorMessage = "Tiempo de espera agotado. Intente nuevamente.";
      statusCode = 408;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        details: error.message,
        timestamp: new Date().toISOString(),
        errorType: error.name || "UnknownError"
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);