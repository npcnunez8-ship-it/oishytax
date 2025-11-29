import { useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const OnlineStatus = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isOnline ? 'online' : 'offline'}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isOnline 
            ? 'bg-success/10 text-success' 
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isOnline ? (
          <>
            <Cloud className="w-4 h-4" />
            <span>{t.online}</span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4" />
            <span>{t.offline}</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OnlineStatus;
