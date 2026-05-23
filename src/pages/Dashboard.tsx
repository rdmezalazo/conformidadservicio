
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConformidadForm } from '@/components/ConformidadForm';
import { ConformidadesList } from '@/components/ConformidadesList';
import { CSVUploader } from '@/components/CSVUploader';
import { StatCard } from '@/components/StatCard';
import { AreaChart } from '@/components/AreaChart';
import { ResponsibleChart } from '@/components/ResponsibleChart';
import { MonthlyChart } from '@/components/MonthlyChart';
import { RecentActivity } from '@/components/RecentActivity';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { FileText, Plus, List, Upload, TrendingUp, CheckCircle, XCircle, BarChart3, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const { stats, isLoading, error } = useDashboardStats();

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error al cargar el dashboard</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header Section con mejor espaciado */}
      <div className="space-y-4 mb-8">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 border">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Panel de control con estadísticas en tiempo real de conformidades de servicio
          </p>
        </div>
      </div>

      {/* Stats Cards con mejor diseño */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="h-32 bg-muted/50 animate-pulse rounded-xl border"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))
        ) : (
          <>
            <StatCard
              title="Total Conformidades"
              value={stats.total.toLocaleString()}
              icon={FileText}
              description="registros totales"
              variant="violet"
              className="animate-slide-up border"
            />
            
            <StatCard
              title="Conformes"
              value={stats.conformes.toLocaleString()}
              icon={CheckCircle}
              description={`${stats.porcentajeConformidad}% del total`}
              variant="success"
              className="animate-slide-up border [animation-delay:0.1s]"
            />
            
            <StatCard
              title="No Conformes"
              value={stats.noConformes.toLocaleString()}
              icon={XCircle}
              description={`${100 - stats.porcentajeConformidad}% del total`}
              variant="warning"
              className="animate-slide-up border [animation-delay:0.2s]"
            />
            
            <StatCard
              title="Este Mes"
              value={stats.totalThisMonth.toLocaleString()}
              icon={TrendingUp}
              trend={{
                value: stats.changeThisMonth,
                isPositive: stats.changeThisMonth >= 0
              }}
              description="vs mes anterior"
              variant="info"
              className="animate-slide-up border [animation-delay:0.3s]"
            />
          </>
        )}
      </div>

      {/* Main Tabs con mejor diseño */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-14 p-1 rounded-xl border">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="new" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Nueva
          </TabsTrigger>
          <TabsTrigger 
            value="list" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg"
          >
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg"
          >
            <Upload className="h-4 w-4" />
            Carga Masiva
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Cargando estadísticas...</p>
                  <p className="text-sm text-muted-foreground">Procesando datos en tiempo real</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Charts Grid con mejor espaciado */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="animate-slide-up">
                  <AreaChart 
                    data={stats.byArea} 
                    title="Conformidades por Área" 
                  />
                </div>
                <div className="animate-slide-up [animation-delay:0.1s]">
                  <ResponsibleChart 
                    data={stats.byResponsible} 
                    title="Responsables de Área" 
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 animate-slide-up [animation-delay:0.2s]">
                  <MonthlyChart 
                    data={stats.byMonth} 
                    title="Tendencia Mensual (Últimos 6 meses)" 
                  />
                </div>
                <div className="animate-slide-up [animation-delay:0.3s]">
                  <RecentActivity 
                    data={stats.recentActivity} 
                    title="Actividad Reciente" 
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <ConformidadForm onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <ConformidadesList key={refreshKey} />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <CSVUploader onSuccess={handleFormSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
