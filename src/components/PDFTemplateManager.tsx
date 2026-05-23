import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePDFTemplates } from '@/hooks/usePDFTemplates';
import { Save, Star, Trash2, Settings, Eye, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFTemplateManagerProps {
  currentLayoutData: any[];
  currentPdfConfig: any;
  onLoadTemplate: (layoutData: any[], pdfConfig: any) => void;
  onEditTemplate?: (layoutData: any[], pdfConfig: any, templateName?: string, templateId?: string) => void;
  showSaveDialog?: boolean;
  onSaveDialogClose?: () => void;
  simpleMode?: boolean; // Si es true, solo muestra el diálogo
}

export function PDFTemplateManager({ 
  currentLayoutData, 
  currentPdfConfig, 
  onLoadTemplate,
  onEditTemplate,
  showSaveDialog: initialShowSaveDialog = false,
  onSaveDialogClose,
  simpleMode = false
}: PDFTemplateManagerProps) {
  const { 
    templates, 
    defaultTemplate, 
    loading, 
    saveTemplate, 
    setAsDefaultTemplate, 
    deleteTemplate 
  } = usePDFTemplates();
  
  const [showSaveDialog, setShowSaveDialog] = useState(initialShowSaveDialog);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sincronizar el estado del diálogo con la prop externa
  useEffect(() => {
    setShowSaveDialog(initialShowSaveDialog);
  }, [initialShowSaveDialog]);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la plantilla es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await saveTemplate(
        templateName.trim(),
        templateDescription.trim(),
        currentLayoutData,
        currentPdfConfig,
        setAsDefault
      );
      
      // Resetear formulario
      setTemplateName('');
      setTemplateDescription('');
      setSetAsDefault(false);
      setShowSaveDialog(false);
      onSaveDialogClose?.();
      
      toast({
        title: "Éxito",
        description: "Plantilla guardada correctamente",
      });
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadTemplate = (template: any) => {
    try {
      const layoutData = Array.isArray(template.layout_data) 
        ? template.layout_data 
        : JSON.parse(template.layout_data as string);
      
      const pdfConfig = typeof template.pdf_config === 'object' 
        ? template.pdf_config 
        : JSON.parse(template.pdf_config as string);
      
      onLoadTemplate(layoutData, pdfConfig);
      
      toast({
        title: "Éxito",
        description: `Plantilla "${template.name}" cargada correctamente`,
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Error",
        description: "Error al cargar la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template: any) => {
    if (!onEditTemplate) return;
    
    try {
      const layoutData = Array.isArray(template.layout_data) 
        ? template.layout_data 
        : JSON.parse(template.layout_data as string);
      
      const pdfConfig = typeof template.pdf_config === 'object' 
        ? template.pdf_config 
        : JSON.parse(template.pdf_config as string);
      
      onEditTemplate(layoutData, pdfConfig, template.name, template.id);
      
      toast({
        title: "Éxito",
        description: `Plantilla "${template.name}" cargada en el editor`,
      });
    } catch (error) {
      console.error('Error loading template for editing:', error);
      toast({
        title: "Error",
        description: "Error al cargar la plantilla para editar",
        variant: "destructive",
      });
    }
  };

  const handleSetAsDefault = async (templateId: string) => {
    try {
      await setAsDefaultTemplate(templateId);
    } catch (error) {
      console.error('Error setting default template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (window.confirm(`¿Está seguro de eliminar la plantilla "${templateName}"?`)) {
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  // Si está en modo simple, solo mostrar el diálogo
  if (simpleMode) {
    return (
      <Dialog open={showSaveDialog} onOpenChange={(open) => {
        setShowSaveDialog(open);
        if (!open) onSaveDialogClose?.();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Plantilla PDF</DialogTitle>
            <DialogDescription>
              Guarde el diseño actual como una plantilla para usar en todas las conformidades
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nombre de la Plantilla *</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej: Plantilla Estándar"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Descripción</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Descripción opcional de la plantilla"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="set-as-default"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="set-as-default">
                Establecer como plantilla predeterminada
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSaveDialog(false);
                onSaveDialogClose?.();
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Gestión de Plantillas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Cargando plantillas...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay plantillas guardadas</p>
            <p className="text-sm">Guarde el diseño actual para crear su primera plantilla</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {template.is_default && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Por defecto
                      </Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Creada: {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Plantilla
                  </Button>
                  {onEditTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetAsDefault(template.id)}
                    disabled={template.is_default}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Asignar Preestablecida
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}