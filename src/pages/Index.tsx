import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [lang, setLang] = useState("bn");
  const { scrollYProgress } = useScroll();
  
  // Background transition
  const background = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#1A1A1A", "#2F5233", "#E9D66B"]
  );

  const content = {
    en: {
      title: "Every Grain Counts.",
      waste: "Bangladesh loses 4.5 Million Tonnes.",
      money: "$1.5 Billion Lost.",
      cta: "Protect My Harvest",
      hero_sub: "Stop food loss before it happens.",
      prob_sub: "Farmers work hard, but poor storage destroys the profit."
    },
    bn: {
      title: "প্রতিটি দানা মূল্যবান।",
      waste: "৪.৫ লক্ষ টন খাদ্যশস্য অপচয় হচ্ছে।",
      money: "১.৫ বিলিয়ন ডলার ক্ষতি।",
      cta: "আমার ফসল রক্ষা করুন",
      hero_sub: "খাদ্য অপচয় রোধ করুন, মুনাফা বাড়ান।",
      prob_sub: "কৃষকের কঠোর পরিশ্রম, কিন্তু সংরক্ষণের অভাবে সব শেষ।"
    }
  };

  const t = content[lang as keyof typeof content];

  return (
    <motion.div style={{ background }} className="min-h-[200vh] text-white font-['Hind_Siliguri'] overflow-hidden">
      
      {/* Navbar */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 hover:bg-black/50 transition"
        >
          <Globe size={16} />
          {lang === "en" ? "Bangla" : "English"}
        </button>
      </div>

      {/* SECTION 1: HERO (Happy Image Background) */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center p-6">
        
        {/* The Happy Image (Absolute Background) */}
        <div className="absolute inset-0 z-0 opacity-40">
            <img src="/happy.png" alt="Happy Farmer" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#1A1A1A]"></div>
        </div>

        <div className="z-10 max-w-4xl">
            <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-4 text-[#E9D66B] drop-shadow-lg"
            >
            {t.title}
            </motion.h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 drop-shadow-md">{t.hero_sub}</p>
            
            <Link to="/auth">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#2F5233] border border-[#E9D66B] text-white text-xl font-bold px-8 py-3 rounded-full shadow-xl flex items-center gap-2 mx-auto"
                >
                    {t.cta} <ArrowRight />
                </motion.button>
            </Link>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM (Sad Image Split) */}
      <section className="h-screen flex flex-col md:flex-row items-center justify-center p-6 gap-8 bg-black/20 backdrop-blur-sm">
        
        {/* Sad Image */}
        <motion.div 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="w-full md:w-1/2 max-w-md"
        >
            <img src="/sad.png" alt="Sad Farmer" className="rounded-2xl shadow-2xl border border-red-500/30 grayscale hover:grayscale-0 transition duration-500" />
        </motion.div>

        {/* The Stats */}
        <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="w-full md:w-1/2 text-left"
        >
            <h2 className="text-5xl font-bold text-red-500 mb-4">{t.money}</h2>
            <h3 className="text-3xl font-bold text-white mb-2">{t.waste}</h3>
            <p className="text-lg text-white/70">{t.prob_sub}</p>
        </motion.div>
      </section>

      {/* SECTION 3: THE SOLUTION VISUALIZER */}
      <section className="h-[50vh] flex flex-col justify-center items-center text-center p-6 bg-[#2F5233]">
        <h2 className="text-3xl font-bold mb-8">HarvestGuard Impact</h2>
        
        {/* The Bar Animation */}
        <div className="w-full max-w-lg bg-black/30 h-8 rounded-full overflow-hidden relative border border-white/10">
            <motion.div 
                initial={{ width: "5%", backgroundColor: "#ef4444" }} // Red start
                whileInView={{ width: "100%", backgroundColor: "#22c55e" }} // Green end
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full absolute left-0 top-0 flex items-center justify-end px-4"
            >
                <span className="text-xs font-bold text-black">SAVED</span>
            </motion.div>
        </div>
        <p className="mt-4 text-sm opacity-60">Visualizing 100% Crop Protection</p>
      </section>

    </motion.div>
  );
};

export default Index;