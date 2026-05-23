import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CSVRow {
  'ID Correlativo': string;
  'RUC': string;
  'Proveedor': string;
  'Nro Factura': string;
  'Nro Centro de Costo': string;
  'Nro Orden Servicio': string;
  'Nro OF': string;
  'Solicitante': string;
  'Fecha de Conformidad': string;
  'Descripción Servicio': string;
  'Conformidad': string;
  'Observaciones': string;
  'Responsable': string;
  'Área': string;
}

interface ProcessingResult {
  total: number;
  successful: number;
  failed: number;
  errors: { row: number; error: string }[];
}

interface CSVUploaderProps {
  onSuccess: () => void;
}

export function CSVUploader({ onSuccess }: CSVUploaderProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Error',
          description: 'Por favor selecciona un archivo CSV válido',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  // Función mejorada para parsear CSV que maneja mejor las comillas y comas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Comillas dobles dentro del campo
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string): CSVRow[] => {
    // Normalizar saltos de línea y filtrar líneas vacías
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log(`📁 Total de líneas en el archivo: ${lines.length}`);
    
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]);
    console.log(`📋 Headers encontrados (${headers.length}):`, headers);
    
    const data: CSVRow[] = [];
    let skippedRows = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || ''; // Asegurar que no sea undefined
        });
        data.push(row);
      } else {
        console.warn(`⚠️ Fila ${i + 1} descartada: headers=${headers.length}, values=${values.length}`, values);
        skippedRows++;
      }
    }
    
    console.log(`✅ Filas parseadas correctamente: ${data.length}`);
    console.log(`❌ Filas descartadas: ${skippedRows}`);
    return data;
  };

  const convertRowToDBFormat = (row: CSVRow, rowIndex: number) => {
    try {
      // Procesar fecha con validación mejorada
      let fechaConformidad = new Date().toISOString().split('T')[0]; // Fecha actual por defecto
      const fechaInput = (row['Fecha de Conformidad'] || '').toString().trim();
      
      if (fechaInput) {
        if (fechaInput.includes('/')) {
          const parts = fechaInput.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts.map(p => p.padStart(2, '0'));
            fechaConformidad = `${year}-${month}-${day}`;
          }
        } else if (fechaInput.includes('-')) {
          // Validar formato ISO
          const dateTest = new Date(fechaInput);
          if (!isNaN(dateTest.getTime())) {
            fechaConformidad = fechaInput;
          }
        }
      }

      // Procesar conformidad con más opciones
      const conformidadValue = (row['Conformidad'] || '').toString().toLowerCase().trim();
      const conformidad = ['verdadero', 'true', 'sí', 'si', '1', 'yes', 'conforme', 'aprobado'].includes(conformidadValue);

      // Procesar observaciones de forma robusta
      let observaciones = (row['Observaciones'] || '').toString().trim();
      if (!observaciones || observaciones === '-' || observaciones === 'N/A' || observaciones === 'n/a') {
        observaciones = 'Sin observaciones';
      }

      // Generar ID correlativo si está vacío
      let idCorrelativo = (row['ID Correlativo'] || '').toString().trim();
      if (!idCorrelativo) {
        idCorrelativo = `CS-AUTO-${Date.now()}-${rowIndex}`;
      }

      return {
        id_correlativo: idCorrelativo,
        ruc: (row['RUC'] || '').toString().trim(),
        proveedor: (row['Proveedor'] || '').toString().trim(),
        nro_factura: (row['Nro Factura'] || '').toString().trim(),
        nro_centro_costo: (row['Nro Centro de Costo'] || '').toString().trim(),
        nro_orden_servicio: (row['Nro Orden Servicio'] || '').toString().trim(),
        nro_of: (row['Nro OF'] || '').toString().trim(),
        solicitante: (row['Solicitante'] || '').toString().trim(),
        fecha_conformidad: fechaConformidad,
        descripcion_servicio: (row['Descripción Servicio'] || '').toString().trim(),
        conformidad,
        observaciones,
        responsable: (row['Responsable'] || '').toString().trim(),
        area: (row['Área'] || '').toString().trim(),
        usuario_id: user?.id
      };
    } catch (error) {
      console.error(`❌ Error procesando fila ${rowIndex}:`, error);
      throw new Error(`Error al procesar datos de la fila: ${error}`);
    }
  };

  const processCSV = async () => {
    if (!file || !user) {
      console.error('❌ Archivo o usuario no disponible');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      console.log('🚀 Iniciando procesamiento de CSV...');
      
      const text = await file.text();
      console.log(`📄 Archivo leído: ${text.length} caracteres`);
      
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('El archivo CSV está vacío o no tiene el formato correcto');
      }

      console.log(`📊 Procesando ${rows.length} filas`);

      const processResult: ProcessingResult = {
        total: rows.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      // Procesar en lotes más pequeños para evitar timeouts
      const batchSize = 5;
      const totalBatches = Math.ceil(rows.length / batchSize);
      console.log(`🔄 Procesando en ${totalBatches} lotes de ${batchSize} filas`);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, rows.length);
        const batch = rows.slice(startIndex, endIndex);

        console.log(`📦 Procesando lote ${batchIndex + 1}/${totalBatches} (filas ${startIndex + 1}-${endIndex})`);

        const batchData = [];
        
        for (let i = 0; i < batch.length; i++) {
          const rowIndex = startIndex + i;
          const row = batch[i];
          
          try {
            const dbRow = convertRowToDBFormat(row, rowIndex);
            
            // Validar que los campos críticos no estén vacíos
            if (!dbRow.usuario_id) {
              throw new Error('Usuario ID requerido');
            }
            
            batchData.push(dbRow);
            console.log(`✅ Fila ${rowIndex + 1} procesada:`, {
              id_correlativo: dbRow.id_correlativo,
              proveedor: dbRow.proveedor,
              ruc: dbRow.ruc
            });
          } catch (error) {
            console.error(`❌ Error en fila ${rowIndex + 1}:`, error);
            processResult.failed++;
            processResult.errors.push({ 
              row: rowIndex + 2, 
              error: `Error al convertir datos: ${error}` 
            });
          }
        }

        if (batchData.length > 0) {
          console.log(`💾 Insertando lote con ${batchData.length} registros...`);
          
          const { data, error } = await supabase
            .from('conformidades_servicio')
            .insert(batchData)
            .select('id_correlativo');

          if (error) {
            console.error('❌ Error insertando lote:', error);
            processResult.failed += batchData.length;
            processResult.errors.push({
              row: startIndex + 2,
              error: `Error en lote: ${error.message}`
            });
          } else {
            console.log(`✅ Lote insertado exitosamente: ${data?.length || batchData.length} registros`);
            processResult.successful += batchData.length;
          }
        }

        // Actualizar progreso
        const progressPercent = ((batchIndex + 1) / totalBatches) * 100;
        setProgress(progressPercent);
        
        // Pequeña pausa para evitar sobrecargar la base de datos
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('📈 Resultado final:', processResult);
      setResult(processResult);

      if (processResult.successful > 0) {
        toast({
          title: 'Procesamiento completado',
          description: `${processResult.successful} de ${processResult.total} conformidades procesadas exitosamente`,
        });
        onSuccess();
      }

      if (processResult.failed > 0) {
        toast({
          title: 'Procesamiento completado con errores',
          description: `${processResult.failed} filas fallaron. Revisa los detalles.`,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('💥 Error procesando CSV:', error);
      setResult({
        total: 0,
        successful: 0,
        failed: 0,
        errors: [{ row: 1, error: `Error general: ${error}` }]
      });
      toast({
        title: 'Error',
        description: 'Error al procesar el archivo CSV',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Carga Masiva de Conformidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file && (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Selecciona un archivo CSV para cargar conformidades masivamente
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar archivo CSV
            </Button>
          </div>
        )}

        {file && !result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUploader}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Procesando...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={processCSV}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Procesando...' : 'Procesar archivo'}
              </Button>
              <Button
                variant="outline"
                onClick={resetUploader}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{result.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.successful}</div>
                <div className="text-sm text-muted-foreground">Exitosos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-sm text-muted-foreground">Fallidos</div>
              </div>
            </div>

            {result.successful > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.successful} conformidades se procesaron exitosamente.
                </AlertDescription>
              </Alert>
            )}

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Errores encontrados:</p>
                    <div className="bg-red-50 p-2 rounded border">
                      <p className="text-sm font-medium mb-1">Filas que fallaron:</p>
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(result.errors.map(error => error.row))].sort((a, b) => a - b).map((rowNumber, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {rowNumber}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-xs">
                          Fila {error.row}: {error.error}
                        </div>
                      ))}
                      {result.errors.length > 10 && (
                        <div className="text-xs font-medium">
                          ... y {result.errors.length - 10} errores más
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={resetUploader} className="w-full">
              Procesar otro archivo
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Información:</strong></p>
          <p>• Se procesarán todas las filas del CSV</p>
          <p>• Se generará ID automático si está vacío</p>
          <p>• Archivo en formato CSV separado por comas</p>
          <p>• Procesamiento en lotes para máxima eficiencia</p>
        </div>
      </CardContent>
    </Card>
  );
}
