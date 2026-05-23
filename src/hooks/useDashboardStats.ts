import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conformidad } from '@/types/conformidad';

export interface DashboardStats {
  total: number;
  conformes: number;
  noConformes: number;
  porcentajeConformidad: number;
  totalThisMonth: number;
  changeThisMonth: number;
  byArea: { area: string; count: number; conformes: number }[];
  byResponsible: { responsable: string; count: number; conformes: number; color?: string }[];
  byMonth: { month: string; count: number; conformes: number }[];
  recentActivity: { id_correlativo: string; proveedor: string; conformidad: boolean; fecha: string }[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    conformes: 0,
    noConformes: 0,
    porcentajeConformidad: 0,
    totalThisMonth: 0,
    changeThisMonth: 0,
    byArea: [],
    byResponsible: [],
    byMonth: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback((conformidades: Conformidad[], colorMap?: Map<string, string>): DashboardStats => {
    const total = conformidades.length;
    const conformes = conformidades.filter(c => c.conformidad).length;
    const noConformes = total - conformes;
    const porcentajeConformidad = total > 0 ? Math.round((conformes / total) * 100) : 0;

    // Cálculos por mes
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const thisMonthData = conformidades.filter(c => {
      const fecha = new Date(c.fecha_conformidad);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    const lastMonthData = conformidades.filter(c => {
      const fecha = new Date(c.fecha_conformidad);
      return fecha.getMonth() === lastMonth && fecha.getFullYear() === lastMonthYear;
    });

    const totalThisMonth = thisMonthData.length;
    const totalLastMonth = lastMonthData.length;
    const changeThisMonth = totalLastMonth > 0 
      ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
      : totalThisMonth > 0 ? 100 : 0;

    // Estadísticas por área
    const areaMap = new Map<string, { count: number; conformes: number }>();
    conformidades.forEach(c => {
      const existing = areaMap.get(c.area) || { count: 0, conformes: 0 };
      existing.count++;
      if (c.conformidad) existing.conformes++;
      areaMap.set(c.area, existing);
    });

    const byArea = Array.from(areaMap.entries())
      .map(([area, data]) => ({ area, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Estadísticas por responsable con colores
    const responsibleMap = new Map<string, { count: number; conformes: number; color?: string }>();
    conformidades.forEach(c => {
      const existing = responsibleMap.get(c.responsable) || { count: 0, conformes: 0 };
      existing.count++;
      if (c.conformidad) existing.conformes++;
      existing.color = colorMap?.get(c.responsable) || '#6366F1'; // Color por defecto
      responsibleMap.set(c.responsable, existing);
    });

    const byResponsible = Array.from(responsibleMap.entries())
      .map(([responsable, data]) => ({ responsable, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Estadísticas por mes (últimos 6 meses)
    const monthMap = new Map<string, { count: number; conformes: number }>();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      months.push(monthKey);
      monthMap.set(monthKey, { count: 0, conformes: 0 });
    }

    conformidades.forEach(c => {
      const fecha = new Date(c.fecha_conformidad);
      const monthKey = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      if (monthMap.has(monthKey)) {
        const existing = monthMap.get(monthKey)!;
        existing.count++;
        if (c.conformidad) existing.conformes++;
      }
    });

    const byMonth = months.map(month => ({
      month,
      ...monthMap.get(month)!
    }));

    // Actividad reciente (últimos 5)
    const recentActivity = conformidades
      .sort((a, b) => new Date(b.fecha_conformidad).getTime() - new Date(a.fecha_conformidad).getTime())
      .slice(0, 5)
      .map(c => ({
        id_correlativo: c.id_correlativo,
        proveedor: c.proveedor,
        conformidad: c.conformidad,
        fecha: c.fecha_conformidad,
      }));

    return {
      total,
      conformes,
      noConformes,
      porcentajeConformidad,
      totalThisMonth,
      changeThisMonth,
      byArea,
      byResponsible,
      byMonth,
      recentActivity,
    };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: conformidades, error } = await supabase
        .from('conformidades_servicio')
        .select('*');

      if (error) {
        console.error('Error fetching conformidades for stats:', error);
        setError(error.message);
        return;
      }

      // Obtener usuarios empresa con sus colores
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios_empresa')
        .select('nombre_completo, color_personal');

      if (usuariosError) {
        console.error('Error fetching usuarios:', usuariosError);
      }

      // Crear mapa de colores por responsable
      const colorMap = new Map<string, string>();
      usuarios?.forEach(usuario => {
        colorMap.set(usuario.nombre_completo, usuario.color_personal);
      });

      const calculatedStats = calculateStats(conformidades || [], colorMap);
      setStats(calculatedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}