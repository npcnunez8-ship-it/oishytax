import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, Scale } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (crop: { cropName: string; weightKg: number; status: string }) => void;
}

const AddCropModal = ({ isOpen, onClose, onAdd }: AddCropModalProps) => {
  const { t } = useLanguage();
  const [cropName, setCropName] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [status, setStatus] = useState('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cropName && weightKg) {
      onAdd({
        cropName,
        weightKg: parseFloat(weightKg),
        status,
      });
      setCropName('');
      setWeightKg('');
      setStatus('pending');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-2xl shadow-lg p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                {t.addCrop}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cropName" className="text-foreground">
                  {t.cropName}
                </Label>
                <Input
                  id="cropName"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="ধান, গম, আলু..."
                  className="bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-foreground">
                  {t.weight}
                </Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="pl-10 bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground">
                  {t.status}
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="harvested">{t.harvested}</SelectItem>
                    <SelectItem value="sold">{t.sold}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button type="submit" className="flex-1">
                  {t.save}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCropModal;
