import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface Translations {
  title: string;
  waste: string;
  cta: string;
  login: string;
  weather: string;
  advice_spray: string;
  advice_wait: string;
  signup: string;
  email: string;
  password: string;
  fullName: string;
  dashboard: string;
  welcome: string;
  offline: string;
  online: string;
  addCrop: string;
  cropName: string;
  weight: string;
  status: string;
  save: string;
  cancel: string;
  temperature: string;
  humidity: string;
  rainChance: string;
  location: string;
  foodSaved: string;
  protectHarvest: string;
  noAccount: string;
  hasAccount: string;
  logout: string;
  yourCrops: string;
  noCrops: string;
  pending: string;
  harvested: string;
  sold: string;
}

const translations: Record<Language, Translations> = {
  bn: {
    title: "হারভেস্টগার্ড",
    waste: "৪.৫ লক্ষ টন খাদ্য অপচয়",
    cta: "আমার ফসল রক্ষা করুন",
    login: "কৃষক লগইন",
    weather: "আবহাওয়া বার্তা",
    advice_spray: "⚠️ আর্দ্রতা বেশি: ছত্রাকনাশক দিন",
    advice_wait: "⛔ বৃষ্টি হবে: সার দেবেন না",
    signup: "নতুন অ্যাকাউন্ট",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    fullName: "পুরো নাম",
    dashboard: "ড্যাশবোর্ড",
    welcome: "স্বাগতম",
    offline: "অফলাইন",
    online: "অনলাইন",
    addCrop: "ফসল যোগ করুন",
    cropName: "ফসলের নাম",
    weight: "ওজন (কেজি)",
    status: "অবস্থা",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    rainChance: "বৃষ্টির সম্ভাবনা",
    location: "অবস্থান",
    foodSaved: "খাদ্য সংরক্ষিত",
    protectHarvest: "আপনার ফসল রক্ষা করুন",
    noAccount: "অ্যাকাউন্ট নেই?",
    hasAccount: "অ্যাকাউন্ট আছে?",
    logout: "লগআউট",
    yourCrops: "আপনার ফসল",
    noCrops: "কোনো ফসল যোগ করা হয়নি",
    pending: "অপেক্ষমাণ",
    harvested: "কর্তিত",
    sold: "বিক্রিত",
  },
  en: {
    title: "HarvestGuard",
    waste: "4.5 Million Tonnes Wasted",
    cta: "Protect My Harvest",
    login: "Farmer Login",
    weather: "Weather Forecast",
    advice_spray: "High Humidity: Spray Fungicide",
    advice_wait: "Rain Coming: Don't Fertilize",
    signup: "Create Account",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    dashboard: "Dashboard",
    welcome: "Welcome",
    offline: "Offline",
    online: "Online",
    addCrop: "Add Crop",
    cropName: "Crop Name",
    weight: "Weight (kg)",
    status: "Status",
    save: "Save",
    cancel: "Cancel",
    temperature: "Temperature",
    humidity: "Humidity",
    rainChance: "Rain Chance",
    location: "Location",
    foodSaved: "Food Saved",
    protectHarvest: "Protect Your Harvest",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    logout: "Logout",
    yourCrops: "Your Crops",
    noCrops: "No crops added yet",
    pending: "Pending",
    harvested: "Harvested",
    sold: "Sold",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bn');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
