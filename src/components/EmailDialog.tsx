import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, FileText, Send, X } from 'lucide-react';
import { Conformidad } from '@/types/conformidad';
import { useEmailSender } from '@/hooks/useEmailSender';

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conformidad: Conformidad | null;
  includeFirma: boolean;
}

export function EmailDialog({ open, onOpenChange, conformidad, includeFirma }: EmailDialogProps) {
  const [formData, setFormData] = useState({
    toEmail: 'logistica@livigui.com',
    ccEmail: 'asistentelogistica@livigui.com',
    subject: '',
    message: '',
  });

  const { sendEmail, isLoading } = useEmailSender();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conformidad) return;
    
    const success = await sendEmail({
      conformidad,
      toEmail: formData.toEmail,
      ccEmail: formData.ccEmail,
      subject: formData.subject,
      message: formData.message,
      includeFirma,
    });
    
    if (success) {
      onOpenChange(false);
      setFormData({ toEmail: 'logistica@livigui.com', ccEmail: 'asistentelogistica@livigui.com', subject: '', message: '' });
    }
  };

  const resetForm = () => {
    setFormData({ toEmail: 'logistica@livigui.com', ccEmail: 'asistentelogistica@livigui.com', subject: '', message: '' });
  };

  // Auto-generate subject and message when conformidad changes
  const autoFillContent = () => {
    if (!conformidad) return;
    
    setFormData({
      toEmail: formData.toEmail,
      ccEmail: formData.ccEmail,
      subject: `Conformidad de Servicio - ${conformidad.id_correlativo}`,
      message: `Estimado/a,

Adjunto encontrará la conformidad de servicio con los siguientes detalles:

• ID Correlativo: ${conformidad.id_correlativo}
• Proveedor: ${conformidad.proveedor}
• Área: ${conformidad.area}
• Fecha: ${format(new Date(conformidad.fecha_conformidad), 'dd/MM/yyyy')}
• Estado: ${conformidad.conformidad ? 'Conforme' : 'No Conforme'}
• Responsable: ${conformidad.responsable}
• N° Factura: ${conformidad.nro_factura}

Cualquier consulta, no dude en contactarnos.

Saludos cordiales.`,
    });
  };

  if (!conformidad) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enviar Conformidad por Email
          </DialogTitle>
          <DialogDescription>
            Envíe la conformidad de servicio por email con el PDF adjunto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la conformidad */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalles de la Conformidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">ID:</span>
                  <p className="font-mono">{conformidad.id_correlativo}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Proveedor:</span>
                  <p>{conformidad.proveedor}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Área:</span>
                  <p>{conformidad.area}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Fecha:</span>
                  <p>{format(new Date(conformidad.fecha_conformidad), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Estado:</span>
                  <Badge variant={conformidad.conformidad ? 'default' : 'destructive'}>
                    {conformidad.conformidad ? 'Conforme' : 'No Conforme'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Responsable:</span>
                  <p>{conformidad.responsable}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de email */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="toEmail">Email Destinatario *</Label>
              <Input
                id="toEmail"
                type="email"
                placeholder="ejemplo@empresa.com"
                value={formData.toEmail}
                onChange={(e) => setFormData({ ...formData, toEmail: e.target.value })}
                required
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccEmail">CC (Copia)</Label>
              <Input
                id="ccEmail"
                type="email"
                placeholder="copia@empresa.com"
                value={formData.ccEmail}
                onChange={(e) => setFormData({ ...formData, ccEmail: e.target.value })}
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subject">Asunto *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={autoFillContent}
                  className="text-xs"
                >
                  Auto-completar
                </Button>
              </div>
              <Input
                id="subject"
                placeholder="Asunto del email"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escriba su mensaje aquí..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={8}
                className="resize-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Información del adjunto */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>
                  Adjunto: <span className="font-medium">conformidad-{conformidad.id_correlativo}.pdf</span>
                  {includeFirma && ' (con firma)'}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.toEmail || !formData.subject}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}