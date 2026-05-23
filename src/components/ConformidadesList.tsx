import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { FileText, Download, Upload, Trash2, Edit, Plus, Table, LayoutGrid, Eye } from 'lucide-react';
import { generatePDFWithTemplate } from '@/utils/pdfGeneratorWithTemplate';
import { CSVUploader } from './CSVUploader';
import { ConformidadesTable } from './ConformidadesTable';
import { useAuth } from '@/hooks/useAuth';
import { useConformidades } from '@/hooks/useConformidades';
import { useUserArea } from '@/hooks/useUserArea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Conformidad } from '@/types/conformidad';
import { Link, useNavigate } from 'react-router-dom';

export function ConformidadesList() {
  const [showUploader, setShowUploader] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [includeFirma, setIncludeFirma] = useState(true);
  const { isAdmin } = useAuth();
  const { conformidades, isLoading, fetchConformidades, deleteConformidad } = useConformidades();
  const { userArea } = useUserArea();
  const navigate = useNavigate();

  // Generar título dinámico basado en el área del usuario
  const getTitle = () => {
    if (userArea === 'Producción') {
      return 'Conformidades de Producción';
    }
    return 'Conformidades Registradas';
  };

  const handleGeneratePDF = async (conformidad: Conformidad) => {
    try {
      // Usar el generador con plantilla que maneja firmas
      await generatePDFWithTemplate(conformidad, includeFirma);
      toast({
        title: 'PDF Generado',
        description: `El PDF se ha descargado correctamente${includeFirma ? ' con firma' : ''}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF',
        variant: 'destructive',
      });
    }
  };

  const handleUploaderSuccess = () => {
    fetchConformidades();
    setShowUploader(false);
  };

  const handleDeleteSingle = async (idCorrelativo: string) => {
    const success = await deleteConformidad(idCorrelativo);
    if (success) {
      // La lista se actualiza automáticamente en el hook
    }
  };

  const handleDeleteAll = async () => {
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Solo los administradores pueden eliminar todos los registros',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_all_conformidades');
      
      if (error) {
        console.error('Error deleting all conformidades:', error);
        toast({
          title: 'Error',
          description: error.message || 'No se pudieron eliminar los registros',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: `Se eliminaron ${data} registro(s) correctamente`,
        });
        fetchConformidades();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conformidades.length === 0) {
    return (
      <div className="space-y-6">
      {/* Header con botones de acción */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <div className="flex gap-2">
        </div>
        </div>


        {/* Estado vacío */}
        <Card className="text-center py-8">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay conformidades registradas</h3>
            <p className="text-muted-foreground">
              Crea tu primera conformidad utilizando el formulario o carga un archivo CSV
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botones principales */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{getTitle()}</h2>
          <p className="text-muted-foreground">
            {conformidades.length} conformidad{conformidades.length !== 1 ? 'es' : ''} registrada{conformidades.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 items-center">
        </div>
      </div>


      {/* Tabs para vista de tarjetas y tabla */}
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Vista Tarjetas
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Vista Tabla
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-6">
          {/* Lista de conformidades en tarjetas */}
          <div className="grid gap-4">
            {conformidades.map((conformidad) => (
              <Card key={conformidad.id_correlativo}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {conformidad.id_correlativo}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {conformidad.proveedor} - RUC: {conformidad.ruc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={conformidad.conformidad ? 'default' : 'destructive'}>
                        {conformidad.conformidad ? 'Conforme' : 'No Conforme'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/nueva-conformidad?edit=${conformidad.id_correlativo}`)}
                          title="Ver conformidad"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGeneratePDF(conformidad)}
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                title="Eliminar conformidad"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar conformidad?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la conformidad {conformidad.id_correlativo}.
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSingle(conformidad.id_correlativo)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Factura:</p>
                      <p className="text-muted-foreground">{conformidad.nro_factura}</p>
                    </div>
                    <div>
                      <p className="font-medium">Centro de Costo:</p>
                      <p className="text-muted-foreground">{conformidad.nro_centro_costo}</p>
                    </div>
                    <div>
                      <p className="font-medium">Orden de Servicio:</p>
                      <p className="text-muted-foreground">{conformidad.nro_orden_servicio}</p>
                    </div>
                    <div>
                      <p className="font-medium">Fecha:</p>
                      <p className="text-muted-foreground">
                        {format(new Date(conformidad.fecha_conformidad), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Solicitante:</p>
                      <p className="text-muted-foreground">{conformidad.solicitante}</p>
                    </div>
                    <div>
                      <p className="font-medium">Responsable:</p>
                      <p className="text-muted-foreground">{conformidad.responsable}</p>
                    </div>
                    <div>
                      <p className="font-medium">Área:</p>
                      <p className="text-muted-foreground">{conformidad.area}</p>
                    </div>
                    <div>
                      <p className="font-medium">OF:</p>
                      <p className="text-muted-foreground">{conformidad.nro_of}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium">Descripción del Servicio:</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {conformidad.descripcion_servicio}
                    </p>
                  </div>
                  {conformidad.observaciones && (
                    <div className="mt-2">
                      <p className="font-medium">Observaciones:</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        {conformidad.observaciones}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <ConformidadesTable includeFirma={includeFirma} />
        </TabsContent>
      </Tabs>
    </div>
  );
}