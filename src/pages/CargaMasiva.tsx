import { CSVUploader } from '@/components/CSVUploader';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CargaMasiva = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast({
      title: 'Éxito',
      description: 'Carga masiva completada',
    });
    navigate('/conformidades');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carga Masiva</h1>
        <p className="text-muted-foreground">
          Sube múltiples conformidades desde un archivo CSV
        </p>
      </div>
      
      <CSVUploader onSuccess={handleSuccess} />
    </div>
  );
};

export default CargaMasiva;