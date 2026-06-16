import React, { useState, useEffect, useRef } from "react";
import { 
  Flame, 
  Droplet, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  UtensilsCrossed, 
  Trash2,
  Bell,
  Heart,
  Footprints,
  ChevronDown,
  BookOpen,
  RefreshCw,
  Check,
  Map,
  MapPin,
  Play,
  Square,
  RotateCcw,
  Navigation,
  Compass,
  Pause,
  Activity
} from "lucide-react";
import { UserProfile, FoodLog, WaterLog } from "../types";
import { motion, AnimatePresence } from "motion/react";

// Regional cuisines local diet catalogs representing custom traditional diets
export const LOCAL_DIET_CATALOGS: Record<string, {
  name: string;
  flag: string;
  meals: { name: string; cal: number; protein: number; carbs: number; fats: number; category: "Breakfast" | "Lunch" | "Dinner" | "Snack" }[]
}> = {
  "India": {
    name: "India",
    flag: "🇮🇳",
    meals: [
      { name: "Masala Oats & Curd", cal: 255, protein: 10, carbs: 38, fats: 6, category: "Breakfast" },
      { name: "Moong Dal Cheela with Paneer", cal: 320, protein: 16, carbs: 28, fats: 12, category: "Breakfast" },
      { name: "Paneer Bhurji with Roti", cal: 450, protein: 22, carbs: 35, fats: 18, category: "Lunch" },
      { name: "Yellow Dal Tadka & Jeera Rice", cal: 390, protein: 14, carbs: 62, fats: 8, category: "Lunch" },
      { name: "Soya Chunks Curry & Chapati", cal: 420, protein: 28, carbs: 45, fats: 10, category: "Dinner" },
      { name: "Chana Masala with Brown Rice", cal: 480, protein: 16, carbs: 70, fats: 12, category: "Dinner" },
      { name: "Roasted Makhana (Lotus Seeds)", cal: 120, protein: 3, carbs: 22, fats: 2, category: "Snack" },
      { name: "Spiced Masala Buttermilk", cal: 80, protein: 4, carbs: 8, fats: 2, category: "Snack" }
    ]
  },
  "Japan": {
    name: "Japan",
    flag: "🇯🇵",
    meals: [
      { name: "Miso Soup & Natto over Rice", cal: 290, protein: 12, carbs: 48, fats: 5, category: "Breakfast" },
      { name: "Tamagoyaki (Rolled Omelet)", cal: 180, protein: 11, carbs: 4, fats: 13, category: "Breakfast" },
      { name: "Sashimi Salmon Bento Box", cal: 490, protein: 34, carbs: 45, fats: 15, category: "Lunch" },
      { name: "Zaru Soba Noodles with Dashi", cal: 320, protein: 12, carbs: 62, fats: 2, category: "Lunch" },
      { name: "Teppanyaki Cod & Shiitake", cal: 380, protein: 32, carbs: 18, fats: 12, category: "Dinner" },
      { name: "Tofu & Edamame Miso Claypot", cal: 290, protein: 18, carbs: 24, fats: 11, category: "Dinner" },
      { name: "Spiced Edamame Pods", cal: 110, protein: 9, carbs: 10, fats: 3, category: "Snack" },
      { name: "Hot Matcha & Mochi Piece", cal: 150, protein: 2, carbs: 32, fats: 1, category: "Snack" }
    ]
  },
  "Mexico": {
    name: "Mexico",
    flag: "🇲🇽",
    meals: [
      { name: "Huevos Rancheros with Salsa", cal: 330, protein: 16, carbs: 24, fats: 18, category: "Breakfast" },
      { name: "Nopalitos & Scrambled Eggs", cal: 220, protein: 14, carbs: 8, fats: 14, category: "Breakfast" },
      { name: "Grilled Chicken Street Tacos", cal: 410, protein: 28, carbs: 38, fats: 12, category: "Lunch" },
      { name: "Mexican Black Bean & Corn Bowl", cal: 380, protein: 15, carbs: 55, fats: 9, category: "Lunch" },
      { name: "Baked Sea Bass with Lime & Cilantro", cal: 390, protein: 36, carbs: 12, fats: 16, category: "Dinner" },
      { name: "Beef Fajitas with Bell Peppers", cal: 520, protein: 38, carbs: 26, fats: 24, category: "Dinner" },
      { name: "Fresh Guacamole & Baked Strips", cal: 190, protein: 3, carbs: 18, fats: 12, category: "Snack" },
      { name: "Sliced Papaya with Chili-Lime Salt", cal: 90, protein: 1, carbs: 21, fats: 0, category: "Snack" }
    ]
  },
  "Italy": {
    name: "Italy",
    flag: "🇮🇹",
    meals: [
      { name: "Ricotta Fruit Bruschetta", cal: 240, protein: 9, carbs: 28, fats: 10, category: "Breakfast" },
      { name: "Italian Herb Egg Frittata", cal: 210, protein: 14, carbs: 6, fats: 15, category: "Breakfast" },
      { name: "Tuscan Grilled Chicken Salad", cal: 480, protein: 35, carbs: 15, fats: 25, category: "Lunch" },
      { name: "Whole Wheat Pasta with Marinara & Basil", cal: 410, protein: 12, carbs: 70, fats: 6, category: "Lunch" },
      { name: "Baked Mediterannean Sea Bream", cal: 440, protein: 38, carbs: 8, fats: 20, category: "Dinner" },
      { name: "Classic Minestrone Veggie Soup", cal: 260, protein: 10, carbs: 38, fats: 6, category: "Dinner" },
      { name: "Caprese Salad Skewers", cal: 140, protein: 7, carbs: 3, fats: 11, category: "Snack" },
      { name: "Sliced Figs with Prosciutto", cal: 130, protein: 6, carbs: 16, fats: 4, category: "Snack" }
    ]
  },
  "USA": {
    name: "USA",
    flag: "🇺🇸",
    meals: [
      { name: "Cinnamon Oatmeal with Protein Powder", cal: 340, protein: 26, carbs: 42, fats: 5, category: "Breakfast" },
      { name: "Avocado Toast & Egg Whites", cal: 290, protein: 18, carbs: 26, fats: 12, category: "Breakfast" },
      { name: "Shredded Chicken Breast Bowl", cal: 540, protein: 42, carbs: 65, fats: 8, category: "Lunch" },
      { name: "Turkey Burger on Whole Wheat Bun", cal: 420, protein: 32, carbs: 34, fats: 14, category: "Lunch" },
      { name: "BBQ Salmon & Sweet Potato Crusted", cal: 590, protein: 38, carbs: 48, fats: 20, category: "Dinner" },
      { name: "Sirloin Steak & Cauliflower Mashed", cal: 510, protein: 44, carbs: 16, fats: 26, category: "Dinner" },
      { name: "Cottage Cheese with Sliced Peach", cal: 130, protein: 12, carbs: 14, fats: 2, category: "Snack" },
      { name: "Premium Whey Shake with Water", cal: 120, protein: 24, carbs: 3, fats: 1, category: "Snack" }
    ]
  },
  "France": {
    name: "France",
    flag: "🇫🇷",
    meals: [
      { name: "French Omelette with Fine Herbs", cal: 210, protein: 13, carbs: 2, fats: 16, category: "Breakfast" },
      { name: "Greek Yogurt with Fig & Walnuts", cal: 230, protein: 11, carbs: 18, fats: 10, category: "Breakfast" },
      { name: "Classic Salad Niçoise with Tuna", cal: 420, protein: 28, carbs: 18, fats: 22, category: "Lunch" },
      { name: "Coq au Vin (Braised Chicken in Wine)", cal: 480, protein: 36, carbs: 22, fats: 18, category: "Lunch" },
      { name: "Herbed Baked Cod with Ratatouille", cal: 360, protein: 32, carbs: 20, fats: 11, category: "Dinner" },
      { name: "Savory Buckwheat Galette", cal: 310, protein: 12, carbs: 42, fats: 9, category: "Dinner" },
      { name: "Sliced Pear with Brie Cheese", cal: 160, protein: 5, carbs: 15, fats: 9, category: "Snack" },
      { name: "Organic Grape Cluster & Walnuts", cal: 120, protein: 2, carbs: 18, fats: 5, category: "Snack" }
    ]
  },
  "Middle East": {
    name: "Middle East",
    flag: "🇱🇧",
    meals: [
      { name: "Shakshuka (Eggs Poached in Salsa)", cal: 280, protein: 14, carbs: 16, fats: 18, category: "Breakfast" },
      { name: "Labneh with Zaatar & Pita", cal: 240, protein: 10, carbs: 32, fats: 8, category: "Breakfast" },
      { name: "Grilled Chicken Shawarma Bowl", cal: 520, protein: 42, carbs: 38, fats: 16, category: "Lunch" },
      { name: "Classic Mujadara (Lentils & Rice)", cal: 410, protein: 14, carbs: 72, fats: 7, category: "Lunch" },
      { name: "Grilled Beef Kabob with Hummus", cal: 580, protein: 36, carbs: 28, fats: 28, category: "Dinner" },
      { name: "Hearty Lentil Soup with Lemon", cal: 240, protein: 12, carbs: 40, fats: 3, category: "Dinner" },
      { name: "Hummus Dip with Cucumber Sticks", cal: 140, protein: 4, carbs: 12, fats: 8, category: "Snack" },
      { name: "Raw Medjool Date Stuffed with Tahini", cal: 110, protein: 1, carbs: 22, fats: 3, category: "Snack" }
    ]
  }
};

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
  onUpdateUser?: (updated: UserProfile) => void;
  onRequestPricing?: () => void;
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
  getLocalDateString,
  onUpdateUser,
  onRequestPricing
}: DashboardProps) {
  const [quickMealType, setQuickMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [customWater, setCustomWater] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  
  // Premium Monthly/Weekly Streak Calendar State
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  
  // 4-Hour local hydration gap state triggers
  const [simulatedTimeOffsetHours, setSimulatedTimeOffsetHours] = useState<number>(0);
  const [dismissedWaterAlert, setDismissedWaterAlert] = useState<boolean>(false);
  const [waterScale, setWaterScale] = useState<number>(1);

  // Scale bounce whenever total water increases
  const todaysWater = waterLogs.filter(log => log.date === selectedDate).reduce((acc, curr) => acc + curr.amount, 0);

  useEffect(() => {
    if (todaysWater > 0) {
      setWaterScale(1.05);
      const timer = setTimeout(() => setWaterScale(1), 250);
      return () => clearTimeout(timer);
    }
  }, [todaysWater]);

  // Get most recent water log timestamp across all logs
  const latestWaterLogTime = waterLogs && waterLogs.length > 0
    ? Math.max(...waterLogs.map(log => new Date(log.createdAt).getTime()))
    : 0;

  // Compute actual vs simulated virtual time
  const virtualNowTime = Date.now() + (simulatedTimeOffsetHours * 60 * 60 * 1000);
  const hoursSinceLastWater = latestWaterLogTime > 0
    ? (virtualNowTime - latestWaterLogTime) / (1000 * 60 * 60)
    : 4.1; // Default to 4.1 hours if no logs are present for instant preview action!

  const shouldTriggerWaterReminder = 
    hoursSinceLastWater >= 4 && 
    user.waterRemindersEnabled !== false &&
    !dismissedWaterAlert;

  // Wrap the onAddWater function to reset simulation parameters upon actual log triggers
  const trackWaterPlusReset = (amount: number, dateStr?: string) => {
    onAddWater(amount, dateStr || selectedDate);
    setSimulatedTimeOffsetHours(0);
    setDismissedWaterAlert(false);
  };
  
  // Track dynamically selected active day
  const todayStr = getLocalDateString();

  // Helper to format duration clock
  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, "0") : null,
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

  // Helper to trigger interactive walk simulation
  const handleSimulateMovement = () => {
    // Current or default mock baseline
    const baseLat = gpsLatitude || 12.9716; 
    const baseLng = gpsLongitude || 77.5946;
    
    // Random angle and distance step (roughly 12-25 meters)
    const randomAngle = Math.random() * 2 * Math.PI;
    const distanceDegree = 0.00015 + Math.random() * 0.0001;
    const newLat = baseLat + Math.sin(randomAngle) * distanceDegree;
    const newLng = baseLng + Math.cos(randomAngle) * distanceDegree;
    
    setGpsLatitude(newLat);
    setGpsLongitude(newLng);
    setGpsAccuracy(6);
    
    // Use setState functional form to access fresh isTrackingRoute
    setIsTrackingRoute(isTracking => {
      if (isTracking) {
        setGpsStatus("Recording Route (Simulated 🚶)");
        setGpsPath(prev => {
          const now = Date.now();
          return [...prev, { latitude: newLat, longitude: newLng, timestamp: now }];
        });
        
        setLiveActiveKcal(prev => {
          const addedBurn = Number((18 * 0.05).toFixed(1));
          const next = Number((prev + addedBurn).toFixed(1));
          localStorage.setItem("dietview_live_kcal", String(next));
          return next;
        });
      } else {
        setGpsStatus("Connected (Simulated 🚶)");
        prevCoordsRef.current = { latitude: newLat, longitude: newLng };
      }
      return isTracking;
    });
  };

  const handleStartTracking = () => {
    setIsTrackingRoute(true);
    setGpsStatus("Tracking Active...");
    if (gpsLatitude !== null && gpsLongitude !== null) {
      setGpsPath(prev => {
        if (prev.length === 0) {
          return [{ latitude: gpsLatitude, longitude: gpsLongitude, timestamp: Date.now() }];
        }
        return prev;
      });
    }
  };

  const handlePauseTracking = () => {
    setIsTrackingRoute(false);
    setGpsStatus("Tracking Paused");
  };

  const handleResetTracking = () => {
    setIsTrackingRoute(false);
    setGpsPath([]);
    setLiveActiveKcal(0);
    setSessionSeconds(0);
    prevCoordsRef.current = null;
    setGpsStatus("Ready to track");
    localStorage.removeItem("dietview_live_kcal");
    localStorage.removeItem("dietview_gps_path");
    localStorage.removeItem("dietview_session_seconds");
    localStorage.removeItem("dietview_is_tracking");
  };

  // Render SVG route path coordinates
  const renderGpsTrailSvg = () => {
    if (gpsPath.length < 2) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-850/60 transition-colors">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 dark:bg-amber-500 opacity-20"></span>
            <div className="bg-amber-100 dark:bg-amber-950/40 p-2.5 rounded-full border border-amber-300/60 dark:border-amber-800">
              <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400 rotate-12" />
            </div>
          </div>
          <span className="text-[10.5px] font-black text-zinc-700 dark:text-zinc-300 mt-2 uppercase tracking-wider">No Active Trail Recorded</span>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 px-4 mt-1 leading-relaxed max-w-[260px] font-medium">
            Toggle "Live GPS Route" tracking and walk or tap "Simulate Walk" to draw your physical coordinates graph!
          </p>
        </div>
      );
    }

    // Get boundaries
    const lats = gpsPath.map(p => p.latitude);
    const lngs = gpsPath.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Padding
    const latRange = maxLat - minLat || 0.0001;
    const lngRange = maxLng - minLng || 0.0001;

    // Viewbox layout dimensions
    const width = 280;
    const height = 150;
    const padding = 20;

    // Projection calculation helper
    const points = gpsPath.map(p => {
      // Invert Y so latitude increases upwards
      const x = padding + ((p.longitude - minLng) / lngRange) * (width - 2 * padding);
      const y = height - padding - ((p.latitude - minLat) / latRange) * (height - 2 * padding);
      return { x, y };
    });

    // Create SVG Polyline string
    const dStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    return (
      <div className="relative w-full h-[155px] bg-zinc-50 dark:bg-zinc-950/45 rounded-2.5xl border border-zinc-150 dark:border-zinc-850/70 overflow-hidden flex items-center justify-center p-1.5 shadow-inner">
        <svg className="w-full h-full text-zinc-300 dark:text-zinc-700" viewBox={`0 0 ${width} ${height}`}>
          {/* Abstract background grid */}
          <defs>
            <pattern id="card-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" className="opacity-15 dark:opacity-25" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#card-grid)" />

          {/* The walking line trail */}
          <path
            d={dStr}
            fill="none"
            stroke="url(#trail-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {/* Trail color gradient definition */}
          <defs>
            <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Waypoint circle markers */}
          {points.map((p, i) => {
            const isStart = i === 0;
            const isEnd = i === points.length - 1;
            if (isStart) {
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" className="fill-blue-500" />
                  <circle cx={p.x} cy={p.y} r="9" className="stroke-blue-500 fill-none animate-ping opacity-30" strokeWidth="1.5" />
                </g>
              );
            }
            if (isEnd) {
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="6" className="fill-emerald-500" />
                  <circle cx={p.x} cy={p.y} r="10" className="stroke-emerald-500 fill-none animate-pulse opacity-40" strokeWidth="1.5" />
                </g>
              );
            }
            // Only show small dots for intermediate nodes
            if (gpsPath.length < 25 || i % 3 === 0) {
              return (
                <circle key={i} cx={p.x} cy={p.y} r="1.5" className="fill-amber-400 dark:fill-amber-300" />
              );
            }
            return null;
          })}
        </svg>

        {/* Start / Finish labels overlaid */}
        <div className="absolute top-2 left-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md backdrop-blur-md">
          Start Link Pin
        </div>
        <div className="absolute bottom-2 right-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md backdrop-blur-md">
          Live Tracker Node
        </div>
      </div>
    );
  };

  // Fully Live Tracking Telemetry States
  const [liveActiveKcal, setLiveActiveKcal] = useState<number>(() => {
    const cached = localStorage.getItem("dietview_live_kcal");
    return cached ? parseFloat(cached) : 0;
  });
  const [liveBpm, setLiveBpm] = useState<number>(72);
  const [livePulse, setLivePulse] = useState<boolean>(false);

  const isPremiumUser = user.isPremium === true || 
    (user.trialActive === true && user.trialStartDate && 
     (Date.now() - new Date(user.trialStartDate).getTime() < 3 * 24 * 60 * 60 * 1000));

  // Real GPS Geolocation & Session Route States
  const [isTrackingRoute, setIsTrackingRoute] = useState<boolean>(() => {
    return localStorage.getItem("dietview_is_tracking") === "true";
  });
  const [gpsPath, setGpsPath] = useState<{ latitude: number; longitude: number; timestamp: number }[]>(() => {
    const cached = localStorage.getItem("dietview_gps_path");
    return cached ? JSON.parse(cached) : [];
  });
  const [sessionSeconds, setSessionSeconds] = useState<number>(() => {
    const cached = localStorage.getItem("dietview_session_seconds");
    return cached ? parseInt(cached) : 0;
  });

  const isTrackingRouteRef = useRef(isTrackingRoute);
  useEffect(() => {
    isTrackingRouteRef.current = isTrackingRoute;
  }, [isTrackingRoute]);

  useEffect(() => {
    localStorage.setItem("dietview_is_tracking", String(isTrackingRoute));
  }, [isTrackingRoute]);

  useEffect(() => {
    localStorage.setItem("dietview_gps_path", JSON.stringify(gpsPath));
  }, [gpsPath]);

  // Real GPS Geolocation States
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>("Initializing...");
  const prevCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

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

    setGpsStatus("Ready to track");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsLatitude(latitude);
        setGpsLongitude(longitude);
        setGpsAccuracy(accuracy);

        const isTracking = isTrackingRouteRef.current;
        if (isTracking) {
          setGpsStatus(`Recording Route (±${Math.round(accuracy)}m)`);

          // Append to GPS Path
          setGpsPath(prev => {
            const now = Date.now();
            if (prev.length > 0) {
              const last = prev[prev.length - 1];
              // Avoid duplicate identical points
              if (last.latitude === latitude && last.longitude === longitude) {
                return prev;
              }
            }
            return [...prev, { latitude, longitude, timestamp: now }];
          });

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
            if (distanceMeters >= 1.5 && distanceMeters < 150) {
              setLiveActiveKcal(kcal => {
                const addedBurn = Number((distanceMeters * 0.05).toFixed(1));
                const updated = Number((kcal + addedBurn).toFixed(1));
                localStorage.setItem("dietview_live_kcal", String(updated));
                return updated;
              });
            }
          }
        } else {
          setGpsStatus(`Connected (±${Math.round(accuracy)}m)`);
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

  // Route Tracking active ticking timer
  useEffect(() => {
    if (!isTrackingRoute) return;

    const timer = setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        localStorage.setItem("dietview_session_seconds", String(next));
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTrackingRoute]);

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

  const sentWebNotificationRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (shouldTriggerWaterReminder) {
      if (notificationsAuthorized && !sentWebNotificationRef.current) {
        try {
          new Notification("Hydration Check 💧", {
            body: `No water logs detected for ${Math.floor(hoursSinceLastWater)} hours! Click to record water intake.`,
            icon: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=100"
          });
          sentWebNotificationRef.current = true;
        } catch (err) {
          console.warn("Web notification failed to spawn:", err);
        }
      }
    } else {
      sentWebNotificationRef.current = false;
    }
  }, [shouldTriggerWaterReminder, notificationsAuthorized, hoursSinceLastWater]);

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

  // Premium Streak Calendar Calculations
  const loggedDates = React.useMemo(() => {
    const dates = new Set<string>();
    if (foodLogs) {
      foodLogs.forEach(log => {
        if (log.date) dates.add(log.date);
      });
    }
    if (waterLogs) {
      waterLogs.forEach(log => {
        if (log.date) dates.add(log.date);
      });
    }
    return dates;
  }, [foodLogs, waterLogs]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarCells = React.useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const cells = [];
    
    // Prefix empty slots
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(null);
    }
    
    // Active days
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(calYear, calMonth, day));
    }
    
    return cells;
  }, [calYear, calMonth]);

  const visibleMonthStats = React.useMemo(() => {
    const monthIndexStr = String(calMonth + 1).padStart(2, '0');
    const prefixStr = `${calYear}-${monthIndexStr}`;
    const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    
    let loggedCount = 0;
    let eligibleDaysToDate = 0; 
    
    const todayObj = new Date();
    const isCurrentMonthAndYear = todayObj.getFullYear() === calYear && todayObj.getMonth() === calMonth;
    const upToDay = isCurrentMonthAndYear 
      ? todayObj.getDate() 
      : (calYear < todayObj.getFullYear() || (calYear === todayObj.getFullYear() && calMonth < todayObj.getMonth()) ? totalDaysInMonth : 0);
    
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = String(d).padStart(2, '0');
      const fullDateStr = `${prefixStr}-${dStr}`;
      
      if (loggedDates.has(fullDateStr)) {
        loggedCount++;
      }
      
      if (d <= upToDay) {
        eligibleDaysToDate++;
      }
    }
    
    const consistencyPercentage = eligibleDaysToDate > 0 
      ? Math.round((loggedCount / eligibleDaysToDate) * 100) 
      : 0;
      
    return {
      loggedCount,
      totalDaysInMonth,
      consistencyPercentage,
      isCurrentMonthAndYear
    };
  }, [calYear, calMonth, loggedDates]);

  return (
    <div className="flex flex-col gap-6" id="dashboard-tab-view">
      
      {/* Dynamic Header with premium original DietView brand styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100/30 dark:border-zinc-800/30" id="dashboard-header-container">
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

        {/* Small button to change country diet according to dynamic regional local settings */}
        <div className="relative z-35 flex items-center justify-center" id="local-country-diet-picker">
          <button 
            onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800/80 px-4 py-2 rounded-full text-xs font-black text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
            id="country-diet-dropdown-button"
            title="Switch local regional signature diet style"
          >
            <span>{LOCAL_DIET_CATALOGS[user.country || "India"]?.flag || "🇮🇳"}</span>
            <span>{LOCAL_DIET_CATALOGS[user.country || "India"]?.name || "India"} Diet</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {countryDropdownOpen && (
              <>
                <div className="fixed inset-0 bg-transparent" onClick={() => setCountryDropdownOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2.5 w-52 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.12)] p-2 flex flex-col gap-1 z-50 text-left"
                  id="country-diet-dropdown-panel"
                >
                  <div className="px-2.5 py-1.5 text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-50 dark:border-zinc-850/60 mb-1">
                    Signature Regional Diets
                  </div>
                  {Object.keys(LOCAL_DIET_CATALOGS).map((countryKey) => {
                    const cInfo = LOCAL_DIET_CATALOGS[countryKey];
                    const isSelected = user.country === countryKey;
                    return (
                      <button
                        key={countryKey}
                        onClick={() => {
                          onUpdateUser?.({
                            ...user,
                            country: countryKey
                          });
                          setCountryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left px-2.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-extrabold' 
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{cInfo.flag}</span>
                          <span>{cInfo.name}</span>
                        </span>
                        {isSelected && <span className="text-emerald-500 font-extrabold text-[9px] uppercase">Active</span>}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Streak active capsule styled container */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto" id="dashboard-header-streak-actions">
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

      {/* Premium High-Engagement Streak Calendar Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-800/80 rounded-[32px] overflow-hidden shadow-[0_4px_22px_rgba(0,0,0,0.012)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300" id="dashboard-premium-streak-calendar">
        {/* Accordion Trigger Header */}
        <div 
          onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/20 dark:hover:bg-zinc-950/25 transition-colors select-none"
          id="calendar-accordion-header"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/10 shadow-[0_2px_8px_rgba(245,158,11,0.08)]">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">Logging Streak Calendar</h4>
                <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  {user.streakDays || 0} Day Streak
                </div>
              </div>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 font-medium mt-0.5">
                {isCalendarExpanded ? "Select any past or today's date to view and retro-log meals" : "Tap to visualize your monthly consistency stats"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Minimalist mini indicator badge when collapsed */}
            {!isCalendarExpanded && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-850/50 px-3.5 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                <span>Month Consistency:</span>
                <span className="text-emerald-550 dark:text-emerald-400 font-extrabold">{visibleMonthStats.consistencyPercentage}%</span>
              </div>
            )}
            <motion.div
              animate={{ rotate: isCalendarExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* Expandable Panel body with framer-motion */}
        <AnimatePresence initial={false}>
          {isCalendarExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-t border-zinc-100/60 dark:border-zinc-850/80"
              id="calendar-collapsible-wrapper"
            >
              <div className="p-6 flex flex-col gap-5">
                {/* Month Navigator Controls */}
                <div className="flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20 p-2.5 rounded-2xl border border-zinc-100/40 dark:border-zinc-850/40">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear(prev => prev - 1);
                      } else {
                        setCalMonth(prev => prev - 1);
                      }
                    }}
                    className="p-2 text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/55"
                    id="btn-calendar-prev-month"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>

                  <div className="text-center select-none">
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-white tracking-tight">
                      {monthNames[calMonth]} {calYear}
                    </span>
                    {visibleMonthStats.isCurrentMonthAndYear && (
                      <span className="block text-[8.5px] font-black uppercase text-emerald-500 tracking-widest mt-0.5">Current Month</span>
                    )}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear(prev => prev + 1);
                      } else {
                        setCalMonth(prev => prev + 1);
                      }
                    }}
                    className="p-2 text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/55"
                    id="btn-calendar-next-month"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-col gap-2.5" id="calendar-grid-wrapper">
                  {/* Grid Week Headings */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName, index) => (
                      <div key={index} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest py-1 font-mono">
                        {dayName}
                      </div>
                    ))}
                  </div>

                  {/* Grid Cell numbers */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarCells.map((dateObj, cellIdx) => {
                      if (!dateObj) {
                        return <div key={`empty-${cellIdx}`} className="aspect-square" />;
                      }

                      const yearStr = dateObj.getFullYear();
                      const monthIndexStr = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const dayIndexStr = String(dateObj.getDate()).padStart(2, '0');
                      const cellDateStr = `${yearStr}-${monthIndexStr}-${dayIndexStr}`;

                      const isSelected = selectedDate === cellDateStr;
                      const isCellTodayObj = dateObj.toDateString() === new Date().toDateString();
                      
                      // Highlight past dates or today that contain logs
                      const isLogged = loggedDates.has(cellDateStr);
                      const isFuture = dateObj > new Date();

                      return (
                        <button
                          key={`cell-${cellIdx}`}
                          disabled={isFuture}
                          onClick={() => {
                            setSelectedDate(cellDateStr);
                          }}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 focus:outline-none cursor-pointer group select-none border ${
                            isSelected
                              ? "bg-zinc-950 dark:bg-zinc-50 border-zinc-950 dark:border-white text-white dark:text-zinc-950 shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-[1.03] z-10"
                              : isLogged
                                ? "bg-gradient-to-br from-amber-500/10 to-orange-500/15 border-orange-500/25 text-orange-650 dark:text-orange-400 shadow-[0_2px_8px_rgba(249,115,22,0.03)] font-black"
                                : isCellTodayObj
                                  ? "bg-zinc-50/50 dark:bg-zinc-850/30 border-2 border-dashed border-zinc-400 dark:border-zinc-700 text-zinc-950 dark:text-white"
                                  : isFuture
                                    ? "bg-transparent border-transparent text-zinc-200 dark:text-zinc-800 opacity-20 cursor-not-allowed pointer-events-none"
                                    : "bg-transparent border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850/30"
                          }`}
                        >
                          <span className={`text-xs ${isSelected ? 'font-black' : 'font-extrabold'}`}>
                            {dateObj.getDate()}
                          </span>

                          {/* Glowing Streak Icon Indicator */}
                          {isLogged && !isSelected && (
                            <div className="absolute bottom-1 flex items-center justify-center">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
                              </span>
                            </div>
                          )}

                          {/* Today marker */}
                          {isCellTodayObj && !isSelected && (
                            <div className="absolute top-1 w-1 h-1 rounded-full bg-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consistency Motivation Score Card Panel */}
                <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850/40 mt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="flex flex-col gap-1 flex-1 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                          {monthNames[calMonth]} Consistency Score:
                        </span>
                        <span className={`text-[9px] tracking-wide font-black px-2 py-0.5 rounded-full uppercase ${
                          visibleMonthStats.consistencyPercentage >= 80 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : visibleMonthStats.consistencyPercentage >= 50
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {visibleMonthStats.consistencyPercentage >= 80 ? 'Elite 🚀' : visibleMonthStats.consistencyPercentage >= 50 ? 'Steady 💪' : 'Beginner ✨'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
                        {visibleMonthStats.consistencyPercentage >= 80
                          ? "Incredible visual momentum! Your daily habits are burning white-hot."
                          : visibleMonthStats.consistencyPercentage >= 50
                            ? "Splendid habit rhythm! Keep hitting those targets to unlock next tier badges."
                            : "Starting strong is half the journey! Keep recording your water & meal calories to ignite your flame."}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-start">
                      <div className="text-right">
                        <span className="block text-base font-black text-zinc-900 dark:text-white tracking-widest">
                          {visibleMonthStats.loggedCount} <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase">Days</span>
                        </span>
                        <span className="block text-[8.5px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider mt-0.5">Logged This Month</span>
                      </div>
                      
                      {/* Circle visual progress meter */}
                      <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" className="text-zinc-100 dark:text-zinc-805/40" strokeWidth="3" />
                          <motion.circle 
                            cx="18" 
                            cy="18" 
                            r="15.915" 
                            fill="transparent" 
                            stroke="url(#premiumCaloriesGradient)" 
                            strokeWidth="3.5" 
                            strokeDasharray="100 100" 
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 100 - visibleMonthStats.consistencyPercentage }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round" 
                          />
                        </svg>
                        <span className="absolute text-[10px] font-black text-zinc-900 dark:text-white select-none">{visibleMonthStats.consistencyPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              trackWaterPlusReset(250, todayStr);
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



      {/* Main Calories Budget Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[32px] p-7 flex items-center justify-between shadow-[0_4px_22px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-zinc-300 dark:hover:border-zinc-800 transition-shadow" 
        id="hero-calorie-budget-card"
      >
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
          
          <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none animate-spin-slow" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="premiumCaloriesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" /> {/* Orange */}
                <stop offset="50%" stopColor="#ef4444" /> {/* Red */}
                <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
              </linearGradient>
            </defs>

            {/* Background progress track with premium shade */}
            <circle 
              cx="50" 
              cy="50" 
              r="44" 
              stroke="currentColor" 
              className="text-zinc-100 dark:text-zinc-800/25"
              strokeWidth="5.5" 
              fill="transparent" 
            />

            {/* Ambient blurry glow ring beneath */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="44" 
              stroke="url(#premiumCaloriesGradient)" 
              strokeWidth="10" 
              fill="transparent" 
              strokeDasharray="276"
              className="blur-[3px] opacity-25"
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (276 * calPercent) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />

            {/* Crisp foreground energetic gradient ring */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="44" 
              stroke="url(#premiumCaloriesGradient)" 
              strokeWidth="6" 
              fill="transparent" 
              strokeDasharray="276"
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (276 * calPercent) / 100 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Solid bold Flame circle inside with breathing animation & interactive spring hover */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 12 }}
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 4px 14px rgba(239,68,68,0.15)",
                "0 4px 22px rgba(239,68,68,0.35)",
                "0 4px 14px rgba(239,68,68,0.15)"
              ]
            }}
            transition={{ 
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              default: { type: "spring", stiffness: 300, damping: 15 }
            }}
            className="absolute w-12 h-12 rounded-full bg-zinc-950 dark:bg-zinc-50 flex items-center justify-center shadow-md cursor-pointer z-10"
          >
            <Flame className="w-5.5 h-5.5 text-white dark:text-zinc-950 fill-white dark:fill-zinc-950" />
          </motion.div>
        </div>
      </motion.div>

      {/* Protein / Carbs / Fats Left Visual Breakdown Grid */}
      <div className="flex flex-col gap-3" id="macros-breakdown-panel">
        <div className="grid grid-cols-3 gap-3.5">
          
          {/* Protein left */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[28px] p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-red-500/15 transition-all min-h-[155px]"
          >
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
          </motion.div>

          {/* Carbs left */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[28px] p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-amber-500/15 transition-all min-h-[155px]"
          >
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
          </motion.div>

          {/* Fats left */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800/80 rounded-[28px] p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-blue-500/15 transition-all min-h-[155px]"
          >
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
          </motion.div>

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
                  <Droplet className="text-blue-500 fill-blue-500/10 w-5 h-5 animate-pulse" /> 
                  {todaysWater} ml <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">({(user.waterTarget).toFixed(1)}L target)</span>
                </h3>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2.5 py-0.5 text-[9px] rounded-full font-extrabold tracking-tight ${
                  todaysWater >= (user.waterTarget * 1000) 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {todaysWater >= (user.waterTarget * 1000) ? 'Completed!' : 'Active Logs'}
                </span>
                
                {/* 4-Hour reminder simulation clock manipulator */}
                <button 
                  onClick={() => {
                    setSimulatedTimeOffsetHours(prev => prev === 0 ? 4.5 : 0);
                    setDismissedWaterAlert(false);
                  }}
                  className="text-[8.5px] bg-blue-500/10 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded-full font-extrabold transition-all active:scale-95 cursor-pointer"
                  title="FAST FORWARD +4 HOURS gaps to test local notifications"
                >
                  ⚡ {simulatedTimeOffsetHours > 0 ? "Normal Time" : "Time Shift +4h"}
                </button>
              </div>
            </div>

            {/* Interactive Visual Progress Bar with motion spring bounce */}
            <motion.div 
              className="mt-5" 
              id="water-progress-bar-container"
              animate={{ scale: waterScale }}
              transition={{ type: "spring", stiffness: 350, damping: 12 }}
            >
              <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold mb-1.5 uppercase tracking-wider">
                <span>Hydration Progress</span>
                <span className={todaysWater >= (user.waterTarget * 1000) ? "text-emerald-600 dark:text-emerald-400 font-black scale-102" : "text-blue-600 dark:text-blue-400 font-bold"}>
                  {Math.min(100, Math.round((todaysWater / ((user.waterTarget || 2) * 1000)) * 100))}%
                </span>
              </div>
              <div className="h-4 w-full bg-zinc-50 dark:bg-zinc-950 rounded-full p-0.5 border border-zinc-150 dark:border-zinc-850/60 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((todaysWater / ((user.waterTarget || 2) * 1000)) * 100))}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className={`h-full rounded-full relative overflow-hidden transition-colors duration-500 ${
                    todaysWater >= (user.waterTarget * 1000) 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                  }`}
                >
                  {/* Sliding wave shimmer overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                  />
                  {/* Floating bubble indicators */}
                  <span className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-around opacity-50 overflow-hidden pointer-events-none">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.1s', animationDuration: '2.5s' }} />
                    <span className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.7s', animationDuration: '3.5s' }} />
                    <span className="w-1.2 h-1.2 bg-white rounded-full animate-ping" style={{ animationDelay: '1.4s', animationDuration: '3s' }} />
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* In-App Water Reminder alert block */}
            <AnimatePresence>
              {shouldTriggerWaterReminder && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="bg-blue-50/70 dark:bg-blue-950/15 border border-blue-500/20 rounded-[24px] p-4.5 mt-5 flex flex-col gap-3 shadow-[0_4px_20px_rgba(59,130,246,0.06)] overflow-hidden"
                  id="4hour-hydration-alert-panel"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-blue-500 shrink-0" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider">Hydration Deficit Warning</h4>
                      <p className="text-[11px] text-blue-800/80 dark:text-blue-400/90 mt-1 leading-relaxed font-bold">
                        No water logs detected for <span className="text-blue-600 dark:text-blue-300 font-black">{Math.floor(hoursSinceLastWater)} hours</span>. Suggesting immediate hydration for optimal fitness performance!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end border-t border-blue-500/10 pt-3">
                    <button 
                      onClick={() => setDismissedWaterAlert(true)}
                      className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 font-extrabold text-[10px] py-2 px-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={() => trackWaterPlusReset(250, selectedDate)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] py-2 px-3.5 rounded-xl transition-all flex items-center gap-1 active:scale-95 shadow-sm cursor-pointer"
                    >
                      +250ml
                    </button>
                    <button 
                      onClick={() => trackWaterPlusReset(500, selectedDate)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] py-2 px-3.5 rounded-xl transition-all flex items-center gap-1 active:scale-95 shadow-sm cursor-pointer"
                    >
                      +500ml
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  onClick={() => trackWaterPlusReset(item.amount, selectedDate)}
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
                  trackWaterPlusReset(parseInt(customWater), selectedDate);
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

      {/* Country Specialty Regional Diet Center with Localized Recipes */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-800/80 rounded-[32px] p-6 shadow-[0_4px_22px_rgba(0,0,0,0.015)] flex flex-col gap-5 mt-4" id="dashboard-regional-diet-center">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-lg select-none">
              {LOCAL_DIET_CATALOGS[user.country || "India"]?.flag || "🇮🇳"}
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-1.5 uppercase tracking-wider">
                 {LOCAL_DIET_CATALOGS[user.country || "India"]?.name || "India"} Diet Center
                <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest">Local Cuisine</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Signature local recipes perfectly calibrated for active nutritional deficits.
              </p>
            </div>
          </div>

          <div className="flex gap-1 bg-zinc-100/85 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-150/40 dark:border-zinc-850/60 overflow-x-auto self-start sm:self-auto max-w-full">
            {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((mealSlot) => {
              const isActive = quickMealType === mealSlot;
              return (
                <button
                  key={mealSlot}
                  onClick={() => setQuickMealType(mealSlot)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm font-black scale-102' 
                      : 'text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {mealSlot}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="regional-diet-meals-grid">
          {LOCAL_DIET_CATALOGS[user.country || "India"]?.meals
            .filter((meal) => meal.category === quickMealType)
            .map((meal, index) => (
              <motion.div 
                whileHover={{ y: -2 }}
                key={index}
                className="bg-zinc-50/50 dark:bg-zinc-950/25 rounded-[22px] p-4 border border-zinc-150/40 dark:border-zinc-850/60 flex flex-col justify-between gap-4 transition-all"
              >
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100 leading-tight">{meal.name}</h4>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
                      {meal.cal} kcal
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold font-mono tracking-tight">
                      P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-150/40 dark:border-zinc-850/30">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wide">Staple Choice</span>
                  <button
                    onClick={() => {
                      onAddQuickMeal(meal.name, meal.cal, meal.protein, meal.carbs, meal.fats, meal.category, selectedDate);
                    }}
                    className="bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-zinc-950 font-black text-[10px] py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3 h-3" /> Log to {selectedDate === todayStr ? "Today" : selectedDate}
                  </button>
                </div>
              </motion.div>
            ))
          }
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
                <AnimatePresence initial={false}>
                  {todaysFood.map(log => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      whileHover={{ scale: 1.01 }}
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
