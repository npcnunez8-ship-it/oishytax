import { motion } from 'framer-motion';
import { Leaf, Scale, Clock, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CropCardProps {
  id: string;
  cropName: string;
  weightKg: number;
  status: string;
  onDelete?: (id: string) => void;
}

const CropCard = ({ id, cropName, weightKg, status, onDelete }: CropCardProps) => {
  const { t } = useLanguage();

  const getStatusColor = () => {
    switch (status) {
      case 'harvested':
        return 'bg-success/10 text-success border-success/30';
      case 'sold':
        return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
      default:
        return 'bg-warning/10 text-warning border-warning/30';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'harvested':
        return t.harvested;
      case 'sold':
        return t.sold;
      default:
        return t.pending;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-xl shadow-sm p-4 border border-border card-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">{cropName}</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Scale className="w-4 h-4" />
              <span>{weightKg} kg</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CropCard;
