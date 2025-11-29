import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Cloud, Droplets, Thermometer, Plus, Trash2, MapPin, Wallet, ArrowLeft, ChevronRight, ChevronDown, 
  TrendingUp, TrendingDown, Sprout, Package, FlaskConical, User, Award, Medal, Trophy, Star, Lock, 
  Zap, Globe, Users, Search, Phone, UserPlus, Loader2, Camera, Upload, ScanLine, X, FileText, 
  CheckCircle, AlertTriangle, MessageCircle, Send, Bot, Mic, StopCircle, Volume2, VolumeX, Bell,
  Fan, Info, // Added Fan and Info for Smart Alert
  Map as MapIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION ---
const supabaseUrl = "https://cdndutsyztaqtiwtntts.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbmR1dHN5enRhcXRpd3RudHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDQ3ODAsImV4cCI6MjA3OTc4MDc4MH0.7pFdFopbumF1JJMkoA5x-flF1-V6u1jGYFDsS-79vDA";
const supabase = createClient(supabaseUrl, supabaseKey);

// ⚠️ PASTE KEYS IF NEEDED ⚠️
const GROQ_API_KEY = "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"; 
const WEATHER_API_KEY = "9c061bd7a5cb8a53f5bd45ceb321e982"; 

// --- HELPER: ULTRA COMPRESSOR ---
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        resolve(dataUrl);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- AI ENGINE ---
const callAiChat = async (prompt: string) => {
  if (GROQ_API_KEY.includes("PASTE")) return "Error: Groq API Key is missing.";
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `You are an expert agricultural advisor in Bangladesh. Answer in short sentences (max 4). Question: ${prompt}` }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 200
      })
    });
    const data = await response.json();
    if (data.error) return "AI Error: " + data.error.message;
    return data.choices?.[0]?.message?.content || "No response.";
  } catch (e) { return "Network Error. Check internet connection."; }
};

const callAiVision = async (file: File, lang: "bn" | "en") => {
  try {
    const base64Url = await compressImage(file);
    const promptText = `Analyze this crop image. 1. Identify crop. 2. Healthy or Diseased? 3. Disease name. 4. 2 short treatments. Output JSON ONLY: { "status": "Healthy/Diseased", "diagnosis": "Details...", "advice": ["Tip 1", "Tip 2"] } Translate to ${lang === 'bn' ? 'Bangla' : 'English'}.`;
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: [{ type: "text", text: promptText }, { type: "image_url", image_url: { url: base64Url } }] }],
        model: "openai", seed: Math.floor(Math.random() * 1000), jsonMode: true
      })
    });
    if (!response.ok) throw new Error(`Server Error: ${response.status}`);
    const text = await response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    let resultJson;
    try { resultJson = JSON.parse(cleanText); } catch (e) { return { status: "Analysis Done", risk_level: "Unknown", color: "text-blue-600", advice: [cleanText], confidence: "AI" }; }
    
    // Risk logic for Vision
    const isRotten = resultJson.status?.toLowerCase().includes("disease") || resultJson.status?.includes("রোগ");
    const riskLvl = isRotten ? "High" : "Low";
    
    return { status: resultJson.status, risk_level: riskLvl, color: isRotten ? "text-red-600" : "text-green-600", advice: resultJson.advice || ["Consult an expert."], confidence: "AI Vision" };
  } catch (e) { return { status: "Error", risk_level: "Error", color: "text-red-600", advice: ["Could not analyze image. Please try again."], confidence: "Error" }; }
};

// --- DATA ---
const DIVISION_DATA: any = {
  Dhaka: { lat: 23.8103, lng: 90.4125, temp: 34, humidity: 82, rain: 60, forecast: [34, 33, 35, 32, 31, 33, 34] },
  Chattogram: { lat: 22.3569, lng: 91.7832, temp: 32, humidity: 88, rain: 75, forecast: [32, 31, 31, 30, 29, 31, 32] },
  Sylhet: { lat: 24.8949, lng: 91.8687, temp: 29, humidity: 90, rain: 90, forecast: [29, 28, 28, 27, 28, 29, 30] },
  Rajshahi: { lat: 24.3636, lng: 88.6241, temp: 38, humidity: 45, rain: 10, forecast: [38, 39, 40, 39, 38, 37, 36] },
  Khulna: { lat: 22.8456, lng: 89.5403, temp: 35, humidity: 70, rain: 40, forecast: [35, 35, 34, 33, 34, 35, 36] },
  Barisal: { lat: 22.7010, lng: 90.3535, temp: 33, humidity: 85, rain: 50, forecast: [33, 33, 32, 32, 31, 33, 34] },
  Rangpur: { lat: 25.7439, lng: 89.2752, temp: 36, humidity: 60, rain: 20, forecast: [36, 35, 34, 33, 32, 31, 30] },
  Mymensingh: { lat: 24.7471, lng: 90.4203, temp: 31, humidity: 80, rain: 65, forecast: [31, 30, 29, 30, 31, 32, 33] },
};
const DIVISIONS = Object.keys(DIVISION_DATA);
const CROPS = ["Rice (ধান)", "Potato (আলু)", "Tomato (টমেটো)", "Chili (মরিচ)", "Onion (পেঁয়াজ)", "Garlic (রসুন)"];
const STORAGE_TYPES = ["Jute Bag Stack", "Silo", "Plastic Drum", "Cold Storage", "Hermetic Airtight Bag"];

const DEMO_FARMERS = [
  { username: "rahim", name: "Rahim Uddin", contact: "01711-234567", profit: 120000 },
  { username: "karim", name: "Karim Mia", contact: "01811-987654", profit: 65000 },
  { username: "fatema", name: "Fatema Begum", contact: "01911-112233", profit: 15000 },
];

const toBanglaDigits = (num: number | string) => {
  const finalNum = num?.toString() || "0";
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return finalNum.replace(/\d/g, (d) => banglaDigits[parseInt(d)]);
};
const formatCurrency = (amount: number, lang: "bn" | "en") => {
  if (lang === "en") return amount.toLocaleString('en-US');
  return toBanglaDigits(amount);
};

// --- TRANSLATIONS ---
const TRANSLATIONS: any = {
  bn: {
    app_title: "কৃষি বন্ধু ২.০", sub_title: "কৃষকের হাসি", net_profit: "মোট লাভ", net_loss: "বর্তমান ক্ষতি",
    income: "আয়", expense: "ব্যয়", weather: "আবহাওয়া", temp: "তাপমাত্রা", humidity: "আর্দ্রতা", rain: "বৃষ্টির সম্ভাবনা",
    location: "অবস্থান", add_transaction: "লেনদেন যোগ করুন", sell_btn: "বিক্রি (Income)", buy_btn: "ক্রয় (Expense)",
    date: "তারিখ", weight_kg: "ওজন (KG)", weight_g: "ওজন (Grams)", cost: "মূল্য (টাকা)", add_income: "আয় যোগ করুন",
    add_expense: "ব্যয় যোগ করুন", daily_overview: "দৈনিক হিসাব", empty: "কোন তথ্য নেই", profile_title: "প্রোফাইল",
    current_profit: "বর্তমান লাভ", target: "লক্ষ্য", earn_more: "আরও", earn_more_suffix: "টাকা আয় করে আনলক করুন",
    badges: "মেডেল তালিকা", seeds: "বীজ", storage: "সংরক্ষণ", care: "সার/ঔষধ", back: "ফিরে যান",
    dashboard: "ড্যাশবোর্ড", next_7_days: "আগামী ৭ দিন",
    badge_diamond: "ডায়মন্ড কিং (প্লাটিনাম)", badge_gold: "সোনার কৃষক (গোল্ড)", badge_silver: "রুপালী কৃষক (সিলভার)",
    badge_bronze: "উদীয়মান (ব্রোঞ্জ)", badge_struggle: "সংগ্রামী", profit_100k: "লাভ ১,০০,০০০ টাকার বেশি",
    profit_50k: "লাভ ৫০,০০০ টাকার বেশি", profit_10k: "লাভ ১০,০০০ টাকার বেশি",
    community: "কমিউনিটি", search_placeholder: "ইউজারনেম লিখুন", search_btn: "খুঁজুন", contact: "যোগাযোগ",
    username: "ইউজারনেম", friend_profit: "বন্ধুর লাভ", friend_badge: "বন্ধুর মেডেল", not_found: "কৃষক খুঁজে পাওয়া যায়নি",
    scanner_title: "ফসল স্ক্যানার", upload_photo: "ছবি আপলোড", take_photo: "ছবি তুলুন", analyzing: "এআই বিশ্লেষণ করছে...",
    result_fresh: "ফসলটি সুস্থ (Fresh)", result_rotten: "রোগ সনাক্ত হয়েছে", advice_title: "পরামর্শ ও করণীয়:",
    chat_title: "সমাধান চ্যাটবক্স", chat_placeholder: "আপনার সমস্যা লিখুন...", chat_welcome: "স্বাগতম! আমি আপনার কৃষি সহকারী।",
    chat_typing: "এআই ভাবছে...", listening: "শুনছি...",
    risk_title: "ঝুঁকির মাত্রা:", action_plan: "অ্যাকশন প্ল্যান (Action Plan):",
    // Smart Alert Translations
    smart_alert_title: "স্মার্ট অ্যালার্ট (সতর্কবার্তা)",
    smart_alert_action: "করণীয় দেখুন",
    risk_map_title: "লোকাল রিস্ক ম্যাপ", risk_map_desc: "আপনার এলাকার ঝুঁকির চিত্র",
    risk_high: "উচ্চ", risk_medium: "মাঝারি", risk_low: "কম",
    risk_level: "ঝুঁকি", crop_type: "ফসল", last_update: "সর্বশেষ আপডেট",
    recommended: "উপযুক্ত", avoid: "বর্জনীয়"
  },
  en: {
    app_title: "KrishiBondhu 2.0", sub_title: "Krishoker Hasi", net_profit: "Net Profit", net_loss: "Net Loss",
    income: "Income", expense: "Expenses", weather: "Weather", temp: "Temperature", humidity: "Humidity", rain: "Rain Chance",
    location: "Location", add_transaction: "Add Transaction", sell_btn: "Sell (Income)", buy_btn: "Buy (Expense)",
    date: "Date", weight_kg: "Weight (KG)", weight_g: "Weight (Grams)", cost: "Price (Taka)", add_income: "Add Income",
    add_expense: "Add Expense", daily_overview: "Daily Overview", empty: "No transactions yet", profile_title: "Profile",
    current_profit: "Current Profit", target: "Target", earn_more: "Earn", earn_more_suffix: "more to unlock",
    badges: "Hall of Fame", seeds: "Seeds", storage: "Storage", care: "Care", back: "Back",
    dashboard: "Dashboard", next_7_days: "Next 7 Days",
    badge_diamond: "Diamond King (Platinum)", badge_gold: "Shonar Krishok (Gold)", badge_silver: "Rupali Krishok (Silver)",
    badge_bronze: "Udiyoman (Bronze)", badge_struggle: "Struggling", profit_100k: "Profit > 100k",
    profit_50k: "Profit > 50k", profit_10k: "Profit > 10k",
    community: "Community", search_placeholder: "Search username", search_btn: "Search", contact: "Contact",
    username: "Username", friend_profit: "Friend's Profit", friend_badge: "Friend's Badge", not_found: "Farmer not found",
    scanner_title: "Crop Scanner", upload_photo: "Upload Photo", take_photo: "Take Photo", analyzing: "AI Analysis in progress...",
    result_fresh: "Crop is Healthy (Fresh)", result_rotten: "Disease Detected (Rotten)", advice_title: "AI Diagnosis & Plan:",
    chat_title: "Solution Chatbox", chat_placeholder: "Ask your problem...", chat_welcome: "Welcome! I am your Agri-Assistant.",
    chat_typing: "AI is thinking...", listening: "Listening...",
    risk_title: "Risk Level:", action_plan: "Action Plan:",
    // Smart Alert Translations
    smart_alert_title: "Smart Alert",
    smart_alert_action: "See Action",
    risk_map_title: "Local Risk-Map", risk_map_desc: "Visualize community risks",
    risk_high: "High", risk_medium: "Medium", risk_low: "Low",
    risk_level: "Risk", crop_type: "Crop", last_update: "Last Update",
    recommended: "Suitable", avoid: "Avoid"
  }
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("Guest");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [view, setView] = useState<"dashboard" | "profile" | "community" | "scanner" | "chat" | "risk_map">("dashboard");
  const [lang, setLang] = useState<"bn" | "en">(() => (localStorage.getItem("app_lang") as "bn" | "en") || "bn");
  const [showMenu, setShowMenu] = useState(false);
  
  // Scanner State
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  // Chat & Voice State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiVoiceOn, setIsAiVoiceOn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Weather & Transaction State
  const [selectedDivision, setSelectedDivision] = useState("Dhaka");
  const [selectedMetric, setSelectedMetric] = useState<"temp" | "humidity" | "rain" | null>(null);
  const [realWeather, setRealWeather] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("sell");
  const [buyCategory, setBuyCategory] = useState<"seeds" | "storage" | "care">("seeds");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState(CROPS[0]);
  const [storageType, setStorageType] = useState(STORAGE_TYPES[0]);
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  
  // Community State
  const [searchQuery, setSearchQuery] = useState("");
  const [foundFriend, setFoundFriend] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Map State
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => { localStorage.setItem("app_lang", lang); }, [lang]);

  // Inject Leaflet CSS & JS dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);
    }
  }, []);

  // Weather Fetch
  useEffect(() => {
    const fetchWeather = async () => {
      setRealWeather(null);
      if (WEATHER_API_KEY.includes("PASTE")) return;
      try {
        const queryCity = selectedDivision === "Chattogram" ? "Chittagong" : selectedDivision;
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${queryCity},BD&units=metric&appid=${WEATHER_API_KEY}`);
        const data = await res.json();
        if (data.cod === 200) {
          const realTemp = Math.round(data.main.temp);
          setRealWeather({
            temp: realTemp, humidity: data.main.humidity, rain: data.clouds ? data.clouds.all : 20,
            forecast: [realTemp, realTemp - 1, realTemp + 2, realTemp, realTemp - 2, realTemp + 1, realTemp]
          });
        }
      } catch (e) { console.error("Weather API failed", e); }
    };
    fetchWeather();
  }, [selectedDivision]);

  // Init Data
  useEffect(() => {
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { setUserId(user.id); setUsername(user.email?.split('@')[0] || "User"); }
      const local = localStorage.getItem("harvest_transactions");
      if (local) setTransactions(JSON.parse(local));
      if (chatMessages.length === 0) setChatMessages([{ id: 1, text: t.chat_welcome, sender: 'bot' }]);
    };
    init();
    
    return () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [lang]);

  // Map Initialization
  useEffect(() => {
    if (view === "risk_map" && mapContainerRef.current) {
      const checkLeaflet = setInterval(() => {
        if ((window as any).L) {
          clearInterval(checkLeaflet);
          const L = (window as any).L;
          const center = DIVISION_DATA[selectedDivision] || DIVISION_DATA["Dhaka"];
          if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
          const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
          const getIcon = (color: string) => L.divIcon({ className: 'custom-div-icon', html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
          L.marker([center.lat, center.lng], { icon: getIcon('#2563EB') }).addTo(map).bindPopup(`<div style="font-family: 'Hind Siliguri', sans-serif; color: #1e40af; font-weight: bold;">আপনার অবস্থান</div>`);
          for (let i = 0; i < 15; i++) {
            const latOffset = (Math.random() - 0.5) * 0.06;
            const lngOffset = (Math.random() - 0.5) * 0.06;
            const risk = Math.random() > 0.6 ? 'High' : (Math.random() > 0.3 ? 'Medium' : 'Low');
            const color = risk === 'High' ? '#DC2626' : (risk === 'Medium' ? '#EAB308' : '#16A34A');
            const recCrop = CROPS[(Math.floor(Math.random() * CROPS.length) + 1) % CROPS.length].split(' (')[0];
            const riskLabel = risk === 'High' ? t.risk_high : (risk === 'Medium' ? t.risk_medium : t.risk_low);
            const areaName = lang === 'bn' ? `${t[selectedDivision] || selectedDivision} জোন-${toBanglaDigits(i + 1)}` : `${selectedDivision} Zone-${i + 1}`;
            L.marker([center.lat + latOffset, center.lng + lngOffset], { icon: getIcon(color) }).addTo(map).bindPopup(`<div style="font-family: 'Hind Siliguri', sans-serif;"><p style="font-size: 12px; color: #6b7280; font-weight: bold;">${lang === 'bn' ? 'এলাকা' : 'Area'}: ${areaName}</p><p style="font-size: 14px; font-weight: bold;">${t.risk_level}: <span style="color: ${color};">${riskLabel}</span></p><p style="font-size: 12px;">✅ ${t.recommended}: ${recCrop}</p></div>`);
          }
          mapInstanceRef.current = map;
          setMapInitialized(true);
          setTimeout(() => { map.invalidateSize(); }, 100);
        }
      }, 100);
      return () => clearInterval(checkLeaflet);
    }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; setMapInitialized(false); } };
  }, [view, selectedDivision, lang, t]);

  const currentWeather = realWeather || DIVISION_DATA[selectedDivision];
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const isProfit = netProfit >= 0;

  const handleAddTransaction = async () => {
    if (!cost) return;
    let details = ""; let name = itemName;
    if (activeTab === "sell") details = `${weight} Kg Sold`;
    else {
      if (buyCategory === "seeds") details = `${weight} Grams Bought`;
      if (buyCategory === "storage") { name = storageType; details = `${quantity} Units`; }
      if (buyCategory === "care") { name = `${itemName} Care`; details = "Fertilizer/Pesticide"; }
    }
    const newTx = { id: Date.now(), date: date, type: activeTab === "sell" ? "income" : "expense", category: activeTab === "sell" ? "harvest" : buyCategory, name: name, amount: Number(cost), details: details };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem("harvest_transactions", JSON.stringify(updated));
    setCost(""); setWeight(""); setQuantity("");
  };

  const handleSearchFriend = async () => {
      setSearchLoading(true); setSearchError(""); setFoundFriend(null);
      setTimeout(() => {
          const friend = DEMO_FARMERS.find(f => f.username.toLowerCase() === searchQuery.toLowerCase());
          if (friend) {
              const friendBadge = getBadgeData(friend.profit); 
              setFoundFriend({ ...friend, badgeName: friendBadge.name, badgeColor: friendBadge.color });
          } else { setSearchError(t.not_found); }
          setSearchLoading(false);
      }, 800);
  };
  const handleDelete = (id: number) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem("harvest_transactions", JSON.stringify(updated));
  };

  const getBadgeData = (profit: number) => {
    let current = { name: t.badge_struggle, color: "text-gray-400", bg: "bg-gray-100", icon: <User size={40}/>, next: 10000, nextName: lang === 'bn' ? "সিলভার" : "Silver" };
    if (profit >= 100000) current = { name: t.badge_diamond, color: "text-cyan-500", bg: "bg-cyan-50", icon: <Star size={40} fill="currentColor"/>, next: 1000000, nextName: "Legend" };
    else if (profit >= 50000) current = { name: t.badge_gold, color: "text-yellow-500", bg: "bg-yellow-100", icon: <Trophy size={40} fill="currentColor"/>, next: 100000, nextName: lang === 'bn' ? "প্লাটিনাম" : "Platinum" };
    else if (profit >= 10000) current = { name: t.badge_silver, color: "text-slate-500", bg: "bg-slate-100", icon: <Medal size={40} />, next: 50000, nextName: lang === 'bn' ? "গোল্ড" : "Gold" };
    else if (profit > 0) current = { name: t.badge_bronze, color: "text-orange-600", bg: "bg-orange-100", icon: <Award size={40} />, next: 10000, nextName: lang === 'bn' ? "সিলভার" : "Silver" };
    const progressPercent = Math.min(100, Math.max(5, (profit / current.next) * 100));
    const remaining = current.next - profit;
    return { ...current, progressPercent, remaining };
  };
  const badge = getBadgeData(netProfit);

  // --- SMART ALERT DECISION ENGINE (The "Task") ---
  const smartAlert = useMemo(() => {
    const isRainy = currentWeather.rain > 50;
    const isHumid = currentWeather.humidity > 80;
    const isHot = currentWeather.temp > 35;
    
    // Condition 1: Critical (Bad Weather for Storage)
    if (isRainy && isHumid) {
      return {
        level: 'Critical',
        title: lang === 'bn' ? 'জরুরি সতর্কতা' : 'Critical Alert',
        message: lang === 'bn'
          ? "আগামীকাল বৃষ্টি হবে এবং আপনার আলুর গুদামে আর্দ্রতা বেশি। এখনই ফ্যান চালু করুন।"
          : "Tomorrow it will rain and humidity is high in potato storage. Turn on fans now.",
        color: "bg-red-50 border-red-200 text-red-800",
        icon: <Fan className="animate-spin text-red-600" size={24} />,
        borderColor: "border-red-500"
      };
    }
    
    // Condition 2: Warning (High Heat)
    if (isHot) {
      return {
        level: 'Warning',
        title: lang === 'bn' ? 'সেচ সতর্কতা' : 'Irrigation Alert',
        message: lang === 'bn'
          ? `তাপমাত্রা ${toBanglaDigits(currentWeather.temp)}°C এর বেশি। বিকেলের দিকে সেচ দিন।`
          : `Temp is over ${currentWeather.temp}°C. Irrigate in the afternoon.`,
        color: "bg-orange-50 border-orange-200 text-orange-800",
        icon: <Thermometer className="text-orange-600" size={24} />,
        borderColor: "border-orange-400"
      };
    }

    // Condition 3: Good (Normal)
    return {
      level: 'Good',
      title: lang === 'bn' ? 'স্মার্ট বার্তা' : 'Smart Update',
      message: lang === 'bn' ? "আবহাওয়া অনুকূলে আছে। নিয়মিত পরিচর্যা করুন।" : "Weather conditions are favorable. Continue regular care.",
      color: "bg-green-50 border-green-200 text-green-800",
      icon: <CheckCircle className="text-green-600" size={24} />,
      borderColor: "border-green-500"
    };
  }, [currentWeather, lang]);

  // --- SMS SIMULATION (Console Log) ---
  useEffect(() => {
    if (smartAlert.level === 'Critical') {
        console.log(`%c[SMS SENT to ${username || 'User'}]: ${smartAlert.message}`, 'color: red; font-weight: bold; font-size: 14px;');
    }
  }, [smartAlert, username]);

  // --- VOICE FUNCTIONS ---
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    const voices = window.speechSynthesis.getVoices();
    const banglaVoice = voices.find(v => v.lang.includes('bn'));
    if (banglaVoice) utterance.voice = banglaVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (recognitionRef.current) recognitionRef.current.abort();
    setIsAiVoiceOn(true);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'bn-BD';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => { const transcript = event.results[0][0].transcript; setChatInput(transcript); handleSendChat(transcript); };
    recognition.onend = () => setIsListening(false);
    try { recognition.start(); } catch (e) { console.error(e); }
  };
  const stopListening = () => { if (recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); } };
  const handleSendChat = async (manualInput?: string) => {
      const textToSend = manualInput || chatInput; if (!textToSend.trim()) return;
      const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
      setChatMessages(prev => [...prev, userMsg]); setChatInput(""); setIsTyping(true);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      const reply = await callAiChat(userMsg.text);
      const botMsg = { id: Date.now() + 1, text: reply, sender: 'bot' };
      setChatMessages(prev => [...prev, botMsg]); setIsTyping(false);
      if (isAiVoiceOn) speakText(reply);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  const handleFileUpload = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              setScannedImage(reader.result as string); setScanning(true); setScanResult(null);
              let aiData = await callAiVision(file, lang);
              setScanning(false); setScanResult(aiData);
          };
          reader.readAsDataURL(file);
      }
  };

  // --- VIEWS ---
  if (selectedMetric) {
    const titles = { temp: t.temp, humidity: t.humidity, rain: t.rain };
    const units = { temp: "°C", humidity: "%", rain: "%" };
    const colors = { temp: "bg-red-500", humidity: "bg-blue-500", rain: "bg-gray-600" };
    const days = Array.from({length: 7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toLocaleDateString('en-US', { weekday: 'short' }); });
    const forecastData = currentWeather.forecast.map((val: number) => Math.floor(val));
    return (<div className="min-h-screen bg-white font-['Hind_Siliguri'] p-4"><button onClick={() => setSelectedMetric(null)} className="flex items-center gap-2 text-gray-600 mb-6 font-bold text-lg p-2 hover:bg-gray-100 rounded-lg w-full"><ArrowLeft /> {t.back}</button><h2 className="text-3xl font-bold text-[#2F5233] mb-2">{titles[selectedMetric]}</h2><div className="space-y-4">{days.map((day, i) => ( <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="bg-gray-50 p-4 rounded-xl flex items-center gap-4"><span className="w-12 font-bold text-gray-400">{day}</span><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${forecastData[i]}%` }} className={`h-full ${colors[selectedMetric]}`}/></div><span className="w-12 font-bold text-right">{lang === 'bn' ? toBanglaDigits(forecastData[i]) : forecastData[i]}{units[selectedMetric]}</span></motion.div>))}</div></div>);
  }

  if (view === "scanner") {
      return (<div className="min-h-screen bg-black font-['Hind_Siliguri'] pb-20 p-4 flex flex-col items-center justify-center relative"><button onClick={() => setView("dashboard")} className="absolute top-4 left-4 z-50 bg-white/20 p-2 rounded-full text-white backdrop-blur-md"><ArrowLeft /></button><div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative min-h-[60vh] flex flex-col"><div className="bg-[#2F5233] p-4 text-white text-center font-bold flex items-center justify-center gap-2"><ScanLine className="animate-pulse"/> {t.scanner_title}</div><div className="flex-1 bg-gray-100 flex items-center justify-center relative p-4">{scannedImage ? (<img src={scannedImage} alt="Crop" className="max-h-[400px] rounded-lg shadow-md object-cover" />) : (<div className="text-gray-400 flex flex-col items-center"><Camera size={64} className="mb-4 opacity-50"/><p>Take Photo</p></div>)}{scanning && (<div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20"><Loader2 size={48} className="animate-spin mb-4 text-[#E9D66B]"/><p className="font-bold text-lg animate-pulse">{t.analyzing}</p></div>)}</div><div className="p-6 bg-white border-t border-gray-100">{scanResult ? (<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-left"><div className="flex justify-between items-center mb-4"><h3 className={`text-xl font-bold ${scanResult.color} flex items-center gap-2`}>{scanResult.status}</h3></div><div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FileText size={16}/> {t.action_plan}</h4><ul className="text-sm text-gray-600 space-y-2">{scanResult.advice.map((tip: string, i: number) => (<li key={i}>• {tip}</li>))}</ul></div><button onClick={() => {setScannedImage(null); setScanResult(null)}} className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Scan Again</button></motion.div>) : (<div className="flex gap-4"><label className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 py-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold cursor-pointer active:scale-95 transition"><Upload size={24}/> {t.upload_photo}<input type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/></label><label className="flex-1 bg-green-50 text-green-600 border border-green-200 py-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold cursor-pointer active:scale-95 transition"><Camera size={24}/> {t.take_photo}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload}/></label></div>)}</div></div></div>);
  }

  if (view === "chat") {
      return (<div className="min-h-screen bg-[#E5E7EB] font-['Hind_Siliguri'] pb-20 flex flex-col"><div className="bg-[#2F5233] p-4 text-white flex items-center gap-3 sticky top-0 z-50 shadow-md"><button onClick={() => { window.speechSynthesis.cancel(); setView("dashboard"); }}><ArrowLeft /></button><div className="flex-1"><h2 className="font-bold text-lg">{t.chat_title}</h2><p className="text-xs text-green-200">{isSpeaking ? "Speaking..." : "AI + Voice"}</p></div><button onClick={() => setIsAiVoiceOn(!isAiVoiceOn)} className={`p-2 rounded-full transition border ${isAiVoiceOn ? "bg-white text-[#2F5233] border-white" : "bg-transparent text-white/70 border-white/30"}`}>{isAiVoiceOn ? <Volume2 size={20} className={isSpeaking ? "animate-pulse" : ""} /> : <VolumeX size={20} />}</button></div><div className="flex-1 p-4 space-y-4 overflow-y-auto">{chatMessages.map((msg) => (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-[#2F5233] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>{msg.text}</div></motion.div>))}{isTyping && (<div className="flex justify-start"><div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-gray-500 italic flex items-center gap-2"><Loader2 size={12} className="animate-spin"/> {t.chat_typing}</div></div>)}<div ref={chatEndRef} /></div><div className="p-4 bg-white sticky bottom-0 border-t border-gray-200"><div className="flex gap-2 items-center"><button onClick={isListening ? stopListening : startListening} className={`p-3 rounded-full shadow-lg transition active:scale-90 ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-600"}`}>{isListening ? <StopCircle size={20} /> : <Mic size={20} />}</button><input type="text" className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" placeholder={t.chat_placeholder} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}/><button onClick={() => handleSendChat()} className="bg-[#2F5233] text-white p-3 rounded-full shadow-lg active:scale-90 transition"><Send size={20}/></button></div></div></div>);
  }

  if (view === "risk_map") {
    return (<div className="min-h-screen bg-white font-['Hind_Siliguri'] flex flex-col"><style>{`.leaflet-pane img, .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow { max-width: none !important; max-height: none !important; } .leaflet-container { z-index: 0; } .custom-div-icon { background: transparent; border: none; }`}</style><div className="bg-[#2F5233] p-4 text-white flex items-center gap-3 sticky top-0 z-50 shadow-md"><button onClick={() => setView("dashboard")} className="p-1 hover:bg-white/20 rounded-full transition"><ArrowLeft /></button><div className="flex-1"><h2 className="font-bold text-lg flex items-center gap-2"><MapIcon size={20} /> {t.risk_map_title}</h2><p className="text-xs text-green-100 opacity-90">{t.risk_map_desc}</p></div></div><div className="flex-1 relative bg-gray-100"><div id="map-container" ref={mapContainerRef} className="absolute inset-0 z-0" /><div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 z-10"><h4 className="font-bold text-gray-700 text-sm mb-3 border-b pb-2 flex justify-between"><span>{t.risk_level}</span><span className="text-gray-400 font-normal text-xs">{t.crop_type} (Demo)</span></h4><div className="flex justify-between items-center text-xs font-bold"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow"></div><span>{t.risk_low}</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow"></div><span>{t.risk_medium}</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow"></div><span>{t.risk_high}</span></div></div></div></div></div>);
  }

  if (view === "profile") { return (<div className="min-h-screen bg-[#F5F7F5] font-['Hind_Siliguri'] pb-20 p-4"><button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-gray-600 mb-6 font-bold text-lg p-2 hover:bg-gray-100 rounded-lg w-full"><ArrowLeft /> {t.dashboard}</button><div className="bg-white p-6 rounded-3xl shadow-lg text-center mb-6 border border-gray-100 relative overflow-hidden"><div className={`absolute top-0 left-0 w-full h-2 ${badge.bg}`}></div><div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-4 ${badge.bg} border-4 border-white shadow-2xl relative z-10`}>{badge.icon}</div><h2 className="text-2xl font-bold text-gray-800 capitalize">{username}</h2><div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${badge.bg} ${badge.color}`}>{badge.name}</div><div className="mt-6 text-left"><div className="flex justify-between text-xs font-bold mb-1"><span className="text-gray-500">{t.current_profit}: ৳{formatCurrency(netProfit, lang)}</span><span className="text-[#2F5233]">{t.target}: ৳{formatCurrency(badge.next, lang)}</span></div><div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${badge.progressPercent}%` }} className="h-full bg-gradient-to-r from-green-400 to-[#2F5233]" /></div></div></div></div>); }

  if (view === "community") { return (<div className="min-h-screen bg-[#F5F7F5] font-['Hind_Siliguri'] pb-20 p-4"><button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-gray-600 mb-6 font-bold text-lg p-2 hover:bg-gray-100 rounded-lg w-full"><ArrowLeft /> {t.dashboard}</button><h2 className="text-2xl font-bold text-[#2F5233] mb-4">{t.community}</h2><div className="flex gap-2 mb-6"><div className="relative flex-1"><input type="text" placeholder={t.search_placeholder} className="w-full p-3 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/><Search className="absolute left-3 top-3 text-gray-400" size={20}/></div><button onClick={handleSearchFriend} disabled={searchLoading} className="bg-[#2F5233] text-white px-4 rounded-xl font-bold disabled:opacity-50">{searchLoading ? <Loader2 className="animate-spin"/> : t.search_btn}</button></div>{foundFriend && (<div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100"><div className="flex items-center gap-4 mb-4"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-700"><User size={30} /></div><div><h3 className="text-xl font-bold capitalize">{foundFriend.name}</h3><p className="text-sm text-gray-500">@{foundFriend.username}</p></div></div><div className="p-4 bg-green-50 rounded-xl border border-green-100"><p className="text-sm text-gray-600 mb-1">{t.friend_profit}</p><h2 className="text-3xl font-bold text-[#2F5233]">৳ {formatCurrency(foundFriend.profit, lang)}</h2></div></div>)}</div>); }

  // --- DASHBOARD (Main View) ---
  return (
    <div className="min-h-screen bg-[#F5F7F5] font-['Hind_Siliguri'] pb-20">
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition" onClick={() => setShowMenu(!showMenu)}>
            <div className="bg-[#2F5233] p-2.5 rounded-xl border-2 border-[#E9D66B] shadow-lg shadow-green-900/20 relative overflow-hidden"><div className="absolute top-0 right-0 w-4 h-4 bg-[#E9D66B] opacity-50 rounded-full blur-sm"></div><Sprout size={28} className="text-white relative z-10" strokeWidth={2} /></div><div><h1 className="text-xl font-bold text-[#2F5233] leading-tight">{t.app_title}</h1><p className="text-xs text-gray-500 font-medium">{t.sub_title}</p></div>
        </div>
        <AnimatePresence>{showMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-16 left-4 bg-white shadow-xl rounded-xl border border-green-100 p-2 z-50 w-56">
            <button onClick={() => { setShowMenu(false); setView("scanner"); }} className="flex items-center gap-3 w-full p-3 hover:bg-green-50 rounded-lg text-gray-700 font-bold border-b border-gray-100"><ScanLine size={18} className="text-[#2F5233]"/> {t.scanner_title}</button>
            <button onClick={() => { setShowMenu(false); setView("chat"); }} className="flex items-center gap-3 w-full p-3 hover:bg-blue-50 rounded-lg text-gray-700 font-bold border-b border-gray-100"><MessageCircle size={18} className="text-blue-600"/> {t.chat_title}</button>
            <button onClick={() => { setShowMenu(false); setView("risk_map"); }} className="flex items-center gap-3 w-full p-3 hover:bg-orange-50 rounded-lg text-gray-700 font-bold"><MapIcon size={18} className="text-orange-600"/> {t.risk_map_title}</button>
          </motion.div>
        )}</AnimatePresence>
        
        {/* --- HEADER (Red Box Area) Cleaned Up --- */}
        <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="bg-white border border-gray-300 p-2 rounded-full text-gray-600 hover:bg-gray-100 transition shadow-sm font-bold text-xs">{lang === 'bn' ? 'EN' : 'বাংলা'}</button>
            <button onClick={() => setView("community")} className="bg-white border border-gray-300 p-2 rounded-full text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition shadow-sm"><Users size={20} /></button>
            <button onClick={() => setView("profile")} className="bg-white border border-gray-300 p-2 rounded-full text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition relative shadow-sm"><User size={20} />{netProfit > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}</button>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold ${isOffline ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}><Cloud size={14} />{isOffline ? "Off" : "On"}</div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden bg-gradient-to-r ${isProfit ? "from-[#E9D66B] to-[#F4A261]" : "from-red-500 to-red-700"}`}><div className="absolute right-[-20px] top-[-20px] opacity-20"><Wallet size={100} /></div><p className="text-white/90 font-bold mb-1">{isProfit ? t.net_profit : t.net_loss}</p><h2 className="text-4xl font-bold flex items-center gap-2">{isProfit ? "+" : ""} ৳ {formatCurrency(netProfit, lang)}</h2><div className="flex gap-4 mt-4 text-xs font-bold bg-black/10 p-2 rounded-lg inline-flex"><span className="text-white">{t.income}: ৳{formatCurrency(totalIncome, lang)}</span><span className="text-white/70">{t.expense}: ৳{formatCurrency(totalExpense, lang)}</span></div></motion.div>

        {/* --- WEATHER & SMART ALERT (Brown Box Area) --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-700 flex items-center gap-2"><Cloud size={20} className="text-blue-500"/> {t.weather}</h3><div className="relative"><span className="font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">{t.location} <ChevronDown size={12}/></span><select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)} className="absolute inset-0 w-full opacity-0">{DIVISIONS.map(div => <option key={div} value={div}>{t[div] || div}</option>)}</select></div></div>
            <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => setSelectedMetric('temp')} className="w-full text-left bg-red-50 p-3 rounded-xl hover:bg-red-100 transition"><div className="flex items-center gap-2 text-red-500 mb-1"><Thermometer size={16} /> {t.temp}</div><div className="flex justify-between items-end"><p className="text-2xl font-bold text-gray-800">{lang === 'bn' ? toBanglaDigits(currentWeather.temp) : currentWeather.temp}°C</p><ChevronRight size={16} className="text-red-300"/></div></button>
                <button onClick={() => setSelectedMetric('humidity')} className="w-full text-left bg-blue-50 p-3 rounded-xl hover:bg-blue-100 transition"><div className="flex items-center gap-2 text-blue-500 mb-1"><Droplets size={16} /> {t.humidity}</div><div className="flex justify-between items-end"><p className="text-2xl font-bold text-gray-800">{lang === 'bn' ? toBanglaDigits(currentWeather.humidity) : currentWeather.humidity}%</p><ChevronRight size={16} className="text-blue-300"/></div></button>
                <button onClick={() => setSelectedMetric('rain')} className="w-full text-left bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition"><div className="flex items-center gap-2 text-gray-600 mb-1"><Cloud size={16} /> {t.rain}</div><div className="flex justify-between items-end"><p className="text-2xl font-bold text-gray-800">{lang === 'bn' ? toBanglaDigits(currentWeather.rain) : currentWeather.rain}%</p><ChevronRight size={16} className="text-gray-400"/></div></button>
                <div className="bg-orange-50 p-3 rounded-xl relative"><div className="flex items-center gap-2 text-orange-500 mb-1"><MapPin size={16} /> {t.location}</div><p className="text-xl font-bold text-gray-800 truncate">{t[selectedDivision] || selectedDivision}</p><select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)} className="absolute inset-0 w-full opacity-0">{DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}</select></div>
            </div>

            {/* 🔴 SMART ALERT SYSTEM UI 🔴 */}
            <div className={`border-l-4 p-4 rounded-r-lg shadow-sm flex items-start gap-3 transition-all duration-500 ${smartAlert.color} ${smartAlert.borderColor}`}>
                <div className={`mt-1 p-2 bg-white rounded-full shadow-sm`}>{smartAlert.icon}</div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm uppercase tracking-wide opacity-80 mb-1 flex items-center justify-between">
                        {smartAlert.title}
                        {smartAlert.level === 'Critical' && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75 right-8"></span>}
                    </h4>
                    <p className="text-sm font-bold leading-relaxed">{smartAlert.message}</p>
                    {smartAlert.level === 'Critical' && (
                        <button className="mt-3 flex items-center gap-2 text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform text-red-600 border border-red-100">
                            <Bell size={12} className="fill-red-600 animate-bounce" /> {t.smart_alert_action}
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#2F5233] mb-4">{t.add_transaction}</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl mb-4"><button onClick={() => setActiveTab("sell")} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${activeTab === "sell" ? "bg-green-600 text-white shadow" : "text-gray-500"}`}><TrendingUp size={16}/> {t.sell_btn}</button><button onClick={() => setActiveTab("buy")} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${activeTab === "buy" ? "bg-red-500 text-white shadow" : "text-gray-500"}`}><TrendingDown size={16}/> {t.buy_btn}</button></div>
            {activeTab === "buy" && <div className="flex gap-2 mb-4 overflow-x-auto pb-2"><button onClick={() => setBuyCategory("seeds")} className={`px-3 py-1 rounded-full text-xs font-bold border ${buyCategory === "seeds" ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-200"}`}>{t.seeds}</button><button onClick={() => setBuyCategory("storage")} className={`px-3 py-1 rounded-full text-xs font-bold border ${buyCategory === "storage" ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-200"}`}>{t.storage}</button><button onClick={() => setBuyCategory("care")} className={`px-3 py-1 rounded-full text-xs font-bold border ${buyCategory === "care" ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-200"}`}>{t.care}</button></div>}
            <div className="space-y-3">
                <div className="flex flex-col"><label className="text-xs font-bold text-gray-500 mb-1">{t.date}</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200"/></div>
                {(activeTab === "sell" || buyCategory === "seeds") && <><select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" value={itemName} onChange={(e) => setItemName(e.target.value)}>{CROPS.map(c => <option key={c} value={c}>{c}</option>)}</select><input type="number" placeholder={activeTab === "sell" ? t.weight_kg : t.weight_g} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" value={weight} onChange={(e) => setWeight(e.target.value)} /></>}
                {activeTab === "buy" && buyCategory === "storage" && <><select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" value={storageType} onChange={(e) => setStorageType(e.target.value)}>{STORAGE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select><input type="number" placeholder="Quantity" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></>}
                {activeTab === "buy" && buyCategory === "care" && <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">Cost for: <strong>{itemName}</strong></div>}
                <input type="number" placeholder={t.cost} className={`w-full p-3 border-2 rounded-xl font-bold ${activeTab === "sell" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`} value={cost} onChange={(e) => setCost(e.target.value)} />
                <button onClick={handleAddTransaction} className={`w-full font-bold py-3 rounded-xl mt-2 text-white shadow-lg ${activeTab === "sell" ? "bg-[#2F5233]" : "bg-red-600"}`}>{activeTab === "sell" ? t.add_income : t.add_expense}</button>
            </div>
        </div>

        <div className="space-y-3">
            <h3 className="font-bold text-gray-500 text-sm">{t.daily_overview}</h3>
            {transactions.length === 0 && <p className="text-center text-gray-400 py-4">{t.empty}</p>}
            {transactions.map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-gray-100" style={{ borderLeftColor: t.type === 'income' ? '#16a34a' : '#ef4444' }}>
                    <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{t.category === 'harvest' && <Sprout size={18}/>}{t.category === 'seeds' && <Sprout size={18}/>}{t.category === 'storage' && <Package size={18}/>}{t.category === 'care' && <FlaskConical size={18}/>}</div><div><h4 className="font-bold text-gray-800 text-sm">{t.name}</h4><p className="text-xs text-gray-500">{t.details} • {t.date}</p></div></div>
                    <div className="text-right"><span className={`block font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? "+" : "-"} ৳{formatCurrency(t.amount, lang)}</span><button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-400 mt-1"><Trash2 size={14} /></button></div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
