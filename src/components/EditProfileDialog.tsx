import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const editProfileSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  username: z.string().min(1, "El nombre de usuario es requerido"),
  email: z.string().email("Formato de email inválido"),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState<string>("");

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: user?.email || "",
    },
  });

  // Cargar datos del perfil actual
  useEffect(() => {
    if (user && open) {
      loadUserProfile();
    }
  }, [user, open]);

  const loadUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (profile) {
        form.reset({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          username: profile.username || "",
          email: user?.email || "",
        });
        setCurrentSignatureUrl(profile.firma_url || "");
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    }
  };

  const uploadSignature = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/signature-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('firmas-usuarios')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('firmas-usuarios')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setLoading(true);
    try {
      let signatureUrl = currentSignatureUrl;

      // Subir nueva firma si se seleccionó
      if (signatureFile) {
        setUploadingSignature(true);
        signatureUrl = await uploadSignature(signatureFile);
        setUploadingSignature(false);
      }

      // Actualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          firma_url: signatureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      // Actualizar email si cambió
      if (data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        });

        if (emailError) throw emailError;

        toast({
          title: "Perfil actualizado",
          description: "Se ha enviado un enlace de confirmación a tu nuevo email",
        });
      } else {
        toast({
          title: "Perfil actualizado",
          description: "Tus datos han sido actualizados correctamente",
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error actualizando perfil:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingSignature(false);
    }
  };

  const handleSignatureSelect = (file: File | null) => {
    setSignatureFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal y firma
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu apellido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre de usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Firma</label>
              <FileUpload
                onFileSelect={handleSignatureSelect}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                currentUrl={currentSignatureUrl}
                placeholder="Selecciona una imagen para tu firma"
              />
              <p className="text-xs text-muted-foreground">
                Formatos soportados: JPG, PNG, WebP. Máximo 5MB.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || uploadingSignature}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || uploadingSignature}
              >
                {loading ? (uploadingSignature ? "Subiendo firma..." : "Guardando...") : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}