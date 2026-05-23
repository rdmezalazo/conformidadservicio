import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Building2, Users } from 'lucide-react';
import { ConfiguracionVisualForm } from '@/components/ConfiguracionVisualForm';
import { ConfiguracionAreasForm } from '@/components/ConfiguracionAreasForm';
import { ConfiguracionUsuariosForm } from '@/components/ConfiguracionUsuariosForm';
import { EstilosVisualesEditor } from '@/components/EstilosVisualesEditor';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Configuracion: React.FC = () => {
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const handleSaveAll = () => {
    // Aquí se implementaría la lógica para guardar todos los cambios pendientes
    toast({
      title: "Configuración guardada",
      description: "Todos los cambios han sido guardados exitosamente"
    });
    setHasChanges(false);
  };

  const handleRevertChanges = () => {
    // Aquí se implementaría la lógica para revertir cambios
    toast({
      title: "Cambios revertidos",
      description: "Se han revertido todos los cambios no guardados"
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
              <p className="text-sm text-muted-foreground">
                Personaliza la aplicación según tus necesidades
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRevertChanges}
              disabled={!hasChanges}
            >
              Revertir cambios
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={!hasChanges}
            >
              Guardar todo
            </Button>
          </div>
        </div>

        {/* Contenido principal */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="visual" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  <TabsTrigger value="visual" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Visual
                  </TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="editor-estilos" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Editor Estilos
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="areas" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Áreas
                  </TabsTrigger>
                  <TabsTrigger value="usuarios" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Responsables
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <div className="p-6">
                <TabsContent value="visual" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Personalización Visual
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Configura el tema, colores y estilos de la aplicación
                      </p>
                    </div>
                    <ConfiguracionVisualForm onChanges={setHasChanges} />
                  </div>
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="editor-estilos" className="mt-0">
                    <div className="space-y-4">
                      <div>
                  
                        <p className="text-sm text-muted-foreground">
                          Edita y personaliza los estilos visuales predefinidos: Moderno, Corporativo y Minimalista
                        </p>
                      </div>
                      <EstilosVisualesEditor onSave={() => setHasChanges(true)} />
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="areas" className="mt-0">
                  <div className="space-y-4">
                    <div>
                   
                      <p className="text-sm text-muted-foreground">
                        Gestiona las áreas de trabajo y sus características visuales
                      </p>
                    </div>
                    <ConfiguracionAreasForm onChanges={setHasChanges} />
                  </div>
                </TabsContent>

                <TabsContent value="usuarios" className="mt-0">
                  <div className="space-y-4">
                    <div>
                  
                      <p className="text-sm text-muted-foreground">
                        Administra los responsables de las diferentes áreas
                      </p>
                    </div>
                    <ConfiguracionUsuariosForm onChanges={setHasChanges} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
    </div>
  );
};

export default Configuracion;