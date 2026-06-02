import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Droplet, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  UtensilsCrossed, 
  Trash2,
  Bell,
  Heart,
  Footprints
} from "lucide-react";
import { UserProfile, FoodLog, WaterLog } from "../types";
import { motion } from "motion/react";

interface DashboardProps {
  user: UserProfile;
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  onAddWater: (amountMl: number, optDate?: string) => void;
  onRemoveFoodLog: (id: string) => void;
  onAddQuickMeal: (name: string, cal: number, protein: number, carbs: number, fats: number, type: "Breakfast" | "Lunch" | "Dinner" | "Snack", optDate?: string) => void;
  setView: (view: "dashboard" | "tracker" | "insights" | "ai" | "social" | "profile") => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getLocalDateString: (date?: Date) => string;
}

export default function Dashboard({ 
  user, 
  foodLogs, 
  waterLogs, 
  onAddWater, 
  onRemoveFoodLog, 
  onAddQuickMeal,
  setView,
  selectedDate,
  setSelectedDate,
  getLocalDateString
}: DashboardProps) {
  const [quickMealType, setQuickMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [customWater, setCustomWater] = useState("");
  
  // Track dynamically selected active day
  const todayStr = getLocalDateString();

  // Fully Live Tracking Telemetry States
  const [liveSteps, setLiveSteps] = useState<number>(() => {
    const cached = localStorage.getItem("dietview_live_steps");
    return cached ? parseInt(cached) : 5420;
  });
  const [liveActiveKcal, setLiveActiveKcal] = useState<number>(() => {
    const cached = localStorage.getItem("dietview_live_kcal");
    return cached ? parseFloat(cached) : 210.6;
  });
  const [liveBpm, setLiveBpm] = useState<number>(72);
  const [livePulse, setLivePulse] = useState<boolean>(false);

  // Real GPS Geolocation States
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>("Initializing...");
  const prevCoordsRef = React.useRef<{ latitude: number; longitude: number } | null>(null);

  // Smart Notification Permission States
  const [notificationsAuthorized, setNotificationsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem("dietview_notif_granted") === "true";
  });
  const [showNotifBanner, setShowNotifBanner] = useState<boolean>(() => {
    return localStorage.getItem("dietview_notif_dismissed") !== "true" && localStorage.getItem("dietview_notif_granted") !== "true";
  });
  const [showInAppNotif, setShowInAppNotif] = useState<string | null>(null);

  // Real GPS sensor watch to translate client location coordinates stream into physical steps
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsStatus("Unsupported");
      return;
    }

    setGpsStatus("Searching satellite...");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsLatitude(latitude);
        setGpsLongitude(longitude);
        setGpsAccuracy(accuracy);
        setGpsStatus(`Connected (±${Math.round(accuracy)}m)`);

        const prev = prevCoordsRef.current;
        if (prev) {
          // Haversine displacement calculation formula
          const R = 6371000; // Earth radius in meters
          const dLat = (latitude - prev.latitude) * Math.PI / 180;
          const dLon = (longitude - prev.longitude) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(prev.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distanceMeters = R * c;

          // Guard against GPS drift jumps/teleportation.
          // Filter distance transitions smaller than 1.5 meters or absurd offsets above 150 meters per watch report.
          if (distanceMeters >= 1.5 && distanceMeters < 150) {
            const addedSteps = Math.round(distanceMeters / 0.75); // average stride value
            if (addedSteps > 0) {
              setLiveSteps(steps => {
                const updated = steps + addedSteps;
                localStorage.setItem("dietview_live_steps", String(updated));
                return updated;
              });

              setLiveActiveKcal(kcal => {
                const addedBurn = Number((addedSteps * 0.04).toFixed(1));
                const updated = Number((kcal + addedBurn).toFixed(1));
                localStorage.setItem("dietview_live_kcal", String(updated));
                return updated;
              });
            }
          }
        }

        prevCoordsRef.current = { latitude, longitude };
      },
      (error) => {
        console.warn("Live movement tracking blocked or failed:", error.message);
        setGpsStatus(`Muted: ${error.code === 1 ? "Permission Denied" : "Search Error"}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Pulse & Heart Diagnostics simulation ticking beautifully
  useEffect(() => {
    const trackerTimer = setInterval(() => {
      setLiveBpm(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(84, Math.max(65, prev + delta));
      });
      
      // Pulse heart visual trigger
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 300);

    }, 3200);

    return () => clearInterval(trackerTimer);
  }, []);

  // Occasional Simulated Smart Logging push alert to demonstrate live notification alerts
  useEffect(() => {
    if (!notificationsAuthorized) return;

    // Trigger alert after 10 seconds to prompt standard meal reminders or success logging
    const alertTimer = setTimeout(() => {
      setShowInAppNotif("🔔 Friendly Reminder: Time to log your afternoon Hydration target!");
      setTimeout(() => setShowInAppNotif(null), 5000);
    }, 12000);

    return () => clearTimeout(alertTimer);
  }, [notificationsAuthorized]);

  const handleRequestNotifications = async () => {
    // Attempt standard browser notification interface
    if ("Notification" in window) {
      try {
        const result = await Notification.requestPermission();
        if (result === "granted") {
          setNotificationsAuthorized(true);
          setShowNotifBanner(false);
          localStorage.setItem("dietview_notif_granted", "true");
          // Dispatch standard native alert if granted
          new Notification("DietView active!", {
            body: "Meal reminders and nutritional deficits are now synced in real-time.",
            icon: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100"
          });
        } else {
          // Fallback simulation
          setNotificationsAuthorized(true);
          setShowNotifBanner(false);
          localStorage.setItem("dietview_notif_granted", "true");
        }
      } catch (e) {
        // Fallback for sandboxed context where Notification isn't allowed
        setNotificationsAuthorized(true);
        setShowNotifBanner(false);
        localStorage.setItem("dietview_notif_granted", "true");
      }
    } else {
      setNotificationsAuthorized(true);
      setShowNotifBanner(false);
      localStorage.setItem("dietview_notif_granted", "true");
    }
  };

  const handleDismissNotifications = () => {
    setShowNotifBanner(false);
    localStorage.setItem("dietview_notif_dismissed", "true");
  };

  const todaysFood = foodLogs.filter(log => log.date === selectedDate);
  const todaysWater = waterLogs.filter(log => log.date === selectedDate).reduce((acc, curr) => acc + curr.amount, 0);

  // Computations based on current selected day
  const totalCalories = todaysFood.reduce((acc, curr) => acc + Number(curr.calories || 0), 0);
  const totalProtein = todaysFood.reduce((acc, curr) => acc + Number(curr.protein || 0), 0);
  const totalCarbs = todaysFood.reduce((acc, curr) => acc + Number(curr.carbs || 0), 0);
  const totalFats = todaysFood.reduce((acc, curr) => acc + Number(curr.fats || 0), 0);

  const calorieRemaining = Math.max(0, Number(user.calorieTarget || 0) - totalCalories);
  const calPercent = Math.min(100, (totalCalories / Math.max(1, Number(user.calorieTarget || 1))) * 100);

  // Grams Left values matching image requirements
  const proteinLeft = Math.max(0, Number(user.proteinTarget || 0) - totalProtein);
  const carbsLeft = Math.max(0, Number(user.carbTarget || 0) - totalCarbs);
  const fatsLeft = Math.max(0, Number(user.fatTarget || 0) - totalFats);

  const quickCatalog = [
    { name: "Sunny Side Egg & Toast", cal: 280, protein: 14, carbs: 24, fats: 10, category: "Breakfast" as const },
    { name: "Spiced Herb Chicken Breast", cal: 350, protein: 35, carbs: 5, fats: 8, category: "Lunch" as const },
    { name: "Steamed Salmon & Broccoli", cal: 480, protein: 38, carbs: 12, fats: 14, category: "Dinner" as const },
    { name: "Mixed Almonds & Berries", cal: 180, protein: 6, carbs: 15, fats: 12, category: "Snack" as const }
  ];

  // Generate 7 days in the weekday date carousels (Wed 27 to Tue 02-ish centered around current date)
  const getWeekDays = () => {
    const days = [];
    const baseDate = new Date();
    // Gather 6 days in the past and today
    for (let i = -5; i <= 1; i++) {
      const d = new Date();
      d.setDate(baseDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="flex flex-col gap-6" id="dashboard-tab-view">
      
      {/* Dynamic Header with premium original DietView brand styling */}
      <div className="flex items-center justify-between" id="dashboard-header-container">
        <div className="flex items-center gap-2" id="dashboard-brand-title">
          <div className="text-zinc-900 dark:text-white transition-transform active:scale-95">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-500 fill-emerald-500/10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 17 4.4s-1.1 2.4-1.7 4C17.5 13.5 15 19 11 20z" />
              <path d="M9 11.5s1.5 .5 2 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            DietView
          </h2>
        </div>

        {/* Streak active capsule styled container */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/15 px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="text-base">🔥</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{user.streakDays || 0}</span>
          </div>
          
          <button 
            onClick={() => setView("profile")}
            className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            id="dashboard-reminders-btn"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekdate horizontal capsule strip selector */}
      <div className="bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-3 flex justify-between items-center overflow-x-auto gap-2" id="weekday-date-strip">
        {weekDays.map((dateObj, idx) => {
          const formattedStr = getLocalDateString(dateObj);
          const isSelected = selectedDate === formattedStr;
          const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = String(dateObj.getDate()).padStart(2, '0');
          
          // Past days have dashed dotted line circle boundary
          const isTodayDate = formattedStr === todayStr;
          const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(formattedStr)}
              className="flex-1 min-w-[48px] flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group transition-all"
            >
              <span className={`text-[11px] font-bold ${
                isSelected 
                  ? 'text-zinc-950 dark:text-white font-black scale-105' 
                  : 'text-zinc-650 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'
              }`}>
                {dayLabel}
              </span>
              <div 
                className={`w-10 h-10 flex items-center justify-center text-sm font-black rounded-full transition-all ${
                  isSelected 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-2 border-zinc-900 dark:border-zinc-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' 
                    : isPast 
                      ? 'border border-dashed border-zinc-500 dark:border-zinc-500 text-zinc-700 dark:text-zinc-300 bg-transparent' 
                      : isTodayDate 
                        ? 'border-2 border-zinc-500 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 bg-transparent'
                        : 'border border-zinc-300 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 bg-transparent'
                }`}
              >
                {dayNum}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Simulated Push Notification Alert System */}
      {showInAppNotif && (
        <motion.div 
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-5 py-3.5 rounded-[22px] border border-emerald-500/30 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.15)] z-20"
          id="in-app-meal-reminder-toast-alert"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm">🔔</span>
            <span className="text-xs font-bold leading-tight">{showInAppNotif}</span>
          </div>
          <button 
            onClick={() => {
              onAddWater(250, todayStr);
              setShowInAppNotif(null);
            }}
            className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full transition-all cursor-pointer"
          >
            Quick Log
          </button>
        </motion.div>
      )}

      {/* Prompts user to toggle Notifications Permissions per requirement */}
      {showNotifBanner && (
        <div 
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
          id="real-time-notification-ask-banner"
        >
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500 text-white p-2.5 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-base">🔔</span>
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Activate daily reminders?</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Log meals faster! Get quick morning breakfast deficits, water target, and active step reminders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <button 
              onClick={handleDismissNotifications}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 px-3.5 py-2 hover:underline cursor-pointer"
            >
              Later
            </button>
            <button 
              onClick={handleRequestNotifications}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-4.5 py-2.5 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Turn On
            </button>
          </div>
        </div>
      )}

      {/* Fully Live Tracking Telemetry Bento Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800/90 rounded-[32px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)]" id="live-telemetry-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Live Diagnostics Active</span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Sync Interval: Real-time</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          
          {/* Live Steps taken */}
          <div className="bg-zinc-100/60 dark:bg-zinc-950/25 border border-zinc-200/50 dark:border-zinc-850 p-3.5 rounded-2.5xl flex flex-col justify-between min-h-[95px] relative overflow-hidden group">
            <div>
              <span className="text-[10px] font-extrabold text-zinc-650 dark:text-zinc-400 uppercase block tracking-wider">Live Steps</span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 block mt-1 font-mono tracking-tight">{liveSteps.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <Footprints className="w-4 h-4 text-zinc-550 dark:text-zinc-400 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Live Active Burn */}
          <div className="bg-zinc-100/60 dark:bg-zinc-950/25 border border-zinc-200/50 dark:border-zinc-850 p-3.5 rounded-2.5xl flex flex-col justify-between min-h-[95px] relative overflow-hidden group">
            <div>
              <span className="text-[10px] font-extrabold text-zinc-650 dark:text-zinc-400 uppercase block tracking-wider">Active Burn</span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 block mt-1 font-mono tracking-tight">-{liveActiveKcal} <span className="text-[10px]">kcal</span></span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              <Flame className="w-4 h-4 text-zinc-550 dark:text-zinc-400 animate-pulse" />
            </div>
          </div>

          {/* Live Heart Rate Telemetry */}
          <div className="bg-zinc-100/60 dark:bg-zinc-950/25 border border-zinc-200/50 dark:border-zinc-850 p-3.5 rounded-2.5xl flex flex-col justify-between min-h-[95px] relative overflow-hidden group">
            <div>
              <span className="text-[10px] font-extrabold text-zinc-650 dark:text-zinc-400 uppercase block tracking-wider">Heart HR</span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 block mt-1 font-mono tracking-tight">
                {liveBpm} <span className="text-[10px]">bpm</span>
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              <Heart className={`w-4 h-4 text-red-500/80 transition-transform duration-100 ${livePulse ? 'scale-125' : 'scale-100'}`} fill="currentColor" />
            </div>
          </div>

        </div>

        {/* Geo-location live movement tracking feedback diagnostics bar */}
        <div className="mt-3 bg-zinc-50/50 dark:bg-zinc-950/15 rounded-xl px-3 py-2.5 border border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span>Live GPS Step Feed:</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-mono text-[9px]">{gpsStatus}</span>
          </div>
          {gpsLatitude !== null && gpsLongitude !== null && (
            <div className="text-left font-mono text-[9px] text-zinc-550 dark:text-zinc-400">
              Lat: {gpsLatitude.toFixed(6)}° • Lng: {gpsLongitude.toFixed(6)}°
            </div>
          )}
        </div>
      </div>

      {/* Main Calories Budget Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[32px] p-7 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)]" id="hero-calorie-budget-card">
        <div className="flex flex-col">
          <span className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white" id="dashboard-calories-stat">
            {calorieRemaining}
          </span>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">
            Calories <span className="font-bold text-zinc-900 dark:text-zinc-250">left</span>
          </span>
        </div>

        {/* Floating Double concentric ring & Fire icon center */}
        <div className="relative w-28 h-28 flex items-center justify-center" id="concentric-ring-holder">
          {/* Subtle static path background rings */}
          <div className="absolute inset-0 rounded-full border-[10px] border-zinc-50 dark:border-zinc-900/30"></div>
          <div className="absolute inset-1 rounded-full border-[1.5px] border-zinc-100/50 dark:border-zinc-850/50"></div>
          
          <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            {/* Outer budget calorie progress ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="44" 
              stroke="currentColor" 
              className="text-zinc-[40] dark:text-zinc-800/10"
              strokeWidth="5" 
              fill="transparent" 
            />
            <motion.circle 
              cx="50" 
              cy="50" 
              r="44" 
              stroke="currentColor" 
              className="text-zinc-950 dark:text-white"
              strokeWidth="5.5" 
              fill="transparent" 
              strokeDasharray="276"
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (276 * calPercent) / 100 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Solid bold Flame circle inside */}
          <div className="absolute w-12 h-12 rounded-full bg-zinc-950 dark:bg-zinc-50 flex items-center justify-center shadow-md">
            <Flame className="w-5.5 h-5.5 text-white dark:text-zinc-950 fill-white dark:fill-zinc-950" />
          </div>
        </div>
      </div>

      {/* Protein / Carbs / Fats Left Visual Breakdown Grid */}
      <div className="flex flex-col gap-3" id="macros-breakdown-panel">
        <div className="grid grid-cols-3 gap-3.5">
          
          {/* Protein left */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[28px] p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] min-h-[155px]">
            <div>
              <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{proteinLeft}g</span>
              <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Protein left</span>
            </div>
            <div className="flex justify-center pt-2">
              <div className="w-13 h-13 rounded-full bg-[#fdf2f2] dark:bg-red-500/10 flex items-center justify-center border border-red-500/10">
                {/* Custom Inline SVG for Protein Drumstick */}
                <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-red-500 dark:text-red-400 fill-red-500/10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2A10 10 0 0 0 2 12a1 1 0 0 0 1 1h2a2 2 0 0 1 2 2v2a2 2 0 0 1 2 2v2a1 1 0 0 0 1 1h2a10 10 0 0 0 10-10V2z" />
                  <path d="M12 12c-1.5 1.5-3 2.5-4.5 3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Carbs left */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[28px] p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] min-h-[155px]">
            <div>
              <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{carbsLeft}g</span>
              <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Carbs left</span>
            </div>
            <div className="flex justify-center pt-2">
              <div className="w-13 h-13 rounded-full bg-[#fefaf0] dark:bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                {/* Custom Inline SVG for Wheat stalk */}
                <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 fill-amber-500/5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20l4-4M10 14l-4-4M14 10l-4-4" />
                  <path d="M9 18a5 5 0 0 1 7-7M13 13a5 5 0 0 1 7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fats left */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[28px] p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] min-h-[155px]">
            <div>
              <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{fatsLeft}g</span>
              <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Fats left</span>
            </div>
            <div className="flex justify-center pt-2">
              <div className="w-13 h-13 rounded-full bg-[#f3f8fc] dark:bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                {/* Custom Inline SVG for Oil drop */}
                <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-blue-500 dark:text-blue-400 fill-blue-500/10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* 3 dots page layout slider navigation indicators */}
        <div className="flex justify-center gap-1.5 py-1" id="macro-pagination-carousel-dots">
          <span className="w-1.5 h-1.5 bg-zinc-900 dark:bg-white rounded-full transition-all"></span>
          <span className="w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full transition-all"></span>
          <span className="w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full transition-all"></span>
        </div>
      </div>



      {/* Interactive Water Hydro Tracker & AI suggestions combo container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-hydration-meal-row">
        
        {/* Hydration Tracker Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[32px] p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.01)]" id="dashboard-water-section">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Water Tracker</span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-1.5 flex items-center gap-2">
                  <Droplet className="text-blue-500 fill-blue-500/10 w-5 h-5" /> 
                  {todaysWater} ml <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">({(user.waterTarget).toFixed(1)}L target)</span>
                </h3>
              </div>
              <span className={`px-3 py-1 text-[10px] rounded-full font-extrabold tracking-tight ${
                todaysWater >= (user.waterTarget * 1000) 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}>
                {todaysWater >= (user.waterTarget * 1000) ? 'Completed!' : 'Active Logs'}
              </span>
            </div>

            {/* Premium quick log hydration water triggers */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[
                { amount: 250, label: "+250ml", desc: "Cup" },
                { amount: 500, label: "+500ml", desc: "Glass" },
                { amount: 750, label: "+750ml", desc: "Flask" },
                { amount: 1000, label: "+1.0L", desc: "Bottle" }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => onAddWater(item.amount, selectedDate)}
                  className="bg-zinc-50 hover:bg-blue-500/5 dark:bg-zinc-950 border border-zinc-50 dark:border-zinc-850 hover:border-blue-500/10 rounded-2xl p-2.5 flex flex-col items-center justify-center transition-all active:scale-95 text-center group cursor-pointer"
                >
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">{item.label}</span>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center mt-5" id="custom-water-logger-form">
            <input 
              type="number" 
              placeholder="Custom ml input..." 
              value={customWater}
              onChange={(e) => setCustomWater(e.target.value)}
              className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-850 focus:outline-none focus:border-blue-500 font-medium"
            />
            <button 
              onClick={() => {
                if (customWater) {
                  onAddWater(parseInt(customWater), selectedDate);
                  setCustomWater("");
                }
              }}
              className="bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-zinc-950 text-xs font-black py-3 px-4.5 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Track
            </button>
          </div>
        </div>

        {/* AI Diet Custom Advice Widget */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[32px] p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.015)] relative overflow-hidden" id="dashboard-ai-advice-section">
          <div className="absolute top-0 right-0 w-28 h-28 bg-zinc-950/2.5 dark:bg-white/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" /> AI Advisor
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Looking for healthy recipes?</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Get personalized recipe suggestions matching your daily target of {user.calorieTarget} kcal and {user.dietaryPreference || 'Any'} preference.
            </p>
          </div>

          <button 
            onClick={() => setView("ai")}
            className="w-full mt-5 bg-zinc-950 dark:bg-white hover:opacity-90 text-white dark:text-zinc-950 font-black text-xs py-3.5 px-5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            Generate Recipes <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unified Fast Meal Log Center shortcuts */}
      <div className="grid grid-cols-1 gap-6" id="dashboard-logs-row">
        
        {/* Selected date's active logged list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[32px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between" id="dashboard-todays-logged-section">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{selectedDate === todayStr ? "Today's Logs" : `${selectedDate} Logs`}</span>
              <button 
                onClick={() => setView("tracker")} 
                className="text-zinc-950 dark:text-white text-xs font-black hover:underline flex items-center gap-1"
              >
                Track Camera <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysFood.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center" id="empty-logs-indicator">
                <UtensilsCrossed className="w-10 h-10 text-zinc-300 dark:text-zinc-700 stroke-[1.5] mb-2.5" />
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No food catalog logged for this date</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-[210px] mx-auto leading-relaxed">
                  Use the floating action menu or the vision camera to add records
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1" id="today-records-scroller">
                {todaysFood.map(log => (
                  <div 
                    key={log.id}
                    className="bg-zinc-50/50 dark:bg-zinc-950/25 rounded-2xl p-3.5 flex justify-between items-center border border-zinc-100 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-750 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.mealType === 'Breakfast' ? 'bg-amber-400' : 
                          log.mealType === 'Lunch' ? 'bg-emerald-400' : 
                          log.mealType === 'Dinner' ? 'bg-indigo-400' : 'bg-pink-400'
                        }`}></span>
                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{log.mealType}</span>
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mt-1">{log.foodName}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">
                        P: {log.protein}g • C: {log.carbs}g • F: {log.fats}g
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-zinc-950 dark:text-white">{log.calories} kcal</span>
                      <button 
                        onClick={() => onRemoveFoodLog(log.id)}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors active:scale-90"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
