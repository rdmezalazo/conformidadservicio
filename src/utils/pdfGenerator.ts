import { generatePDFWithTemplate } from './pdfGeneratorWithTemplate';
import { Conformidad } from '@/types/conformidad';

export const generatePDF = async (conformidad: Conformidad) => {
  try {
    // Intentar generar PDF con plantilla
    await generatePDFWithTemplate(conformidad);
  } catch (error) {
    console.warn('Error generating PDF with template, using legacy method:', error);
    // Fallback al método legacy en caso de error
    await generateLegacyPDF(conformidad);
  }
};

// Función de respaldo (el código original con jsPDF)
const generateLegacyPDF = async (conformidad: Conformidad) => {
  const jsPDF = await import('jspdf');
  const { format } = await import('date-fns');
  
  const doc = new jsPDF.default();
  
  // Configuración de fuentes y colores
  const primaryColor: [number, number, number] = [34, 34, 34]; // Gris oscuro
  const borderColor: [number, number, number] = [100, 100, 100]; // Gris medio
  
  // Información del documento (esquina superior derecha)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Código: F-LOG-001', 150, 15);
  doc.text('Versión: 01', 150, 20);
  doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, 150, 25);
  
  // Título principal
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFORMIDAD DE SERVICIO', 105, 35, { align: 'center' });
  
  // Línea divisora
  doc.setDrawColor(...borderColor);
  doc.line(20, 45, 190, 45);
  
  let yPosition = 50;
  
  // ID Correlativo
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ID CORRELATIVO:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.id_correlativo, 65, yPosition);
  
  yPosition += 15;
  
  // Primera fila: RUC y Proveedor
  doc.setFont('helvetica', 'bold');
  doc.text('RUC:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.ruc, 35, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.text('PROVEEDOR:', 105, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.proveedor, 135, yPosition);
  
  yPosition += 10;
  
  // Segunda fila: Nro Factura y Centro de Costo
  doc.setFont('helvetica', 'bold');
  doc.text('NRO FACTURA:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.nro_factura, 55, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.text('NRO CENTRO DE COSTO:', 105, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.nro_centro_costo, 155, yPosition);
  
  yPosition += 10;
  
  // Tercera fila: Orden Servicio y OF
  doc.setFont('helvetica', 'bold');
  doc.text('NRO ORDEN SERVICIO:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.nro_orden_servicio, 70, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.text('NRO OF:', 105, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.nro_of, 125, yPosition);
  
  yPosition += 10;
  
  // Cuarta fila: Solicitante
  doc.setFont('helvetica', 'bold');
  doc.text('SOLICITANTE:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.solicitante, 55, yPosition);
  
  yPosition += 10;
  
  // Quinta fila: Fecha de Conformidad
  doc.setFont('helvetica', 'bold');
  doc.text('FECHA DE CONFORMIDAD:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(conformidad.fecha_conformidad), 'dd/MM/yyyy'), 80, yPosition);
  
  yPosition += 15;
  
  // Descripción del Servicio
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPCIÓN DEL SERVICIO:', 20, yPosition);
  yPosition += 5;
  
  // Dibujar rectángulo para descripción
  doc.rect(20, yPosition, 170, 25);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  const descripcionLines = doc.splitTextToSize(conformidad.descripcion_servicio, 160);
  doc.text(descripcionLines, 25, yPosition);
  
  yPosition += 25 + 10;
  
  // Sexta fila: Responsable y Área
  doc.setFont('helvetica', 'bold');
  doc.text('RESPONSABLE:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.responsable, 60, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.text('ÁREA:', 105, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(conformidad.area, 125, yPosition);
  
  yPosition += 15;
  
  // Conformidad
  doc.setFont('helvetica', 'bold');
  doc.text('CONFORMIDAD:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  
  // Checkboxes para conformidad
  const boxSize = 4;
  doc.rect(80, yPosition - 3, boxSize, boxSize);
  doc.text('SÍ', 90, yPosition);
  if (conformidad.conformidad) {
    doc.text('X', 82, yPosition);
  }
  
  doc.rect(110, yPosition - 3, boxSize, boxSize);
  doc.text('NO', 120, yPosition);
  if (!conformidad.conformidad) {
    doc.text('X', 112, yPosition);
  }
  
  yPosition += 15;
  
  // Observaciones
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES:', 20, yPosition);
  yPosition += 5;
  
  // Dibujar rectángulo para observaciones
  doc.rect(20, yPosition, 170, 20);
  yPosition += 8;
  
  if (conformidad.observaciones) {
    doc.setFont('helvetica', 'normal');
    const observacionesLines = doc.splitTextToSize(conformidad.observaciones, 160);
    doc.text(observacionesLines, 25, yPosition);
  }
  
  yPosition += 30;
  
  // Línea para firma
  doc.line(20, yPosition, 80, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('Usuario', 45, yPosition + 10, { align: 'center' });
  
  yPosition += 25;
  
  // Nota al pie
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const nota = 'Nota: Para la recepción de su comprobante de pago, se debe adjuntar el presente formato debidamente firmado y sellado.';
  const notaLines = doc.splitTextToSize(nota, 170);
  doc.text(notaLines, 20, yPosition);
  
  // Guardar el PDF
  const fileName = `Conformidad_${conformidad.id_correlativo}_${format(new Date(), 'ddMMyyyy')}.pdf`;
  doc.save(fileName);
};