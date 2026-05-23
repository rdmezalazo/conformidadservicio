import { ConformidadesList } from '@/components/ConformidadesList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Conformidades = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conformidades</h1>
          <p className="text-muted-foreground">
            Lista de todas las conformidades de servicio
          </p>
        </div>
        <Button asChild>
          <Link to="/nueva-conformidad">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Conformidad
          </Link>
        </Button>
      </div>
      
      <ConformidadesList />
    </div>
  );
};

export default Conformidades;