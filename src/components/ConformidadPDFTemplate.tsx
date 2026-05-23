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

interface ConformidadPDFTemplateProps {
  conformidad: Conformidad;
  config: PDFConfig;
  customLayout?: any;
}

const createStyles = (config: PDFConfig) => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: config.fontSize === 'small' ? 9 : config.fontSize === 'medium' ? 11 : 13,
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    border: '2pt solid #333333',
    padding: 15,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 45,
    marginRight: 15,
  },
  titleSection: {
    flex: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: config.fontSize === 'small' ? 16 : config.fontSize === 'medium' ? 18 : 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  rightHeader: {
    flexDirection: 'column',
    border: '1pt solid #333333',
    padding: 8,
    minWidth: 120,
  },
  headerInfoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  headerLabel: {
    fontSize: config.fontSize === 'small' ? 7 : config.fontSize === 'medium' ? 8 : 9,
    fontWeight: 'bold',
    width: '40%',
    color: '#333333',
  },
  headerValue: {
    fontSize: config.fontSize === 'small' ? 7 : config.fontSize === 'medium' ? 8 : 9,
    width: '60%',
    color: '#333333',
  },
  formContainer: {
    marginTop: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  fieldGroup: {
    flex: 1,
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: config.fontSize === 'small' ? 9 : config.fontSize === 'medium' ? 10 : 11,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: config.fontSize === 'small' ? 9 : config.fontSize === 'medium' ? 10 : 11,
    backgroundColor: '#F5F5F5',
    border: '1pt solid #CCCCCC',
    padding: 5,
    minHeight: 20,
    color: '#333333',
  },
  fullWidthField: {
    marginBottom: 15,
  },
  textAreaField: {
    minHeight: 60,
    padding: 8,
  },
  conformitySection: {
    marginTop: 20,
    marginBottom: 15,
  },
  conformityLabel: {
    fontSize: config.fontSize === 'small' ? 9 : config.fontSize === 'medium' ? 10 : 11,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  radioButton: {
    width: 10,
    height: 10,
    borderRadius: 5,
    border: '1pt solid #333333',
    marginRight: 5,
    backgroundColor: '#FFFFFF',
  },
  radioButtonSelected: {
    backgroundColor: '#333333',
  },
  observationsSection: {
    marginTop: 15,
    marginBottom: 30,
  },
  noteText: {
    fontSize: config.fontSize === 'small' ? 7 : config.fontSize === 'medium' ? 8 : 9,
    color: '#666666',
    marginTop: 20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  signatureSection: {
    marginTop: 30,
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1pt solid #333333',
    width: 200,
    marginTop: 40,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: 5,
  },
  signatureLabel: {
    fontSize: config.fontSize === 'small' ? 9 : config.fontSize === 'medium' ? 10 : 11,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
});

export function ConformidadPDFTemplate({ conformidad, config, customLayout }: ConformidadPDFTemplateProps) {
  const styles = createStyles(config);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header con diseño similar a la imagen de referencia */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              {config.showLogo && (
                <Image
                  style={styles.logo}
                  src="/lovable-uploads/3fdb70c9-ecc9-4a0a-b0a5-7636c918b417.png"
                />
              )}
            </View>
            
            <View style={styles.titleSection}>
              <Text style={styles.title}>CONFORMIDAD DEL SERVICIO RECIBIDO</Text>
            </View>
            
            <View style={styles.rightHeader}>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerLabel}>Código:</Text>
                <Text style={styles.headerValue}>{conformidad.id_correlativo}</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerLabel}>Versión:</Text>
                <Text style={styles.headerValue}>2.4</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerLabel}>Fecha:</Text>
                <Text style={styles.headerValue}>{formatDate(conformidad.fecha_conformidad)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Formulario con diseño de campos */}
        <View style={styles.formContainer}>
          {/* ID Correlativo */}
          <View style={styles.fullWidthField}>
            <Text style={styles.fieldLabel}>ID Correlativo</Text>
            <Text style={styles.fieldValue}>{conformidad.id_correlativo}</Text>
          </View>

          {/* Proveedor y RUC */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Proveedor</Text>
              <Text style={styles.fieldValue}>{conformidad.proveedor}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>RUC</Text>
              <Text style={styles.fieldValue}>{conformidad.ruc}</Text>
            </View>
          </View>

          {/* Nro Factura y Nro Centro de Costo */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nro Factura</Text>
              <Text style={styles.fieldValue}>{conformidad.nro_factura}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nro Centro de Costo</Text>
              <Text style={styles.fieldValue}>{conformidad.nro_centro_costo}</Text>
            </View>
          </View>

          {/* Nro Orden Servicio y Nro OF */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nro Orden Servicio</Text>
              <Text style={styles.fieldValue}>{conformidad.nro_orden_servicio}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nro OF</Text>
              <Text style={styles.fieldValue}>{conformidad.nro_of}</Text>
            </View>
          </View>

          {/* Responsable y Fecha de Conformidad */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Responsable</Text>
              <Text style={styles.fieldValue}>{conformidad.responsable}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Fecha de Conformidad</Text>
              <Text style={styles.fieldValue}>{formatDate(conformidad.fecha_conformidad)}</Text>
            </View>
          </View>

          {/* Descripción Servicio */}
          <View style={styles.fullWidthField}>
            <Text style={styles.fieldLabel}>Descripción Servicio</Text>
            <Text style={[styles.fieldValue, styles.textAreaField]}>{conformidad.descripcion_servicio}</Text>
          </View>

          {/* Conformidad */}
          <View style={styles.conformitySection}>
            <Text style={styles.conformityLabel}>Conformidad</Text>
            <View style={styles.radioGroup}>
              <View style={[styles.radioButton, conformidad.conformidad && styles.radioButtonSelected]} />
            </View>
          </View>

          {/* Observaciones */}
          <View style={styles.observationsSection}>
            <Text style={styles.fieldLabel}>Observaciones</Text>
            <Text style={[styles.fieldValue, styles.textAreaField]}>
              {conformidad.observaciones || 'Sin observaciones'}
            </Text>
          </View>

          {/* Nota */}
          <Text style={styles.noteText}>
            Nota: Para la recepción de su comprobante de pago, se debe adjuntar al presente formato, junto con la orden de servicio y demás requisitos indicados en la misma. Este documento es obligatorio.
          </Text>

          {/* Firma */}
          {config.includeSignature && (
            <View style={styles.signatureSection}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>{conformidad.responsable}</Text>
                <Text style={styles.signatureLabel}>Usuario Responsable</Text>
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}