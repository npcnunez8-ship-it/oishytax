import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const ProgressBar = () => {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setProgress(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const getColor = () => {
    if (progress < 30) return 'bg-destructive';
    if (progress < 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-sm border-t border-border p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">{t.foodSaved}</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-500 ${getColor()}`}
            style={{ width }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
