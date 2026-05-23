import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Download, Trash2, Search, Mail, Eye } from 'lucide-react';
import { generatePDFWithTemplate } from '@/utils/pdfGeneratorWithTemplate';
import { useConformidades } from '@/hooks/useConformidades';
import { useAuth } from '@/hooks/useAuth';
import { EmailDialog } from '@/components/EmailDialog';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface ConformidadesTableProps {
  includeFirma: boolean;
}

export function ConformidadesTable({ includeFirma }: ConformidadesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedConformidad, setSelectedConformidad] = useState<Conformidad | null>(null);
  const { conformidades, isLoading, deleteConformidad } = useConformidades();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const filteredConformidades = useMemo(() => {
    if (!searchTerm) return conformidades;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return conformidades.filter((conformidad) =>
      Object.values(conformidad).some((value) =>
        value?.toString().toLowerCase().includes(lowercaseSearch)
      )
    );
  }, [conformidades, searchTerm]);

  const handleGeneratePDF = async (conformidad: Conformidad) => {
    try {
      await generatePDFWithTemplate(conformidad, includeFirma);
      toast({
        title: 'PDF Generado',
        description: 'El PDF se ha descargado correctamente',
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

  const handleDeleteSingle = async (idCorrelativo: string) => {
    const success = await deleteConformidad(idCorrelativo);
    if (success) {
      // La lista se actualiza automáticamente en el hook
    }
  };

  const handleSendEmail = (conformidad: Conformidad) => {
    setSelectedConformidad(conformidad);
    setEmailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por todos los campos (orden de servicio, proveedor, área, etc.)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Correlativo</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Orden de Servicio</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConformidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay conformidades registradas'}
                </TableCell>
              </TableRow>
            ) : (
              filteredConformidades.map((conformidad) => (
                <TableRow key={conformidad.id_correlativo}>
                  <TableCell className="font-medium">
                    {conformidad.id_correlativo}
                  </TableCell>
                  <TableCell>{conformidad.proveedor}</TableCell>
                  <TableCell>{conformidad.area}</TableCell>
                  <TableCell>
                    {format(new Date(conformidad.fecha_conformidad), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conformidad.conformidad ? 'default' : 'destructive'}>
                      {conformidad.conformidad ? 'Conforme' : 'No Conforme'}
                    </Badge>
                  </TableCell>
                  <TableCell>{conformidad.nro_factura}</TableCell>
                  <TableCell>{conformidad.nro_orden_servicio}</TableCell>
                  <TableCell>{conformidad.responsable}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendEmail(conformidad)}
                        title="Enviar por Email"
                      >
                        <Mail className="h-4 w-4" />
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredConformidades.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredConformidades.length} de {conformidades.length} conformidades
        </p>
      )}

      {/* Diálogo de Email */}
      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        conformidad={selectedConformidad}
        includeFirma={includeFirma}
      />
    </div>
  );
}