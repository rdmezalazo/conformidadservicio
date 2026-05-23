import { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { DynamicPDFTemplate } from './DynamicPDFTemplate';
import { PDFCanvasDesigner } from './PDFCanvasDesigner';
import { PDFTemplateManager } from './PDFTemplateManager';
import { usePDFTemplates } from '@/hooks/usePDFTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileDown, Eye, Palette, Edit, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Conformidad } from '@/types/conformidad';

interface PDFDesignerProps {
  conformidad?: Conformidad;
}

export function PDFDesigner({ conformidad }: PDFDesignerProps) {
  const { 
    defaultTemplate, 
    loading: templatesLoading, 
    updateTemplate,
    saveTemplate 
  } = usePDFTemplates();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [pdfConfig, setPdfConfig] = useState<{
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
  }>({
    showLogo: true,
    primaryColor: '#2563eb',
    fontSize: 'medium',
    includeSignature: true,
    companyInfo: {
      name: 'Tu Empresa S.A.',
      address: 'Av. Principal 123, Lima, Perú',
      phone: '+51 1 234-5678',
      email: 'contacto@tuempresa.com'
    }
  });

  const [customLayout, setCustomLayout] = useState<any>(null);
  const [dynamicLayout, setDynamicLayout] = useState<any>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [currentEditingTemplate, setCurrentEditingTemplate] = useState<{id: string, name: string} | null>(null);
  const [currentEditingTemplateData, setCurrentEditingTemplateData] = useState<any[] | null>(null);

  // Sample conformidad data for preview if none provided
  const sampleConformidad: Conformidad = conformidad || {
    id_correlativo: 'CONF-2024-001',
    ruc: '20123456789',
    proveedor: 'Proveedor Ejemplo S.A.C.',
    nro_factura: 'F001-0001234',
    nro_centro_costo: 'CC-001',
    nro_orden_servicio: 'OS-2024-001',
    nro_of: 'OF-001',
    solicitante: 'Juan Pérez García',
    fecha_conformidad: '2024-01-15',
    descripcion_servicio: 'Servicio de mantenimiento preventivo y correctivo de equipos informáticos.',
    responsable: 'María González',
    area: 'Sistemas',
    conformidad: true,
    observaciones: 'Servicio ejecutado satisfactoriamente según especificaciones técnicas.',
    usuario_id: 'user-123'
  };

  const handleConfigChange = (key: string, value: any) => {
    setPdfConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveLayout = (layout: any) => {
    setCustomLayout(layout);
    setDynamicLayout(layout);
    // Abrir el diálogo de guardar plantilla
    setShowTemplateDialog(true);
  };

  const handleLayoutChange = (layout: any) => {
    setDynamicLayout(layout);
  };

  const handleLoadTemplate = (layoutData: any[], pdfConfig: any) => {
    setPdfConfig(pdfConfig);
    setCustomLayout(layoutData);
    setDynamicLayout(layoutData);
    toast({
      title: "Plantilla cargada",
      description: "La plantilla se ha aplicado correctamente",
    });
  };

  const handleEditTemplate = (layoutData: any[], pdfConfig: any, templateName?: string, templateId?: string) => {
    setPdfConfig(pdfConfig);
    setCustomLayout(layoutData);
    setDynamicLayout(layoutData);
    setCurrentEditingTemplate(templateName && templateId ? { id: templateId, name: templateName } : null);
    setCurrentEditingTemplateData(layoutData);
    setActiveTab("editor");
    toast({
      title: "Plantilla cargada en editor",
      description: "La plantilla está lista para editar",
    });
  };

  const handleUpdateTemplate = async (templateId: string, layoutData: any[], pdfConfig: any) => {
    try {
      await updateTemplate(templateId, {
        layout_data: layoutData,
        pdf_config: pdfConfig,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Plantilla actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsTemplate = () => {
    // Limpiar la plantilla actual que se está editando y abrir el diálogo para guardar nueva
    setCurrentEditingTemplate(null);
    setCurrentEditingTemplateData(null);
    setShowTemplateDialog(true);
  };

  // Cargar plantilla por defecto al inicializar
  useEffect(() => {
    if (defaultTemplate && !customLayout && !dynamicLayout) {
      try {
        const layoutData = Array.isArray(defaultTemplate.layout_data) 
          ? defaultTemplate.layout_data 
          : JSON.parse(defaultTemplate.layout_data as string);
        
        const pdfConfig = typeof defaultTemplate.pdf_config === 'object' 
          ? defaultTemplate.pdf_config 
          : JSON.parse(defaultTemplate.pdf_config as string);
        
        setPdfConfig({ ...pdfConfig, ...pdfConfig });
        setCustomLayout(layoutData);
        setDynamicLayout(layoutData);
      } catch (error) {
        console.error('Error loading default template:', error);
      }
    }
  }, [defaultTemplate, customLayout, dynamicLayout]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Diseñador de PDF</h2>
          <p className="text-muted-foreground">
            Personaliza la plantilla para las conformidades de servicio
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadLink
            document={<DynamicPDFTemplate 
              conformidad={sampleConformidad} 
              config={pdfConfig} 
              layout={dynamicLayout || customLayout}
              signatureData={{
                userSignatureUrl: null,
                currentUserRole: "usuario_responsable",
                currentUserArea: "Logística",
                responsibleSignatureUrl: null
              }}
            />}
            fileName={`conformidad-${sampleConformidad.id_correlativo}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading}>
                <FileDown className="w-4 h-4 mr-2" />
                {loading ? 'Generando...' : 'Descargar PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Settings className="w-4 h-4 mr-2" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa del PDF
                <Badge variant="secondary">Plantilla: {selectedTemplate}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <PDFViewer
                  style={{
                    width: '100%',
                    height: '800px',
                    border: 'none'
                  }}
                >
                  <DynamicPDFTemplate 
                    conformidad={sampleConformidad} 
                    config={pdfConfig}
                    layout={dynamicLayout || customLayout}
                    signatureData={{
                      userSignatureUrl: null,
                      currentUserRole: "usuario_responsable",
                      currentUserArea: "Logística",
                      responsibleSignatureUrl: null
                    }}
                  />
                </PDFViewer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editor solo disponible cuando se edita desde plantillas */}
        {activeTab === "editor" && (
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Edit className="w-5 h-5" />
                   Editor Visual de Plantilla{currentEditingTemplate ? ` - ${currentEditingTemplate.name}` : ''}
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <PDFCanvasDesigner 
                   onSaveLayout={handleSaveLayout} 
                   onLayoutChange={handleLayoutChange}
                   currentEditingTemplate={currentEditingTemplate}
                   onUpdateTemplate={handleUpdateTemplate}
                   onSaveAsTemplate={handleSaveAsTemplate}
                   pdfConfig={pdfConfig}
                   initialLayoutData={currentEditingTemplateData}
                 />
              </CardContent>
            </Card>
            {/* Modal de guardar plantilla desde el editor */}
            {showTemplateDialog && (
              <PDFTemplateManager
                currentLayoutData={dynamicLayout || customLayout || []}
                currentPdfConfig={pdfConfig}
                onLoadTemplate={handleLoadTemplate}
                showSaveDialog={true}
                onSaveDialogClose={() => setShowTemplateDialog(false)}
                simpleMode={true}
              />
            )}
          </TabsContent>
        )}

        <TabsContent value="templates" className="space-y-4">
          <PDFTemplateManager
            currentLayoutData={dynamicLayout || customLayout || []}
            currentPdfConfig={pdfConfig}
            onLoadTemplate={handleLoadTemplate}
            onEditTemplate={handleEditTemplate}
          />
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="showLogo" className="text-sm font-medium">
                    Mostrar logo
                  </label>
                  <input
                    id="showLogo"
                    type="checkbox"
                    checked={pdfConfig.showLogo}
                    onChange={(e) => handleConfigChange('showLogo', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <label htmlFor="primaryColor" className="text-sm font-medium block mb-2">
                    Color primario
                  </label>
                  <input
                    id="primaryColor"
                    type="color"
                    value={pdfConfig.primaryColor}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className="h-10 w-20 border rounded"
                  />
                </div>

                <div>
                  <label htmlFor="fontSize" className="text-sm font-medium block mb-2">
                    Tamaño de fuente
                  </label>
                  <select
                    id="fontSize"
                    value={pdfConfig.fontSize}
                    onChange={(e) => handleConfigChange('fontSize', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="includeSignature" className="text-sm font-medium">
                    Incluir línea de firma
                  </label>
                  <input
                    id="includeSignature"
                    type="checkbox"
                    checked={pdfConfig.includeSignature}
                    onChange={(e) => handleConfigChange('includeSignature', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="text-sm font-medium block mb-2">
                    Nombre de la empresa
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={pdfConfig.companyInfo.name}
                    onChange={(e) => handleConfigChange('companyInfo', {
                      ...pdfConfig.companyInfo,
                      name: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label htmlFor="companyAddress" className="text-sm font-medium block mb-2">
                    Dirección
                  </label>
                  <input
                    id="companyAddress"
                    type="text"
                    value={pdfConfig.companyInfo.address}
                    onChange={(e) => handleConfigChange('companyInfo', {
                      ...pdfConfig.companyInfo,
                      address: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label htmlFor="companyPhone" className="text-sm font-medium block mb-2">
                    Teléfono
                  </label>
                  <input
                    id="companyPhone"
                    type="text"
                    value={pdfConfig.companyInfo.phone}
                    onChange={(e) => handleConfigChange('companyInfo', {
                      ...pdfConfig.companyInfo,
                      phone: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label htmlFor="companyEmail" className="text-sm font-medium block mb-2">
                    Email
                  </label>
                  <input
                    id="companyEmail"
                    type="email"
                    value={pdfConfig.companyInfo.email}
                    onChange={(e) => handleConfigChange('companyInfo', {
                      ...pdfConfig.companyInfo,
                      email: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}