import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Settings, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ESTILOS_VISUALES_PRESETS, EstiloVisualPreset } from '@/types/configuracion';

interface EstilosVisualesEditorProps {
  onSave?: (estilos: EstiloVisualPreset[]) => void;
}

const FUENTES_DISPONIBLES = [
  'Inter', 'Helvetica', 'Georgia', 'Arial', 'Times New Roman', 'Roboto', 'Open Sans', 'Lato', 'Poppins'
];

const PESOS_FUENTE = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' }
];

const TIPOS_BOTON = [
  { value: 'rounded', label: 'Redondeado' },
  { value: 'square', label: 'Cuadrado' },
  { value: 'pill', label: 'Pastilla' }
];

export const EstilosVisualesEditor: React.FC<EstilosVisualesEditorProps> = ({ onSave }) => {
  const [estilos, setEstilos] = useState<EstiloVisualPreset[]>([...ESTILOS_VISUALES_PRESETS]);
  const [estiloSeleccionado, setEstiloSeleccionado] = useState<string>('moderno');
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const estiloActual = estilos.find(e => e.id === estiloSeleccionado);

  const updateEstilo = (campo: string, valor: any) => {
    setEstilos(prev => prev.map(estilo => {
      if (estilo.id === estiloSeleccionado) {
        const newEstilo = { ...estilo };
        
        // Navegar a la propiedad anidada y actualizarla
        const campoPath = campo.split('.');
        let current: any = newEstilo;
        
        for (let i = 0; i < campoPath.length - 1; i++) {
          if (!current[campoPath[i]]) {
            current[campoPath[i]] = {};
          }
          current = current[campoPath[i]];
        }
        
        current[campoPath[campoPath.length - 1]] = valor;
        return newEstilo;
      }
      return estilo;
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(estilos);
    setHasChanges(false);
    toast({
      title: "Estilos guardados",
      description: "Los estilos visuales han sido actualizados exitosamente"
    });
  };

  const handleReset = () => {
    setEstilos([...ESTILOS_VISUALES_PRESETS]);
    setHasChanges(false);
    toast({
      title: "Estilos restablecidos",
      description: "Se han restaurado los estilos por defecto"
    });
  };

  // Función para convertir HSL a hexadecimal
  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#000000';
    
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Función para convertir hexadecimal a HSL
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const previewColor = (color: string) => {
    return (
      <div 
        className="w-8 h-8 rounded border-2 border-border"
        style={{ backgroundColor: color }}
      />
    );
  };

  if (!estiloActual) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Palette className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Editor de Estilos Visuales</h2>
            <p className="text-sm text-muted-foreground">
              Personaliza los estilos visuales predefinidos de la aplicación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Selector de estilo */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Estilo</CardTitle>
          <CardDescription>
            Elige el estilo visual que deseas editar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {estilos.map((estilo) => (
              <Card
                key={estilo.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  estiloSeleccionado === estilo.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setEstiloSeleccionado(estilo.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={estiloSeleccionado === estilo.id ? 'default' : 'secondary'}>
                        {estilo.nombre}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{estilo.descripcion}</p>
                    <div className="flex gap-1">
                      {previewColor(estilo.configuracion.colores.primario)}
                      {previewColor(estilo.configuracion.colores.secundario)}
                      {previewColor(estilo.configuracion.colores.acento)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor del estilo seleccionado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Editando: {estiloActual.nombre}
          </CardTitle>
          <CardDescription>
            {estiloActual.descripcion}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colores" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="colores" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colores
              </TabsTrigger>
              <TabsTrigger value="fuentes" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Fuentes
              </TabsTrigger>
              <TabsTrigger value="botones" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Botones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colores" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Color Primario */}
                <div className="space-y-3">
                  <Label htmlFor="color-primario">Color Primario</Label>
                  <div className="flex items-center gap-3">
                    {previewColor(estiloActual.configuracion.colores.primario)}
                    <Input
                      id="color-primario"
                      type="color"
                      value={hslToHex(estiloActual.configuracion.colores.primario)}
                      onChange={(e) => updateEstilo('configuracion.colores.primario', hexToHsl(e.target.value))}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      value={estiloActual.configuracion.colores.primario}
                      onChange={(e) => updateEstilo('configuracion.colores.primario', e.target.value)}
                      placeholder="hsl(220, 91%, 60%)"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Color Secundario */}
                <div className="space-y-3">
                  <Label htmlFor="color-secundario">Color Secundario</Label>
                  <div className="flex items-center gap-3">
                    {previewColor(estiloActual.configuracion.colores.secundario)}
                    <Input
                      id="color-secundario"
                      type="color"
                      value={hslToHex(estiloActual.configuracion.colores.secundario)}
                      onChange={(e) => updateEstilo('configuracion.colores.secundario', hexToHsl(e.target.value))}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      value={estiloActual.configuracion.colores.secundario}
                      onChange={(e) => updateEstilo('configuracion.colores.secundario', e.target.value)}
                      placeholder="hsl(262, 83%, 67%)"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Color Acento */}
                <div className="space-y-3">
                  <Label htmlFor="color-acento">Color de Acento</Label>
                  <div className="flex items-center gap-3">
                    {previewColor(estiloActual.configuracion.colores.acento)}
                    <Input
                      id="color-acento"
                      type="color"
                      value={hslToHex(estiloActual.configuracion.colores.acento)}
                      onChange={(e) => updateEstilo('configuracion.colores.acento', hexToHsl(e.target.value))}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      value={estiloActual.configuracion.colores.acento}
                      onChange={(e) => updateEstilo('configuracion.colores.acento', e.target.value)}
                      placeholder="hsl(142, 76%, 46%)"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fuentes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Familia de fuente */}
                <div className="space-y-3">
                  <Label>Familia de Fuente</Label>
                  <Select
                    value={estiloActual.configuracion.fuentes.familia}
                    onValueChange={(value) => updateEstilo('configuracion.fuentes.familia', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUENTES_DISPONIBLES.map((fuente) => (
                        <SelectItem key={fuente} value={fuente} style={{ fontFamily: fuente }}>
                          {fuente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Peso de fuente */}
                <div className="space-y-3">
                  <Label>Peso de Fuente</Label>
                  <Select
                    value={estiloActual.configuracion.fuentes.peso}
                    onValueChange={(value) => updateEstilo('configuracion.fuentes.peso', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PESOS_FUENTE.map((peso) => (
                        <SelectItem key={peso.value} value={peso.value}>
                          {peso.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Tamaños de fuente */}
              <div className="space-y-4">
                <h4 className="font-medium">Tamaños de Fuente</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(estiloActual.configuracion.fuentes.tamaños).map(([size, value]) => (
                    <div key={size} className="space-y-2">
                      <Label className="capitalize">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) => updateEstilo(`configuracion.fuentes.tamaños.${size}`, e.target.value)}
                        placeholder="1rem"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="botones" className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configura el estilo predeterminado de los botones para este tema visual.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TIPOS_BOTON.map((tipo) => (
                    <Card key={tipo.value} className="cursor-pointer hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">{tipo.label}</h4>
                          <Button 
                            className={
                              tipo.value === 'rounded' ? 'rounded-md' :
                              tipo.value === 'square' ? 'rounded-none' :
                              'rounded-full'
                            }
                            style={{ 
                              backgroundColor: estiloActual.configuracion.colores.primario,
                              fontFamily: estiloActual.configuracion.fuentes.familia
                            }}
                          >
                            Ejemplo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};