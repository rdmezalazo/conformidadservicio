import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUsuariosEmpresa, UsuarioEmpresa } from '@/hooks/useUsuariosEmpresa';

interface ResponsableSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  onUsuarioChange: (usuario: UsuarioEmpresa | null) => void;
}

export function ResponsableSearchSelect({
  value,
  onValueChange,
  onUsuarioChange,
}: ResponsableSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const { usuarios, isLoading } = useUsuariosEmpresa();

  const selectedUsuario = usuarios.find((usuario) => usuario.nombre_completo === value);

  useEffect(() => {
    if (selectedUsuario) {
      onUsuarioChange(selectedUsuario);
    } else {
      onUsuarioChange(null);
    }
  }, [selectedUsuario, onUsuarioChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <span className="truncate">
              {usuarios.find((usuario) => usuario.nombre_completo === value)?.nombre_completo}
            </span>
          ) : (
            <span className="text-muted-foreground">Buscar responsable...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por nombre..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Cargando...' : 'No se encontraron usuarios.'}
            </CommandEmpty>
            <CommandGroup>
              {usuarios.map((usuario) => (
                <CommandItem
                  key={usuario.id}
                  value={usuario.nombre_completo}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === usuario.nombre_completo ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{usuario.nombre_completo}</span>
                    <span className="text-sm text-muted-foreground">
                      {usuario.puesto} - {usuario.areas?.nombre}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}