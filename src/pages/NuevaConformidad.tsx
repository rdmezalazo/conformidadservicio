import { ConformidadForm } from '@/components/ConformidadForm';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const NuevaConformidad = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.has('edit');
  const conformidadId = searchParams.get('edit');

  const handleSuccess = () => {
    toast({
      title: 'Éxito',
      description: 'Conformidad creada correctamente',
    });
    navigate('/conformidades');
  };

  const handleBackToList = () => {
    navigate('/conformidades');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isViewMode ? 'Vista de Conformidad' : 'Nueva Conformidad'}
        </h1>
        <p className="text-muted-foreground">
          {isViewMode ? 'Solo lectura' : 'Crea una nueva conformidad de servicio'}
        </p>
      </div>
      
      <ConformidadForm 
        onSuccess={handleSuccess} 
        isViewMode={isViewMode}
        onBackToList={handleBackToList}
        conformidadId={conformidadId || undefined}
      />
    </div>
  );
};

export default NuevaConformidad;