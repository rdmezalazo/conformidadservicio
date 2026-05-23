export interface Area {
  id: string;
  nombre: string;
  color: string;
  icono_url?: string;
  descripcion?: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsuarioEmpresa {
  id: string;
  nombre_completo: string;
  email: string;
  puesto: string;
  area_id?: string;
  color_personal: string;
  avatar_url?: string;
  firma_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  area?: Area;
}

export interface ConfiguracionVisual {
  id: string;
  usuario_id?: string;
  tema: 'light' | 'dark';
  estilo_visual: 'moderno' | 'corporativo' | 'minimalista';
  configuracion: {
    colores: {
      primario: string;
      secundario: string;
      acento: string;
    };
    fuentes: {
      familia: string;
      peso: string;
      tamaños: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
      };
    };
  };
  created_at: string;
  updated_at: string;
}

export interface EstiloVisualPreset {
  id: string;
  nombre: string;
  descripcion: string;
  configuracion: ConfiguracionVisual['configuracion'];
}

export const ESTILOS_VISUALES_PRESETS: EstiloVisualPreset[] = [
  {
    id: 'moderno',
    nombre: 'Moderno',
    descripcion: 'Diseño contemporáneo con colores vibrantes',
    configuracion: {
      colores: {
        primario: 'hsl(220, 91%, 60%)',
        secundario: 'hsl(262, 83%, 67%)',
        acento: 'hsl(142, 76%, 46%)'
      },
      fuentes: {
        familia: 'Inter',
        peso: '400',
        tamaños: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        }
      }
    }
  },
  {
    id: 'corporativo',
    nombre: 'Corporativo',
    descripcion: 'Estilo profesional y elegante',
    configuracion: {
      colores: {
        primario: 'hsl(215, 84%, 30%)',
        secundario: 'hsl(210, 40%, 45%)',
        acento: 'hsl(195, 100%, 35%)'
      },
      fuentes: {
        familia: 'Georgia',
        peso: '500',
        tamaños: {
          xs: '0.8rem',
          sm: '0.9rem',
          base: '1rem',
          lg: '1.15rem',
          xl: '1.3rem'
        }
      }
    }
  },
  {
    id: 'minimalista',
    nombre: 'Minimalista',
    descripcion: 'Diseño limpio y simple',
    configuracion: {
      colores: {
        primario: 'hsl(0, 0%, 20%)',
        secundario: 'hsl(0, 0%, 60%)',
        acento: 'hsl(160, 84%, 39%)'
      },
      fuentes: {
        familia: 'Helvetica',
        peso: '300',
        tamaños: {
          xs: '0.7rem',
          sm: '0.85rem',
          base: '0.95rem',
          lg: '1.1rem',
          xl: '1.2rem'
        }
      }
    }
  }
];