import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Thermometer, MapPin, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeatherData {
  temp: number;
  humidity: number;
  rain: number;
  location: string;
}

// Mock data fallback - always available
const MOCK_WEATHER: WeatherData = {
  temp: 34,
  humidity: 82,
  rain: 60,
  location: "Dhaka"
};

const WeatherWidget = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Attempt to fetch real weather data
        // For now, we use mock data as the primary source
        // Real API integration would go here
        setWeather(MOCK_WEATHER);
        setUsingMock(true);
      } catch (error) {
        console.error('Weather fetch failed, using mock data:', error);
        setWeather(MOCK_WEATHER);
        setUsingMock(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const showHumidityWarning = weather.humidity > 80;
  const showRainWarning = weather.rain > 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-xl shadow-md p-5 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          {t.weather}
        </h3>
        {usingMock && (
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
            Demo
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      ) : (
        <>
          {/* Weather Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Thermometer className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">{t.temperature}</p>
                <p className="text-xl font-bold text-foreground">{weather.temp}°C</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Droplets className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t.humidity}</p>
                <p className="text-xl font-bold text-foreground">{weather.humidity}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Cloud className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t.rainChance}</p>
                <p className="text-xl font-bold text-foreground">{weather.rain}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">{t.location}</p>
                <p className="text-xl font-bold text-foreground">{weather.location}</p>
              </div>
            </div>
          </div>

          {/* Advisory Alerts */}
          <div className="space-y-3">
            {showHumidityWarning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg"
              >
                <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                <p className="text-sm font-semibold text-warning">{t.advice_spray}</p>
              </motion.div>
            )}
            
            {showRainWarning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
              >
                <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                <p className="text-sm font-semibold text-destructive">{t.advice_wait}</p>
              </motion.div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default WeatherWidget;
