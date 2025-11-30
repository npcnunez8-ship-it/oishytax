import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, Sun, Droplets, MapPin, Mic, Camera, Upload, 
  AlertTriangle, CheckCircle, Leaf, User, Shield, 
  BarChart3, Smartphone, Menu, X, Globe, Speaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Mock Data ---

type Language = 'en' | 'bn';

interface CropBatch {
  id: string;
  type: string;
  weight: number;
  date: string;
  location: string;
  storageType: string;
  etcl: number; // Estimated Time to Critical Loss in hours
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

const DISTRICTS = ['Dhaka', 'Cumilla', 'Bogura', 'Rangpur', 'Mymensingh'];
const STORAGE_TYPES = ['Jute Bag Stack', 'Silo', 'Open Area', 'Hermetic Bag'];

// --- Translations ---
const TRANSLATIONS = {
  en: {
    title: "HarvestGuard",
    subtitle: "Every Grain is Valuable",
    landing_pitch: "Bangladesh loses 4.5 million tonnes of food yearly. We use data to stop that.",
    cta: "Protect My Harvest",
    nav_home: "Home",
    nav_dashboard: "Dashboard",
    weather_title: "Hyper-Local Weather",
    risk_map: "Regional Risk Map",
    add_crop: "Register Harvest",
    scanner: "Pest & Disease Scanner",
    voice_assist: "Krishi Bondhu (Voice)",
    alert_good: "Conditions are optimal.",
    alert_bad: "Warning: High humidity detected.",
    advisory_rain: "Rain predicted (85%). Cover crops immediately.",
    advisory_heat: "Temp rising to 36°C. Irrigate in the afternoon.",
    etcl_label: "Time to Critical Loss:",
    hours: "hours",
    badges: "Achievements",
    badge_1: "First Harvest Logged",
    badge_2: "Risk Mitigation Expert",
  },
  bn: {
    title: "হারভেস্টগার্ড",
    subtitle: "প্রতিটি দানা মূল্যবান",
    landing_pitch: "বাংলাদেশে প্রতি বছর ৪৫ লক্ষ টন খাদ্যশস্য নষ্ট হয়। আমরা তা রোধ করি।",
    cta: "আমার ফসল রক্ষা করুন",
    nav_home: "হোম",
    nav_dashboard: "ড্যাশবোর্ড",
    weather_title: "স্থানীয় আবহাওয়া",
    risk_map: "আঞ্চলিক ঝুঁকি মানচিত্র",
    add_crop: "ফসল নিবন্ধন করুন",
    scanner: "রোগ ও পোকা স্ক্যানার",
    voice_assist: "কৃষি বন্ধু (ভয়েস)",
    alert_good: "অবস্থা অনুকূল।",
    alert_bad: "সতর্কতা: উচ্চ আর্দ্রতা সনাক্ত হয়েছে।",
    advisory_rain: "আগামী ৩ দিন বৃষ্টি ৮৫% → আজই ধান কাটুন অথবা ঢেকে রাখুন",
    advisory_heat: "তাপমাত্রা ৩৬°C উঠবে → বিকেলের দিকে সেচ দিন",
    etcl_label: "ঝুঁকিপূর্ণ হতে বাকি:",
    hours: "ঘণ্টা",
    badges: "অর্জনসমূহ",
    badge_1: "প্রথম ফসল যুক্ত করেছেন",
    badge_2: "ঝুঁকি নিরসন বিশেষজ্ঞ",
  }
};

// --- Components ---

// A1: Storytelling Landing Page
const LandingPage = ({ onStart, lang, setLang }: { onStart: () => void, lang: Language, setLang: (l: Language) => void }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 text-white flex flex-col">
      <nav className="p-6 flex justify-between items-center">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-yellow-400" /> {t.title}
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          {lang === 'en' ? 'বাংলা' : 'English'}
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight"
        >
          {t.subtitle}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-green-100 max-w-2xl"
        >
          {t.landing_pitch}
        </motion.p>

        {/* Visual Metaphor Animation (Data -> Warning -> Action) */}
        <div className="flex gap-4 items-center my-8 bg-white/10 p-6 rounded-xl backdrop-blur-md">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-blue-300" />
            <span className="text-xs">Data</span>
          </motion.div>
          <div className="w-8 h-0.5 bg-white/30"></div>
          <motion.div animate={{ color: ["#fff", "#ef4444", "#fff"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <span className="text-xs">Warning</span>
          </motion.div>
          <div className="w-8 h-0.5 bg-white/30"></div>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-400" />
            <span className="text-xs">Saved</span>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-yellow-500 text-green-900 px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-yellow-400 transition"
        >
          {t.cta}
        </motion.button>
      </main>
    </div>
  );
};

// A3 & B2: Weather & Smart Alert Widget
const WeatherWidget = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  // Mock Data mimicking API
  const weather = { temp: 36, humidity: 85, rainChance: 85, location: 'Bogura' };
  
  // B2: Decision Engine Logic
  const isCritical = weather.humidity > 80 && weather.rainChance > 80;
  
  useEffect(() => {
    if (isCritical) {
      console.log("SMS SIMULATION: Critical Risk Alert Sent to Farmer - Humidity High & Rain Predicted.");
    }
  }, [isCritical]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <Cloud className="text-blue-500" /> {t.weather_title}
        </h3>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
          <MapPin size={12} className="mr-1" /> {weather.location}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="bg-orange-50 p-2 rounded-lg">
          <Sun className="mx-auto text-orange-500 mb-1" size={20} />
          <p className="font-bold">{weather.temp}°C</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-lg">
          <Droplets className="mx-auto text-blue-500 mb-1" size={20} />
          <p className="font-bold">{weather.humidity}%</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <Cloud className="mx-auto text-gray-500 mb-1" size={20} />
          <p className="font-bold">{weather.rainChance}%</p>
        </div>
      </div>

      {/* A3: Bangla Advisory */}
      <div className={p-3 rounded-lg text-sm border-l-4 ${isCritical ? 'bg-red-50 border-red-500 text-red-800' : 'bg-green-50 border-green-500 text-green-800'}}>
        <strong>{lang === 'bn' ? 'পরামর্শ:' : 'Advisory:'} </strong>
        {isCritical ? t.advisory_rain : t.advisory_heat}
      </div>
    </div>
  );
};

// B1: Risk Map Visualization
const RiskMap = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  // Mock Neighbor Data (Anonymous)
  const pins = [
    { id: 1, x: 20, y: 30, risk: 'High', crop: 'Potato', updated: '10m ago' },
    { id: 2, x: 50, y: 50, risk: 'Low', crop: 'Paddy', updated: '1h ago' }, // User (Blue)
    { id: 3, x: 70, y: 20, risk: 'Medium', crop: 'Rice', updated: '2h ago' },
    { id: 4, x: 60, y: 70, risk: 'High', crop: 'Onion', updated: '5m ago' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-green-100 h-80 flex flex-col">
      <h3 className="font-bold text-gray-700 mb-2">{t.risk_map}</h3>
      <div className="flex-1 bg-green-50 rounded-lg relative overflow-hidden border border-green-200">
        {/* Mock Map Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#2F5233 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {pins.map((pin) => (
          <motion.button
            key={pin.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center
              ${pin.id === 2 ? 'bg-blue-500 z-10' : pin.risk === 'High' ? 'bg-red-500' : pin.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ top: ${pin.y}%, left: ${pin.x}% }}
            onClick={() => setSelectedPin(pin.id)}
          >
            {pin.id === 2 && <User size={12} className="text-white" />}
          </motion.button>
        ))}

        {/* Bangla Pop-up Interaction */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 left-2 right-2 bg-white p-3 rounded-lg shadow-xl border border-gray-200 text-xs z-20"
            >
              <div className="flex justify-between">
                <span className="font-bold">
                  {lang === 'bn' ? 'ফসল: ' : 'Crop: '} 
                  {lang === 'bn' && pins.find(p=>p.id===selectedPin)?.crop === 'Potato' ? 'আলু' : pins.find(p=>p.id===selectedPin)?.crop}
                </span>
                <button onClick={() => setSelectedPin(null)}><X size={14}/></button>
              </div>
              <div className={pins.find(p=>p.id===selectedPin)?.risk === 'High' ? 'text-red-600' : 'text-green-600'}>
                {lang === 'bn' ? 'ঝুঁকি: ' : 'Risk: '}
                {lang === 'bn' && pins.find(p=>p.id===selectedPin)?.risk === 'High' ? 'উচ্চ' : 'নিম্ন'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        {lang === 'bn' ? 'গোপনীয়তা রক্ষা করে স্থানীয় ঝুঁকি দেখা হচ্ছে' : 'Visualizing local risks anonymously'}
      </p>
    </div>
  );
};

// A5 & B3: Pest Scanner (Visual RAG)
const PestScanner = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | any>(null);

  const handleScan = () => {
    setAnalyzing(true);
    // Simulate Gemini API call delay
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        pest: lang === 'bn' ? 'মাজরা পোকা' : 'Stem Borer',
        risk: 'High',
        action: lang === 'bn' 
          ? 'নিম তেলের স্প্রে ব্যবহার করুন এবং আক্রান্ত অংশ কেটে ফেলুন।' 
          : 'Use Neem oil spray and remove affected parts.'
      });
    }, 2000);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Camera className="text-purple-500" /> {t.scanner}
      </h3>
      
      {!result ? (
        <div className="flex flex-col items-center gap-4 py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          {analyzing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
              <p className="text-sm text-gray-500">Analyzing with AI...</p>
            </div>
          ) : (
            <>
              <button onClick={handleScan} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md">
                <Upload size={18} /> Upload Image
              </button>
              <p className="text-xs text-gray-400">Supported: JPG, PNG</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-red-800 text-lg">{result.pest}</h4>
            <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded font-bold">{result.risk} Risk</span>
          </div>
          <p className="text-gray-700 text-sm mb-3">{result.action}</p>
          <button onClick={() => setResult(null)} className="text-xs text-blue-600 underline">Scan Another</button>
        </div>
      )}
    </div>
  );
};

// B4: Voice Interface (Simulated)
const VoiceAssistant = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const toggleListen = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript(lang === 'bn' ? "শুনছি..." : "Listening...");
      setResponse("");
      
      // Simulate Web Speech API recognition
      setTimeout(() => {
        setIsListening(false);
        const query = lang === 'bn' ? "আজকের আবহাওয়া কেমন?" : "How is the weather today?";
        setTranscript(query);
        
        // Simulate response delay
        setTimeout(() => {
          setResponse(lang === 'bn' 
            ? "আজ আকাশ পরিষ্কার, তাপমাত্রা ৩৬ ডিগ্রি।" 
            : "Sky is clear, temperature is 36 degrees.");
        }, 800);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 max-w-xs ml-auto"
          >
            <p className="text-xs text-gray-400 mb-1">You: {transcript}</p>
            {response && <p className="text-sm font-bold text-green-800 flex gap-2"><Speaker size={14}/> {response}</p>}
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={toggleListen}
        className={p-4 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-700'}}
      >
        <Mic className="text-white" size={24} />
      </button>
    </div>
  );
};

// --- Main App Component ---

const Dashboard = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [lang, setLang] = useState<Language>('en');
  const [crops, setCrops] = useState<CropBatch[]>([]);
  
  // A2: Offline Capability (Mock)
  useEffect(() => {
    const saved = localStorage.getItem('harvestguard_crops');
    if (saved) setCrops(JSON.parse(saved));
  }, []);

  const addCrop = () => {
    // A2: Crop Batch Registration Logic
    const newCrop: CropBatch = {
      id: Date.now().toString(),
      type: 'Paddy (Rice)',
      weight: 500,
      date: new Date().toISOString().split('T')[0],
      location: 'Bogura',
      storageType: 'Jute Bag Stack',
      etcl: 72, // A4: Prediction Engine Result (Mocked)
      riskLevel: 'Medium'
    };
    const updated = [newCrop, ...crops];
    setCrops(updated);
    localStorage.setItem('harvestguard_crops', JSON.stringify(updated));
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('dashboard')} lang={lang} setLang={setLang} />;
  }

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 sticky top-0 z-30 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Menu className="md:hidden" />
          <Shield className="text-yellow-400" /> HarvestGuard
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-800 px-2 py-1 rounded text-xs">
            {lang === 'en' ? 'Online' : 'অনলাইন'}
          </span>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 font-bold">
            R
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* A2: Profile & Badges */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Rahim Uddin</h2>
              <p className="opacity-90">{lang === 'bn' ? 'বগুড়া সদর' : 'Bogura Sadar'}</p>
            </div>
            <Award className="text-yellow-300 w-10 h-10" />
          </div>
          <div className="flex gap-2 mt-2 overflow-x-auto">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm whitespace-nowrap">🏅 {t.badge_1}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm whitespace-nowrap">🛡 {t.badge_2}</span>
          </div>
        </div>

        {/* B2 & A3: Weather Widget */}
        <WeatherWidget lang={lang} />

        {/* B1: Risk Map */}
        <RiskMap lang={lang} />

        {/* A5 & B3: Scanner */}
        <PestScanner lang={lang} />

        {/* A2: Active Batches & A4: Prediction */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Active Batches</h3>
            <button onClick={addCrop} className="bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 shadow">
              <Plus size={16} /> {t.add_crop}
            </button>
          </div>

          {crops.length === 0 && (
            <p className="text-center text-gray-400 py-8">No crops registered yet.</p>
          )}

          <div className="space-y-3">
            {crops.map((crop) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={crop.id} 
                className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-yellow-500 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-gray-800">{crop.type}</h4>
                  <p className="text-xs text-gray-500">{crop.weight}kg • {crop.storageType}</p>
                  
                  {/* A4: ETCL Display */}
                  <div className="mt-2 flex items-center gap-2 text-sm text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded w-fit">
                    <AlertTriangle size={14} /> 
                    {t.etcl_label} {crop.etcl} {t.hours}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-gray-400">{crop.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* B4: Voice Assistant */}
      <VoiceAssistant lang={lang} />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-3 px-6 flex justify-between text-gray-400 z-40">
        <button className="flex flex-col items-center text-green-700">
          <Leaf size={24} />
          <span className="text-[10px] font-bold">{t.nav_dashboard}</span>
        </button>
        <button className="flex flex-col items-center hover:text-green-600">
          <BarChart3 size={24} />
          <span className="text-[10px]">Stats</span>
        </button>
        <button className="flex flex-col items-center hover:text-green-600">
          <User size={24} />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
