import { useEffect } from 'react';
import { useConfiguracionVisual, useAreas } from './useConfiguracion';
import { ConfiguracionVisual } from '@/types/configuracion';
import { useTheme } from './useTheme';

export const useGlobalConfiguration = () => {
  const { theme, setTheme } = useTheme();
  const { configuracion } = useConfiguracionVisual();
  const { areas } = useAreas();

  // Aplicar configuración global cuando cambie
  useEffect(() => {
    if (configuracion) {
      applyGlobalConfiguration(configuracion);
    }
  }, [configuracion]);

  // Aplicar tema cuando cambie la configuración
  useEffect(() => {
    if (configuracion?.tema && configuracion.tema !== theme) {
      setTheme(configuracion.tema as 'light' | 'dark');
    }
  }, [configuracion?.tema, theme, setTheme]);

  // Aplicar colores de áreas al dashboard
  useEffect(() => {
    if (areas.length > 0) {
      applyAreaColors(areas);
    }
  }, [areas]);

  const applyGlobalConfiguration = (config: ConfiguracionVisual) => {
    if (!config) return;

    const root = document.documentElement;

    // Aplicar colores y fuentes del estilo visual
    if (config.configuracion && typeof config.configuracion === 'object') {
      const configuracion = config.configuracion as any;
      
      if (configuracion.colores) {
        const convertHslToVar = (hslColor: string) => {
          if (!hslColor) return '';
          const values = hslColor.replace('hsl(', '').replace(')', '').split(',');
          return values.map(v => v.trim()).join(' ');
        };

        if (configuracion.colores.primario) {
          const primaryValue = convertHslToVar(configuracion.colores.primario);
          root.style.setProperty('--primary', primaryValue, 'important');
        }
        if (configuracion.colores.secundario) {
          const secondaryValue = convertHslToVar(configuracion.colores.secundario);
          root.style.setProperty('--secondary', secondaryValue, 'important');
        }
        if (configuracion.colores.acento) {
          const accentValue = convertHslToVar(configuracion.colores.acento);
          root.style.setProperty('--accent', accentValue, 'important');
        }
      }

      if (configuracion.fuentes?.familia) {
        root.style.setProperty('--font-family', configuracion.fuentes.familia);
        document.body.style.fontFamily = configuracion.fuentes.familia;
      }
    }

    // Agregar clase para indicar que la configuración está aplicada
    document.body.classList.add('app-configured');
  };

  const applyAreaColors = (areasList: any[]) => {
    // Crear variables CSS dinámicas para los colores de áreas
    const root = document.documentElement;
    
    areasList.forEach((area, index) => {
      if (area.color) {
        root.style.setProperty(`--area-color-${index}`, area.color);
        root.style.setProperty(`--area-color-${area.id}`, area.color);
      }
    });
  };

  return {
    configuracion,
    areas,
    applyGlobalConfiguration,
    applyAreaColors
  };
};