import { useTheme as useNextTheme } from 'next-themes';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useTheme = () => {
  const { theme, setTheme: setNextTheme, systemTheme, resolvedTheme } = useNextTheme();
  const { toast } = useToast();

  // Función para cambiar el tema y aplicarlo inmediatamente
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setNextTheme(newTheme);
    
    // Aplicar inmediatamente la clase al HTML
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (newTheme === 'system') {
      // Para sistema, usar la preferencia del sistema
      if (systemTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }

    toast({
      title: "Tema cambiado",
      description: `Cambiado a modo ${newTheme === 'dark' ? 'oscuro' : newTheme === 'light' ? 'claro' : 'sistema'}`,
    });
  };

  // Efecto para asegurar que la clase se aplique correctamente al cargar
  useEffect(() => {
    const root = document.documentElement;
    
    // Remover todas las clases de tema primero
    root.classList.remove('dark', 'light');
    
    // Aplicar la clase correcta basada en el tema resuelto
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, [resolvedTheme]);

  // Función para alternar entre claro y oscuro
  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Función para verificar si el modo oscuro está activo
  const isDark = resolvedTheme === 'dark';

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    resolvedTheme,
    systemTheme
  };
};