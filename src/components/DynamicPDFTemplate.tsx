
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conformidad } from '@/types/conformidad';

interface PDFConfig {
  showLogo: boolean;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  includeSignature: boolean;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

interface LayoutElement {
  id: string;
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  src?: string;
  fieldId?: string;
}

interface SignatureData {
  userSignatureUrl: string | null;
  currentUserRole: string | null;
  currentUserArea: string | null;
  responsibleSignatureUrl: string | null;
}

interface DynamicPDFTemplateProps {
  conformidad: Conformidad;
  config: PDFConfig;
  layout?: LayoutElement[];
  signatureData: SignatureData;
}

const createDynamicStyles = (config: PDFConfig) => {
  const baseFontSize = config.fontSize === 'small' ? 8 : config.fontSize === 'medium' ? 10 : 12;
  
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 0,
      fontSize: baseFontSize,
      fontFamily: 'Helvetica',
    },
    container: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
  });
};

const convertFieldIdToValue = (fieldId: string, conformidad: Conformidad, config: PDFConfig) => {
  const fieldMap: Record<string, string> = {
    'id_correlativo': conformidad.id_correlativo,
    'ruc': conformidad.ruc,
    'proveedor': conformidad.proveedor,
    'nro_factura': conformidad.nro_factura,
    'nro_centro_costo': conformidad.nro_centro_costo,
    'nro_orden_servicio': conformidad.nro_orden_servicio,
    'nro_of': conformidad.nro_of,
    'solicitante': conformidad.solicitante,
    'fecha_conformidad': format(new Date(conformidad.fecha_conformidad), "dd/MM/yyyy"),
    'descripcion_servicio': conformidad.descripcion_servicio,
    'conformidad': conformidad.conformidad ? 'Sí' : 'No',
    'observaciones': conformidad.observaciones || 'Ninguna',
    'responsable': conformidad.responsable,
    'area': conformidad.area,
    'usuario_id': conformidad.usuario_id,
    'firma_responsable': 'Firma del Responsable',
    'firma': conformidad.firma || '',
    // Compatibilidad con IDs antiguos
    'correlativo': conformidad.id_correlativo,
    'factura': conformidad.nro_factura,
    'centro_costo': conformidad.nro_centro_costo,
    'orden_servicio': conformidad.nro_orden_servicio,
    'fecha': format(new Date(conformidad.fecha_conformidad), "dd/MM/yyyy"),
    'descripcion': conformidad.descripcion_servicio,
  };

  return fieldMap[fieldId] || '';
};

// Función para buscar fieldId por label
const findFieldIdByLabel = (label: string) => {
  const fieldMappings: Record<string, string> = {
    'ID Correlativo': 'id_correlativo',
    'RUC': 'ruc',
    'Proveedor': 'proveedor',
    'Número de Factura': 'nro_factura',
    'Nro Factura': 'nro_factura',
    'Número Centro de Costo': 'nro_centro_costo',
    'Centro de Costo': 'nro_centro_costo',
    'Número Orden de Servicio': 'nro_orden_servicio',
    'Orden de Servicio': 'nro_orden_servicio',
    'Número OF': 'nro_of',
    'Nro OF': 'nro_of',
    'Solicitante': 'solicitante',
    'Fecha de Conformidad': 'fecha_conformidad',
    'Fecha': 'fecha_conformidad',
    'Descripción del Servicio': 'descripcion_servicio',
    'Descripción': 'descripcion_servicio',
    'Conformidad (Sí/No)': 'conformidad',
    'Conformidad': 'conformidad',
    'Observaciones': 'observaciones',
    'Responsable': 'responsable',
    'Área': 'area',
    'Usuario ID': 'usuario_id',
  };
  
  return fieldMappings[label] || null;
};

// Función mejorada para detectar el tipo de campo basado en posición y contexto
const detectFieldType = (element: LayoutElement, layout: LayoutElement[], conformidad: Conformidad) => {
  // Buscar el label más cercano que esté arriba o a la izquierda del campo
  const nearbyLabels = layout.filter(el => 
    el.type === 'text' && 
    el.text &&
    // Buscar labels que estén cerca horizontalmente y verticalmente
    Math.abs(el.left - element.left) < 200 && // Tolerancia horizontal amplia
    Math.abs(el.top - element.top) < 50 && // Tolerancia vertical
    el.top <= element.top + 20 // El label debe estar arriba o al mismo nivel
  );

  // Ordenar por proximidad (distancia euclidiana)
  nearbyLabels.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.left - element.left, 2) + Math.pow(a.top - element.top, 2));
    const distB = Math.sqrt(Math.pow(b.left - element.left, 2) + Math.pow(b.top - element.top, 2));
    return distA - distB;
  });

  // Buscar el mejor match
  for (const label of nearbyLabels) {
    const labelText = label.text!.toLowerCase().replace(/[^a-z\s]/g, '');
    
    // Mapeo mejorado con múltiples variantes
    if (labelText.includes('correlativo') || labelText.includes('id correlativo')) return 'correlativo';
    if (labelText.includes('proveedor')) return 'proveedor';
    if (labelText.includes('ruc')) return 'ruc';
    if (labelText.includes('factura') || labelText.includes('nro fac')) return 'factura';
    if (labelText.includes('centro') && labelText.includes('costo')) return 'centro_costo';
    if (labelText.includes('orden') && labelText.includes('servicio')) return 'orden_servicio';
    if (labelText.includes('nro of') || (labelText.includes('nro') && labelText.includes('of'))) return 'nro_of';
    if (labelText.includes('responsable')) return 'responsable';
    if (labelText.includes('solicitante')) return 'solicitante';
    if (labelText.includes('area')) return 'area';
    
    // Casos especiales que necesitan mayor precisión
    if (labelText.includes('fecha') && labelText.includes('conformidad')) return 'fecha';
    if (labelText.includes('conformidad') && !labelText.includes('fecha')) return 'conformidad';
    if (labelText.includes('descripcion') || (labelText.includes('servicio') && !labelText.includes('orden'))) return 'descripcion';
    if (labelText.includes('observaciones') || labelText.includes('observa')) return 'observaciones';
  }

  // Si no encuentra label, usar detección por posición como respaldo
  // Esto es útil para campos que pueden no tener labels claros
  const position = { x: element.left, y: element.top };
  
  // Lógica de posición mejorada basada en layout típico
  if (position.y < 150) {
    if (position.x < 200) return 'correlativo';
    if (position.x > 500) return 'proveedor';
  }
  
  if (position.y >= 150 && position.y < 250) {
    if (position.x < 200) return 'ruc';
    if (position.x > 400) return 'factura';
  }
  
  if (position.y >= 250 && position.y < 350) {
    if (position.x < 300) return 'orden_servicio';
    if (position.x > 400) return 'nro_of';
  }
  
  if (position.y >= 350 && position.y < 400) {
    if (position.x < 300) return 'responsable';
    if (position.x > 500) return 'fecha';
  }
  
  if (position.y >= 400 && position.y < 450) {
    if (position.x > 500) return 'conformidad';
  }
  
  if (position.y >= 450 && position.y < 550) {
    return 'descripcion';
  }
  
  if (position.y >= 550) {
    return 'observaciones';
  }

  return '';
};

export function DynamicPDFTemplate({ conformidad, config, layout, signatureData }: DynamicPDFTemplateProps) {
  const styles = createDynamicStyles(config);

  if (!layout || layout.length === 0) {
    // Fallback al template estático si no hay layout dinámico
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 50 }}>
              CONFORMIDAD DEL SERVICIO RECIBIDO
            </Text>
            <Text style={{ fontSize: 12, marginTop: 100, marginLeft: 40 }}>
              No se ha definido un layout personalizado. Use el Editor Visual para diseñar su plantilla.
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {layout.map((element, index) => {
            const elementStyle = {
              position: 'absolute' as const,
              left: element.left * 0.75, // Conversión de píxeles del canvas a puntos PDF
              top: element.top * 0.75,
              width: element.width * 0.75,
              height: element.height * 0.75,
            };

            if (element.type === 'text') {
              // Aumentar el ancho para títulos que puedan estar cortados
              const adjustedWidth = element.width * 0.75 * 1.5; // 50% más ancho
              const adjustedHeight = element.height * 0.75 * 1.2; // 20% más alto
              
              // Determinar el contenido del texto
              let textContent = element.text || '';
              
              // Si el elemento tiene un fieldId, usar el valor del campo de conformidad
              if (element.fieldId) {
                textContent = convertFieldIdToValue(element.fieldId, conformidad, config);
              } else if (textContent && textContent.includes('{') && textContent.includes('}')) {
                // Detectar patrones {Campo} en el texto y reemplazar con valores reales
                const fieldPattern = /\{([^}]+)\}/g;
                textContent = textContent.replace(fieldPattern, (match, fieldName) => {
                  // Buscar el campo por label
                  const fieldId = findFieldIdByLabel(fieldName);
                  if (fieldId) {
                    return convertFieldIdToValue(fieldId, conformidad, config);
                  }
                  return match; // Si no se encuentra, mantener el texto original
                });
              }
              
              return (
                <Text
                  key={`${element.id}-${index}`}
                  style={{
                    position: 'absolute' as const,
                    left: element.left * 0.75,
                    top: element.top * 0.75,
                    width: adjustedWidth,
                    height: adjustedHeight,
                    fontSize: (element.fontSize || 12) * 0.75,
                    fontWeight: element.fontWeight as any || 'normal',
                    textAlign: element.textAlign as any || 'left',
                    color: '#000000',
                    lineHeight: 1.2,
                  }}
                >
                  {textContent}
                </Text>
              );
            }

            if (element.type === 'rect') {
              // Detectar si es un campo de datos
              const isDataField = element.fill === '#F5F5F5' || 
                                element.fill === 'rgb(245,245,245)' ||
                                element.fill === '#FFFFFF' ||
                                element.fill === 'white' ||
                                element.fill === '#f5f5f5' ||
                                (element.stroke && element.strokeWidth && element.strokeWidth > 0);
              
              if (isDataField) {
                // Usar directamente el fieldId si está disponible, sino detectar automáticamente
                const fieldKey = element.fieldId || detectFieldType(element, layout, conformidad);
                const fieldValue = convertFieldIdToValue(fieldKey, conformidad, config);

                return (
                  <View
                    key={`${element.id}-${index}`}
                    style={{
                      ...elementStyle,
                      backgroundColor: 'transparent',
                      border: '1pt solid #CCCCCC',
                      padding: 2,
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ 
                      fontSize: 8, 
                      color: '#000000',
                      textAlign: 'left',
                      lineHeight: 1.2,
                    }}>
                      {fieldValue}
                    </Text>
                  </View>
                );
              } else {
                // Rectángulo decorativo
                return (
                  <View
                    key={`${element.id}-${index}`}
                    style={{
                      ...elementStyle,
                      backgroundColor: element.fill || 'transparent',
                      border: element.stroke ? `${element.strokeWidth || 1}pt solid ${element.stroke}` : 'none',
                    }}
                  />
                );
              }
            }

            if (element.type === 'image') {
              // Determinar qué imagen mostrar
              let imageSrc = element.src || "/lovable-uploads/3fdb70c9-ecc9-4a0a-b0a5-7636c918b417.png";
              
              // Si el elemento es una firma, determinar qué firma usar
              if (element.fieldId === 'firma_responsable' || element.fieldId === 'firma') {
                // Prioridad: 1. Firma almacenada en conformidad, 2. Firma del responsable, 3. Firma del usuario actual, 4. Imagen por defecto
                if (conformidad.firma) {
                  imageSrc = conformidad.firma;
                } else if (signatureData.responsibleSignatureUrl) {
                  imageSrc = signatureData.responsibleSignatureUrl;
                } else if (signatureData.userSignatureUrl && 
                          signatureData.currentUserRole === 'usuario_responsable' &&
                          signatureData.currentUserArea === conformidad.area) {
                  imageSrc = signatureData.userSignatureUrl;
                } else {
                  // Mantener imagen por defecto si no hay firma disponible
                  imageSrc = "/lovable-uploads/3fdb70c9-ecc9-4a0a-b0a5-7636c918b417.png";
                }
              }
              
              return (
                <Image
                  key={`${element.id}-${index}`}
                  style={elementStyle}
                  src={imageSrc}
                />
              );
            }

            return null;
          })}
        </View>
      </Page>
    </Document>
  );
}
