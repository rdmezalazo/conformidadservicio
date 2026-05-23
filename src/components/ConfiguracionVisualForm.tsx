import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Palette, Type } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { ConfiguracionVisual, ESTILOS_VISUALES_PRESETS } from '@/types/configuracion';
import { useConfiguracionVisual } from '@/hooks/useConfiguracion';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracionVisualFormProps {
  onChanges: (hasChanges: boolean) => void;
}

export const ConfiguracionVisualForm: React.FC<ConfiguracionVisualFormProps> = ({ onChanges }) => {
  const { theme, setTheme, isDark } = useTheme();
  const { configuracion, loading, updateConfiguracion } = useConfiguracionVisual();
  const [selectedStyle, setSelectedStyle] = useState('moderno');
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (configuracion) {
      setSelectedStyle(configuracion.estilo_visual);
    }
  }, [configuracion]);

  useEffect(() => {
    onChanges(hasLocalChanges);
  }, [hasLocalChanges, onChanges]);

  const handleThemeChange = (isDarkMode: boolean) => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
    setHasLocalChanges(true);
  };

  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId);
    setHasLocalChanges(true);
  };

  const handleSave = async () => {
    try {
      const selectedPreset = ESTILOS_VISUALES_PRESETS.find(p => p.id === selectedStyle);
      if (!selectedPreset) return;

      const configData = {
        tema: isDark ? 'dark' : 'light' as 'light' | 'dark',
        estilo_visual: selectedStyle as 'moderno' | 'corporativo' | 'minimalista',
        configuracion: selectedPreset.configuracion
      };

      await updateConfiguracion(configData);
      setHasLocalChanges(false);
      
      toast({
        title: "Configuración aplicada",
        description: "Los cambios se han aplicado a toda la aplicación",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
    }
  };

  const applyStyleToDocument = (preset: typeof ESTILOS_VISUALES_PRESETS[0]) => {
    const root = document.documentElement;
    
    // Convertir colores HSL del preset a formato correcto
    const convertHslToVar = (hslColor: string) => {
      // Remover 'hsl(' y ')' y extraer valores
      const values = hslColor.replace('hsl(', '').replace(')', '').split(',');
      return values.map(v => v.trim()).join(' ');
    };
    
    // Aplicar colores al root
    root.style.setProperty('--primary', convertHslToVar(preset.configuracion.colores.primario));
    root.style.setProperty('--secondary-custom', convertHslToVar(preset.configuracion.colores.secundario));
    root.style.setProperty('--accent', convertHslToVar(preset.configuracion.colores.acento));
    
    // Aplicar fuentes
    root.style.setProperty('--font-family-custom', preset.configuracion.fuentes.familia);
    document.body.style.fontFamily = preset.configuracion.fuentes.familia;
    
    // Agregar clase temporal al body para indicar vista previa
    document.body.classList.add('preview-mode');
    
    toast({
      title: "Vista previa aplicada",
      description: `Estilo ${preset.nombre} aplicado temporalmente`,
    });
  };

  const resetPreview = () => {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary-custom');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--font-family-custom');
    
    // Remover clase de vista previa
    document.body.classList.remove('preview-mode');
    
    // Restaurar fuente original
    document.body.style.fontFamily = '';
    
    toast({
      title: "Vista previa restaurada",
      description: "Se han restaurado los colores originales",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Modo Claro/Oscuro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Modo de Color
          </CardTitle>
          <CardDescription>
            Cambia entre modo claro y oscuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="theme-switch">Modo oscuro</Label>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            <Switch
              id="theme-switch"
              checked={isDark}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estilos Visuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Estilos Visuales
          </CardTitle>
          <CardDescription>
            Selecciona un estilo predefinido para la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {ESTILOS_VISUALES_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedStyle === preset.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleStyleChange(preset.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{preset.nombre}</h4>
                      {selectedStyle === preset.id && (
                        <Badge variant="default" className="text-xs">Activo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{preset.descripcion}</p>
                    
                    {/* Preview de colores */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Colores:</span>
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: preset.configuracion.colores.primario }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: preset.configuracion.colores.secundario }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: preset.configuracion.colores.acento }}
                        />
                      </div>
                    </div>

                    {/* Preview de tipografía */}
                    <div className="flex items-center gap-2">
                      <Type className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Fuente: {preset.configuracion.fuentes.familia}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyStyleToDocument(preset);
                      }}
                    >
                      Vista previa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Botón para restablecer vista previa */}
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPreview}
                className="text-muted-foreground"
              >
                Restablecer vista previa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      {hasLocalChanges && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Tienes cambios sin guardar en la configuración visual
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasLocalChanges(false)}
            >
              Descartar
            </Button>
            <Button size="sm" onClick={handleSave}>
              Guardar cambios
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};