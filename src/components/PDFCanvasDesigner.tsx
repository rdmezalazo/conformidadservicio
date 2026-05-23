import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect, Text as FabricText, Image as FabricImage, Line, Circle as FabricCircle } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Move, 
  Type, 
  Square, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
   RotateCcw,
   Trash2,
   Save,
   RefreshCw,
   Copy,
   Image as ImageIcon,
   Minus,
   RectangleHorizontal,
   Circle
} from 'lucide-react';
import { toast } from 'sonner';

interface PDFCanvasDesignerProps {
  onSaveLayout: (layout: any) => void;
  onLayoutChange?: (layout: any) => void;
  currentEditingTemplate?: {id: string, name: string} | null;
  onUpdateTemplate?: (templateId: string, layoutData: any[], pdfConfig: any) => void;
  onSaveAsTemplate?: () => void;
  pdfConfig?: any;
  initialLayoutData?: any[];
}

interface FieldElement {
  id: string;
  type: 'text' | 'field' | 'line' | 'box' | 'image';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderColor?: string;
  src?: string;
  fieldId?: string; // ID del campo de conformidad vinculado
}

// Campos disponibles de la tabla conformidades
const conformidadFields = [
  { id: 'id_correlativo', label: 'ID Correlativo' },
  { id: 'ruc', label: 'RUC' },
  { id: 'proveedor', label: 'Proveedor' },
  { id: 'nro_factura', label: 'Número de Factura' },
  { id: 'nro_centro_costo', label: 'Número Centro de Costo' },
  { id: 'nro_orden_servicio', label: 'Número Orden de Servicio' },
  { id: 'nro_of', label: 'Número OF' },
  { id: 'solicitante', label: 'Solicitante' },
  { id: 'fecha_conformidad', label: 'Fecha de Conformidad' },
  { id: 'descripcion_servicio', label: 'Descripción del Servicio' },
  { id: 'conformidad', label: 'Conformidad (Sí/No)' },
  { id: 'observaciones', label: 'Observaciones' },
  { id: 'responsable', label: 'Responsable' },
  { id: 'area', label: 'Área' },
  { id: 'usuario_id', label: 'Usuario ID' },
];

export function PDFCanvasDesigner({ 
  onSaveLayout, 
  onLayoutChange, 
  currentEditingTemplate,
  onUpdateTemplate,
  onSaveAsTemplate,
  pdfConfig,
  initialLayoutData
}: PDFCanvasDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'field' | 'box' | 'image' | 'line' | 'rectangle' | 'circle'>('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [loadedTemplateData, setLoadedTemplateData] = useState<any>(null);
  
  // Función para cargar layout desde datos de plantilla
  const loadLayoutFromData = (canvas: FabricCanvas, layoutData: any[]) => {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    
    if (!layoutData || !Array.isArray(layoutData)) {
      console.log('No layout data provided, loading defaults');
      initializeDefaultFields(canvas);
      return;
    }
    
    console.log('Loading template layout data:', layoutData);
    
    layoutData.forEach((item) => {
      if (item.type === 'text') {
        const text = new FabricText(item.text || item.label || 'Texto', {
          left: item.left || item.x || 0,
          top: item.top || item.y || 0,
          fontSize: item.fontSize || 12,
          fontWeight: item.fontWeight || 'normal',
          textAlign: item.textAlign || 'left',
          selectable: true,
          hasControls: true,
        });
        // Asignar fieldId si existe
        if (item.fieldId) {
          (text as any).fieldId = item.fieldId;
        }
        canvas.add(text);
      } else if (item.type === 'rect') {
        const rect = new Rect({
          left: item.left || item.x || 0,
          top: item.top || item.y || 0,
          width: item.width || 100,
          height: item.height || 50,
          fill: item.fill || '#F5F5F5',
          stroke: item.stroke || '#CCCCCC',
          strokeWidth: item.strokeWidth || 1,
          selectable: true,
          hasControls: true,
        });
        // Asignar fieldId si existe
        if (item.fieldId) {
          (rect as any).fieldId = item.fieldId;
        }
        canvas.add(rect);
      } else if (item.type === 'image' && item.src) {
        FabricImage.fromURL(item.src).then((img) => {
          img.set({
            left: item.left || item.x || 0,
            top: item.top || item.y || 0,
            scaleX: item.width ? item.width / (img.width || 1) : 1,
            scaleY: item.height ? item.height / (img.height || 1) : 1,
            selectable: true,
            hasControls: true,
          });
          canvas.add(img);
          canvas.renderAll();
        });
      }
    });
    
    canvas.renderAll();
  };
  
  // Elementos predefinidos del formulario de conformidad
  const defaultFields: FieldElement[] = [
    { id: 'logo', type: 'image', label: 'Logo', x: 50, y: 50, width: 60, height: 45, src: '/lovable-uploads/3fdb70c9-ecc9-4a0a-b0a5-7636c918b417.png' },
    { id: 'header', type: 'text', label: 'CONFORMIDAD DEL SERVICIO RECIBIDO', x: 200, y: 50, width: 400, height: 30, fontSize: 18, textAlign: 'center' },
    { id: 'correlativo', type: 'field', label: 'ID Correlativo', x: 50, y: 120, width: 500, height: 25 },
    { id: 'proveedor', type: 'field', label: 'Proveedor', x: 50, y: 160, width: 240, height: 25 },
    { id: 'ruc', type: 'field', label: 'RUC', x: 310, y: 160, width: 240, height: 25 },
    { id: 'factura', type: 'field', label: 'Nro Factura', x: 50, y: 200, width: 240, height: 25 },
    { id: 'centro_costo', type: 'field', label: 'Nro Centro de Costo', x: 310, y: 200, width: 240, height: 25 },
    { id: 'orden_servicio', type: 'field', label: 'Nro Orden Servicio', x: 50, y: 240, width: 240, height: 25 },
    { id: 'nro_of', type: 'field', label: 'Nro OF', x: 310, y: 240, width: 240, height: 25 },
    { id: 'responsable', type: 'field', label: 'Responsable', x: 50, y: 280, width: 240, height: 25 },
    { id: 'fecha', type: 'field', label: 'Fecha de Conformidad', x: 310, y: 280, width: 240, height: 25 },
    { id: 'descripcion', type: 'field', label: 'Descripción Servicio', x: 50, y: 320, width: 500, height: 80 },
    { id: 'conformidad', type: 'field', label: 'Conformidad', x: 50, y: 420, width: 240, height: 25 },
    { id: 'observaciones', type: 'field', label: 'Observaciones', x: 50, y: 460, width: 500, height: 80 },
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 1000,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);
    
    // Inicializar con campos predeterminados solo si no hay plantilla siendo editada
    if (!currentEditingTemplate) {
      initializeDefaultFields(canvas);
    }

    // Event listeners
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Event listener para cambios en el layout
    canvas.on('object:modified', () => {
      emitLayoutChange(canvas);
    });

    canvas.on('object:added', () => {
      emitLayoutChange(canvas);
    });

    canvas.on('object:removed', () => {
      emitLayoutChange(canvas);
    });

    toast("Canvas de diseño listo!");

    return () => {
      canvas.dispose();
    };
  }, [currentEditingTemplate]);

  // Effect para cargar datos de plantilla existente
  useEffect(() => {
    if (fabricCanvas && initialLayoutData && currentEditingTemplate) {
      console.log('Loading template data into canvas:', initialLayoutData);
      loadLayoutFromData(fabricCanvas, initialLayoutData);
      setLoadedTemplateData(initialLayoutData);
    }
  }, [fabricCanvas, initialLayoutData, currentEditingTemplate]);

  const emitLayoutChange = (canvas: FabricCanvas) => {
    if (!onLayoutChange) return;
    
    const objects = canvas.getObjects();
    const layout = objects.map((obj, index) => ({
      id: `element-${index}`,
      type: obj.type,
      left: obj.left,
      top: obj.top,
      width: obj.width * (obj.scaleX || 1),
      height: obj.height * (obj.scaleY || 1),
      // Propiedades específicas de texto
      ...(obj.type === 'text' && {
        text: (obj as any).text,
        fontSize: (obj as any).fontSize,
        fontWeight: (obj as any).fontWeight,
        textAlign: (obj as any).textAlign,
        fieldId: (obj as any).fieldId,
      }),
      // Propiedades específicas de rectángulos
      ...(obj.type === 'rect' && {
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        fieldId: (obj as any).fieldId,
      }),
      // Propiedades específicas de imágenes
      ...(obj.type === 'image' && {
        src: (obj as any).src || (obj as any)._element?.src,
      }),
      // Propiedades específicas de líneas
      ...(obj.type === 'line' && {
        x1: (obj as any).x1,
        y1: (obj as any).y1,
        x2: (obj as any).x2,
        y2: (obj as any).y2,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
      }),
      // Propiedades específicas de círculos
      ...(obj.type === 'circle' && {
        radius: (obj as any).radius,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
      }),
    }));
    
    onLayoutChange(layout);
  };

  const initializeDefaultFields = (canvas: FabricCanvas) => {
    defaultFields.forEach((field) => {
      if (field.type === 'text') {
        const text = new FabricText(field.label, {
          left: field.x,
          top: field.y,
          fontSize: field.fontSize || 12,
          fontWeight: 'bold',
          textAlign: field.textAlign || 'left',
          selectable: true,
          hasControls: true,
        });
        canvas.add(text);
      } else if (field.type === 'field') {
        // Crear etiqueta (ahora movible)
        const label = new FabricText(field.label, {
          left: field.x,
          top: field.y - 20,
          fontSize: 10,
          fontWeight: 'bold',
          selectable: true,
          hasControls: true,
        });
        
        // Crear campo
        const fieldBox = new Rect({
          left: field.x,
          top: field.y,
          width: field.width,
          height: field.height,
          fill: '#F5F5F5',
          stroke: '#CCCCCC',
          strokeWidth: 1,
          selectable: true,
          hasControls: true,
        });

        canvas.add(label, fieldBox);
      } else if (field.type === 'image' && field.src) {
        // Crear imagen
        FabricImage.fromURL(field.src).then((img) => {
          img.set({
            left: field.x,
            top: field.y,
            scaleX: field.width / (img.width || 1),
            scaleY: field.height / (img.height || 1),
            selectable: true,
            hasControls: true,
          });
          canvas.add(img);
        });
      }
    });
  };

  const handleToolClick = (tool: typeof selectedTool) => {
    setSelectedTool(tool);
    
    if (!fabricCanvas) return;

    // Deshabilitar modo de dibujo para todas las herramientas
    fabricCanvas.isDrawingMode = false;

    if (tool === 'text') {
      const text = new FabricText('Nuevo Texto', {
        left: 100,
        top: 100,
        fontSize: 12,
        selectable: true,
        hasControls: true,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    } else if (tool === 'field') {
      const fieldBox = new Rect({
        left: 100,
        top: 100,
        width: 200,
        height: 25,
        fill: '#F5F5F5',
        stroke: '#CCCCCC',
        strokeWidth: 1,
        selectable: true,
        hasControls: true,
      });
      fabricCanvas.add(fieldBox);
      fabricCanvas.setActiveObject(fieldBox);
    } else if (tool === 'box') {
      const box = new Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 100,
        fill: 'transparent',
        stroke: '#333333',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
      });
      fabricCanvas.add(box);
      fabricCanvas.setActiveObject(box);
    } else if (tool === 'image') {
      // Crear input file para subir imagen
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataURL = event.target?.result as string;
            FabricImage.fromURL(dataURL).then((img) => {
              img.set({
                left: 100,
                top: 100,
                scaleX: 0.5,
                scaleY: 0.5,
                selectable: true,
                hasControls: true,
              });
              fabricCanvas.add(img);
              fabricCanvas.setActiveObject(img);
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else if (tool === 'line') {
      const line = new Line([100, 100, 200, 100], {
        stroke: '#333333',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
      });
      fabricCanvas.add(line);
      fabricCanvas.setActiveObject(line);
    } else if (tool === 'rectangle') {
      const rectangle = new Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 100,
        fill: 'transparent',
        stroke: '#333333',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
      });
      fabricCanvas.add(rectangle);
      fabricCanvas.setActiveObject(rectangle);
    } else if (tool === 'circle') {
      const circle = new FabricCircle({
        left: 100,
        top: 100,
        radius: 50,
        fill: 'transparent',
        stroke: '#333333',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    }
  };

  const handleAlign = (alignment: 'left' | 'center' | 'right') => {
    if (!fabricCanvas || !selectedObject) return;
    
    const canvasWidth = fabricCanvas.width || 600;
    
    switch (alignment) {
      case 'left':
        selectedObject.set('left', 50);
        break;
      case 'center':
        selectedObject.set('left', (canvasWidth - selectedObject.width * selectedObject.scaleX) / 2);
        break;
      case 'right':
        selectedObject.set('left', canvasWidth - selectedObject.width * selectedObject.scaleX - 50);
        break;
    }
    
    fabricCanvas.renderAll();
    emitLayoutChange(fabricCanvas);
  };

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
    
    fabricCanvas.remove(selectedObject);
    setSelectedObject(null);
    toast("Elemento eliminado");
  };

  const handleReset = () => {
    if (!fabricCanvas) return;
    
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    initializeDefaultFields(fabricCanvas);
    toast("Canvas reiniciado");
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    const layout = objects.map((obj, index) => ({
      id: `element-${index}`,
      type: obj.type,
      left: obj.left,
      top: obj.top,
      width: obj.width * (obj.scaleX || 1),
      height: obj.height * (obj.scaleY || 1),
      // Propiedades específicas de texto
      ...(obj.type === 'text' && {
        text: (obj as any).text,
        fontSize: (obj as any).fontSize,
        fontWeight: (obj as any).fontWeight,
        textAlign: (obj as any).textAlign,
        fieldId: (obj as any).fieldId,
      }),
      // Propiedades específicas de rectángulos
      ...(obj.type === 'rect' && {
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        fieldId: (obj as any).fieldId,
      }),
    }));
    
    onSaveLayout(layout);
    toast("Layout guardado exitosamente!");
  };

  const getCurrentLayout = () => {
    if (!fabricCanvas) return [];
    
    const objects = fabricCanvas.getObjects();
    return objects.map((obj, index) => ({
      id: `element-${index}`,
      type: obj.type,
      left: obj.left,
      top: obj.top,
      width: obj.width * (obj.scaleX || 1),
      height: obj.height * (obj.scaleY || 1),
      // Propiedades específicas de texto
      ...(obj.type === 'text' && {
        text: (obj as any).text,
        fontSize: (obj as any).fontSize,
        fontWeight: (obj as any).fontWeight,
        textAlign: (obj as any).textAlign,
        fieldId: (obj as any).fieldId,
      }),
      // Propiedades específicas de rectángulos
      ...(obj.type === 'rect' && {
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        fieldId: (obj as any).fieldId,
      }),
      // Propiedades específicas de imágenes
      ...(obj.type === 'image' && {
        src: (obj as any).src || (obj as any)._element?.src,
      }),
      // Propiedades específicas de líneas
      ...(obj.type === 'line' && {
        x1: (obj as any).x1,
        y1: (obj as any).y1,
        x2: (obj as any).x2,
        y2: (obj as any).y2,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
      }),
      // Propiedades específicas de círculos
      ...(obj.type === 'circle' && {
        radius: (obj as any).radius,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
      }),
    }));
  };

  const handleUpdateTemplate = async () => {
    if (!currentEditingTemplate || !onUpdateTemplate) return;
    
    const layout = getCurrentLayout();
    try {
      await onUpdateTemplate(currentEditingTemplate.id, layout, pdfConfig || {});
      toast(`Plantilla "${currentEditingTemplate.name}" actualizada exitosamente!`);
    } catch (error) {
      console.error('Error updating template:', error);
      toast("Error al actualizar la plantilla");
    }
  };

  const handleSaveAsTemplate = () => {
    if (!onSaveAsTemplate) return;
    onSaveAsTemplate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-end">
            <div className="flex gap-2">
              <Badge variant={selectedTool === 'select' ? 'default' : 'secondary'}>
                Herramienta: {selectedTool}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
            <Button
              variant={selectedTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('select')}
            >
              <Move className="w-4 h-4 mr-2" />
              Seleccionar
            </Button>
            
            <Button
              variant={selectedTool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('text')}
            >
              <Type className="w-4 h-4 mr-2" />
              Texto
            </Button>
            
            <Button
              variant={selectedTool === 'field' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('field')}
            >
              <Square className="w-4 h-4 mr-2" />
              Campo
            </Button>
            
            <Button
              variant={selectedTool === 'box' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('box')}
            >
              <Square className="w-4 h-4 mr-2" />
              Caja
            </Button>
            
            <Button
              variant={selectedTool === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('image')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Imagen
            </Button>
            
            <Button
              variant={selectedTool === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('line')}
            >
              <Minus className="w-4 h-4 mr-2" />
              Línea
            </Button>
            
            <Button
              variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('rectangle')}
            >
              <RectangleHorizontal className="w-4 h-4 mr-2" />
              Rectángulo
            </Button>
            
            <Button
              variant={selectedTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('circle')}
            >
              <Circle className="w-4 h-4 mr-2" />
              Redondo
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAlign('left')}
              disabled={!selectedObject}
            >
              <AlignLeft className="w-4 h-4 mr-2" />
              Izquierda
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAlign('center')}
              disabled={!selectedObject}
            >
              <AlignCenter className="w-4 h-4 mr-2" />
              Centro
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAlign('right')}
              disabled={!selectedObject}
            >
              <AlignRight className="w-4 h-4 mr-2" />
              Derecha
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={!selectedObject}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>

            {currentEditingTemplate ? (
              // Botones para plantilla existente
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleUpdateTemplate}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAsTemplate}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Guardar como
                </Button>
              </>
            ) : (
              // Botón para plantilla nueva
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Layout
              </Button>
            )}
          </div>

          {/* Canvas y propiedades lado a lado */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Canvas - Más espacio */}
            <div className="xl:col-span-3">
              <div className="border rounded-lg overflow-hidden bg-white shadow-inner">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full border-dashed border-2 border-muted"
                />
              </div>
            </div>

            {/* Propiedades del elemento - Panel compacto */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {selectedObject ? 'Propiedades del Elemento' : 'Selecciona un elemento para editar'}
                  </CardTitle>
                </CardHeader>
                {selectedObject ? (
                  <CardContent className="space-y-4">
                    {/* Posición y tamaño */}
                    <div>
                      <h4 className="text-xs font-semibold mb-2 text-muted-foreground">POSICIÓN Y TAMAÑO</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium">X:</label>
                          <input
                            type="number"
                            value={Math.round(selectedObject.left || 0)}
                            onChange={(e) => {
                              selectedObject.set('left', parseInt(e.target.value));
                              fabricCanvas?.renderAll();
                              emitLayoutChange(fabricCanvas);
                            }}
                            className="w-full p-1 text-xs border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Y:</label>
                          <input
                            type="number"
                            value={Math.round(selectedObject.top || 0)}
                            onChange={(e) => {
                              selectedObject.set('top', parseInt(e.target.value));
                              fabricCanvas?.renderAll();
                              emitLayoutChange(fabricCanvas);
                            }}
                            className="w-full p-1 text-xs border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Ancho:</label>
                          <input
                            type="number"
                            value={Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1))}
                            onChange={(e) => {
                              const newWidth = parseInt(e.target.value);
                              selectedObject.set('scaleX', newWidth / selectedObject.width);
                              fabricCanvas?.renderAll();
                              emitLayoutChange(fabricCanvas);
                            }}
                            className="w-full p-1 text-xs border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Alto:</label>
                          <input
                            type="number"
                            value={Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1))}
                            onChange={(e) => {
                              const newHeight = parseInt(e.target.value);
                              selectedObject.set('scaleY', newHeight / selectedObject.height);
                              fabricCanvas?.renderAll();
                              emitLayoutChange(fabricCanvas);
                            }}
                            className="w-full p-1 text-xs border rounded"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Propiedades de texto */}
                    {selectedObject.type === 'text' && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">TEXTO</h4>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium">Contenido:</label>
                              <input
                                type="text"
                                value={selectedObject.text || ''}
                                onChange={(e) => {
                                  selectedObject.set('text', e.target.value);
                                  fabricCanvas?.renderAll();
                                  emitLayoutChange(fabricCanvas);
                                }}
                                className="w-full p-1 text-xs border rounded"
                              />
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Campo:</label>
                              <select
                                value={selectedObject.fieldId || ''}
                                onChange={(e) => {
                                  selectedObject.set('fieldId', e.target.value);
                                  // Si se selecciona un campo, auto-llenar con texto descriptivo
                                  if (e.target.value) {
                                    const field = conformidadFields.find(f => f.id === e.target.value);
                                    if (field) {
                                      selectedObject.set('text', `{${field.label}}`);
                                    }
                                  }
                                  fabricCanvas?.renderAll();
                                  emitLayoutChange(fabricCanvas);
                                }}
                                className="w-full p-1 text-xs border rounded bg-background"
                              >
                                <option value="">Texto manual</option>
                                {conformidadFields.map((field) => (
                                  <option key={field.id} value={field.id}>
                                    {field.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Tipo de letra:</label>
                              <select
                                value={selectedObject.fontFamily || 'Arial'}
                                onChange={(e) => {
                                  selectedObject.set('fontFamily', e.target.value);
                                  fabricCanvas?.renderAll();
                                  emitLayoutChange(fabricCanvas);
                                }}
                                className="w-full p-1 text-xs border rounded"
                              >
                                <option value="Arial">Arial</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Courier New">Courier New</option>
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium">Tamaño:</label>
                                <input
                                  type="number"
                                  min="8"
                                  max="72"
                                  value={selectedObject.fontSize || 12}
                                  onChange={(e) => {
                                    selectedObject.set('fontSize', parseInt(e.target.value));
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="w-full p-1 text-xs border rounded"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium">Color:</label>
                                <input
                                  type="color"
                                  value={selectedObject.fill || '#000000'}
                                  onChange={(e) => {
                                    selectedObject.set('fill', e.target.value);
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="w-full h-6 border rounded"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Estilo:</label>
                              <div className="flex gap-1 mt-1">
                                <Button
                                  size="sm"
                                  variant={selectedObject.fontWeight === 'bold' ? 'default' : 'outline'}
                                  onClick={() => {
                                    const isBold = selectedObject.fontWeight === 'bold';
                                    selectedObject.set('fontWeight', isBold ? 'normal' : 'bold');
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  B
                                </Button>
                                <Button
                                  size="sm"
                                  variant={selectedObject.fontStyle === 'italic' ? 'default' : 'outline'}
                                  onClick={() => {
                                    const isItalic = selectedObject.fontStyle === 'italic';
                                    selectedObject.set('fontStyle', isItalic ? 'normal' : 'italic');
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="h-6 px-2 text-xs italic"
                                >
                                  I
                                </Button>
                                <Button
                                  size="sm"
                                  variant={selectedObject.underline ? 'default' : 'outline'}
                                  onClick={() => {
                                    selectedObject.set('underline', !selectedObject.underline);
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="h-6 px-2 text-xs underline"
                                >
                                  U
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Alineación:</label>
                              <div className="flex gap-1 mt-1">
                                <Button
                                  size="sm"
                                  variant={selectedObject.textAlign === 'left' ? 'default' : 'outline'}
                                  onClick={() => {
                                    selectedObject.set('textAlign', 'left');
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <AlignLeft className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={selectedObject.textAlign === 'center' ? 'default' : 'outline'}
                                  onClick={() => {
                                    selectedObject.set('textAlign', 'center');
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <AlignCenter className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={selectedObject.textAlign === 'right' ? 'default' : 'outline'}
                                  onClick={() => {
                                    selectedObject.set('textAlign', 'right');
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <AlignRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                     {/* Propiedades de rectángulo/campo */}
                     {selectedObject.type === 'rect' && (
                       <>
                         <Separator />
                         <div>
                           <h4 className="text-xs font-semibold mb-2 text-muted-foreground">CAMPO DE DATOS</h4>
                           <div className="space-y-2">
                             <div>
                               <label className="text-xs font-medium">Campo vinculado:</label>
                               <select
                                 value={selectedObject.fieldId || ''}
                                 onChange={(e) => {
                                   selectedObject.set('fieldId', e.target.value);
                                   fabricCanvas?.renderAll();
                                   emitLayoutChange(fabricCanvas);
                                 }}
                                 className="w-full p-1 text-xs border rounded bg-background"
                               >
                                 <option value="">Campo libre</option>
                                 {conformidadFields.map((field) => (
                                   <option key={field.id} value={field.id}>
                                     {field.label}
                                   </option>
                                 ))}
                               </select>
                             </div>
                           </div>
                         </div>
                         
                         <Separator />
                         <div>
                           <h4 className="text-xs font-semibold mb-2 text-muted-foreground">APARIENCIA</h4>
                           <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium">Color de fondo:</label>
                                <input
                                  type="color"
                                  value={selectedObject.fill || '#F5F5F5'}
                                  onChange={(e) => {
                                    selectedObject.set('fill', e.target.value);
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="w-full h-6 border rounded"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium">Color de borde:</label>
                                <input
                                  type="color"
                                  value={selectedObject.stroke || '#CCCCCC'}
                                  onChange={(e) => {
                                    selectedObject.set('stroke', e.target.value);
                                    fabricCanvas?.renderAll();
                                    emitLayoutChange(fabricCanvas);
                                  }}
                                  className="w-full h-6 border rounded"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Grosor del borde:</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={selectedObject.strokeWidth || 1}
                                onChange={(e) => {
                                  selectedObject.set('strokeWidth', parseInt(e.target.value));
                                  fabricCanvas?.renderAll();
                                  emitLayoutChange(fabricCanvas);
                                }}
                                className="w-full p-1 text-xs border rounded"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Propiedades de imagen */}
                    {selectedObject.type === 'image' && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">IMAGEN</h4>
                          <div>
                            <label className="text-xs font-medium">URL de imagen:</label>
                            <input
                              type="text"
                              value={selectedObject.src || ''}
                              onChange={(e) => {
                                const newSrc = e.target.value;
                                if (newSrc) {
                                  FabricImage.fromURL(newSrc).then((newImg) => {
                                    const currentLeft = selectedObject.left;
                                    const currentTop = selectedObject.top;
                                    const currentScaleX = selectedObject.scaleX;
                                    const currentScaleY = selectedObject.scaleY;
                                    
                                    fabricCanvas?.remove(selectedObject);
                                    newImg.set({
                                      left: currentLeft,
                                      top: currentTop,
                                      scaleX: currentScaleX,
                                      scaleY: currentScaleY,
                                      selectable: true,
                                      hasControls: true,
                                    });
                                    fabricCanvas?.add(newImg);
                                    fabricCanvas?.setActiveObject(newImg);
                                    setSelectedObject(newImg);
                                  });
                                }
                              }}
                              placeholder="Ingresa la URL de la imagen"
                              className="w-full p-1 text-xs border rounded"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                ) : (
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground text-sm">
                      Haz clic en cualquier elemento del canvas para ver y editar sus propiedades
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}