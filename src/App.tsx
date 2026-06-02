import React, { useState, useEffect } from "react";
import { 
  Home, 
  Camera, 
  Activity, 
  Sparkles, 
  Users, 
  User, 
  LogOut, 
  Flame, 
  Droplet,
  Globe,
  Plus,
  BookOpen,
  Info,
  Sun,
  Moon,
  BarChart3
} from "lucide-react";
import { UserProfile, FoodLog, WaterLog, SharedPost, MealDetail } from "./types";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from "./firebase";

// Import modular screens
import Dashboard from "./components/Dashboard";
import Tracker from "./components/Tracker";
import Insights from "./components/Insights";
import AIAdvisor from "./components/AIAdvisor";
import SocialFeed from "./components/SocialFeed";
import Profile from "./components/Profile";
import Onboarding from "./components/Onboarding";

import { motion, AnimatePresence } from "motion/react";

const SYSTEM_DEFAULT_USER: UserProfile = {
  userId: "donna_metrics_21",
  name: "Donna",
  email: "donna@dietview.app",
  age: 28,
  weight: 68,
  height: 165,
  calorieTarget: 2100,
  proteinTarget: 120,
  carbTarget: 200,
  fatTarget: 65,
  dietaryPreference: "Vegetarian",
  waterTarget: 2.5,
  waterActive: true,
  mealReminders: "Breakfast, Lunch, Dinner",
  streakDays: 7
};

export default function App() {
  // Helper to get local date format safe from UTC shift bugs
  const getLocalDateString = (date: Date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  };

  const [view, setView] = useState<"dashboard" | "tracker" | "insights" | "ai" | "social" | "profile">("dashboard");
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("dietview_onboarded") === "true";
  });
  
  // Real-time synchronization states
  const [currentUser, setCurrentUser] = useState<UserProfile>(SYSTEM_DEFAULT_USER);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [posts, setPosts] = useState<SharedPost[]>([]);

  // Firebase authentication tracking
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loadingCloud, setLoadingCloud] = useState<boolean>(false);
  
  // Dynamic alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark mode state matching standard client preferences
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem("dietview_dark");
    if (cached) return cached === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Toggle .dark class dynamically on the root document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dietview_dark", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dietview_dark", "false");
    }
  }, [darkMode]);

  // Dynamic initialization
  useEffect(() => {
    // 1. Double check local storage defaults
    const localUser = localStorage.getItem("dietview_user");
    if (localUser) {
      try {
        setCurrentUser(JSON.parse(localUser));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("dietview_user", JSON.stringify(SYSTEM_DEFAULT_USER));
    }

    const localFood = localStorage.getItem("dietview_food_logs");
    if (localFood) {
      try {
        setFoodLogs(JSON.parse(localFood));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Add standard baseline item so dashboard looks rich
      const baselineLogs: FoodLog[] = [{
        id: "baseline-1",
        userId: SYSTEM_DEFAULT_USER.userId,
        foodName: "Greek Yogurt Bowl with Granola & Chia Seeds",
        calories: 380,
        protein: 26,
        carbs: 45,
        fats: 8,
        mealType: "Breakfast",
        date: getLocalDateString(),
        createdAt: new Date().toISOString()
      }];
      setFoodLogs(baselineLogs);
      localStorage.setItem("dietview_food_logs", JSON.stringify(baselineLogs));
    }

    const localWater = localStorage.getItem("dietview_water_logs");
    if (localWater) {
      try {
        setWaterLogs(JSON.parse(localWater));
      } catch (e) {
        console.error(e);
      }
    } else {
      const baselineWater: WaterLog[] = [{
        id: "baseline-w-1",
        userId: SYSTEM_DEFAULT_USER.userId,
        date: getLocalDateString(),
        amount: 500,
        createdAt: new Date().toISOString()
      }];
      setWaterLogs(baselineWater);
      localStorage.setItem("dietview_water_logs", JSON.stringify(baselineWater));
    }

    const localPosts = localStorage.getItem("dietview_posts");
    if (localPosts) {
      try {
        setPosts(JSON.parse(localPosts));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Query Firebase Firestore if credential links exist
    if (isFirebaseConfigured) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          // Linked Authenticated accounts
          const userDocRef = doc(db, "users", user.uid);
          let docSnap;
          try {
            docSnap = await getDoc(userDocRef);
          } catch (e) {
            handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
          }
          if (docSnap && docSnap.exists()) {
            const remoteUser = docSnap.data() as UserProfile;
            setCurrentUser(remoteUser);
            localStorage.setItem("dietview_user", JSON.stringify(remoteUser));
          } else {
            // Create user profile in firestore
            const newProfile: UserProfile = {
              userId: user.uid,
              name: user.displayName || "Healthy Sprout",
              email: user.email || "sprout@dietview.app",
              age: 28,
              weight: 68,
              height: 165,
              calorieTarget: 2100,
              proteinTarget: 120,
              carbTarget: 200,
              fatTarget: 65,
              dietaryPreference: "Vegetarian",
              waterTarget: 2.5,
              waterActive: true,
              mealReminders: "Breakfast, Lunch, Dinner",
              streakDays: 7,
              profilePic: user.photoURL || undefined
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (e) {
              handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
            }
            setCurrentUser(newProfile);
            localStorage.setItem("dietview_user", JSON.stringify(newProfile));
          }
          
          // Pull associated food, water, and community lists
          try {
            const foodSnap = await getDocs(collection(db, "users", user.uid, "foodLogs"));
            const fetchedFood: FoodLog[] = [];
            foodSnap.forEach(d => fetchedFood.push({ id: d.id, ...d.data() } as FoodLog));
            if (fetchedFood.length > 0) {
              setFoodLogs(fetchedFood);
              localStorage.setItem("dietview_food_logs", JSON.stringify(fetchedFood));
            }
          } catch (e) {
            console.error("Firestore food log loading error:", e);
            handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/foodLogs`);
          }

          try {
            const waterSnap = await getDocs(collection(db, "users", user.uid, "waterLogs"));
            const fetchedWater: WaterLog[] = [];
            waterSnap.forEach(d => fetchedWater.push({ id: d.id, ...d.data() } as WaterLog));
            if (fetchedWater.length > 0) {
              setWaterLogs(fetchedWater);
              localStorage.setItem("dietview_water_logs", JSON.stringify(fetchedWater));
            }
          } catch (e) {
            console.error("Firestore water log loading error:", e);
            handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/waterLogs`);
          }

          try {
            const postsSnap = await getDocs(collection(db, "posts"));
            const fetchedPosts: SharedPost[] = [];
            postsSnap.forEach(d => {
              const data = d.data();
              const timestampString = (data.timestamp && typeof data.timestamp.toDate === "function")
                ? data.timestamp.toDate().toISOString()
                : (data.timestamp || new Date().toISOString());
              fetchedPosts.push({ ...data, id: d.id, timestamp: timestampString } as SharedPost);
            });
            if (fetchedPosts.length > 0) {
              setPosts(fetchedPosts);
              localStorage.setItem("dietview_posts", JSON.stringify(fetchedPosts));
            }
          } catch (e) {
            console.error("Firestore posts loading error:", e);
            handleFirestoreError(e, OperationType.LIST, `posts`);
          }
        } else {
          setFirebaseUser(null);
        }
      });
      return () => unsubscribeAuth();
    }
  }, []);

  // Google auth triggering helper
  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) return;
    setLoadingCloud(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      triggerToast("Signed in with Google successfully!");
    } catch (e: any) {
      console.error(e);
      triggerToast("Authentication failed: " + e.message);
    } finally {
      setLoadingCloud(false);
    }
  };

  // Update State & Persistent mechanisms
  const saveUserUpdate = async (newUserProfile: UserProfile) => {
    setCurrentUser(newUserProfile);
    localStorage.setItem("dietview_user", JSON.stringify(newUserProfile));

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid), newUserProfile, { merge: true });
        triggerToast("Profile metrics backed up in Firestore cloud!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    } else {
      triggerToast("Metrics cached locally");
    }
  };

  const handleAddFieldFood = async (
    foodName: string, 
    cal: number, 
    protein: number, 
    carbs: number, 
    fats: number, 
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack",
    logDate?: string
  ) => {
    const newEntry: FoodLog = {
      id: "food-" + Date.now() + Math.random().toString(36).substr(2, 4),
      userId: currentUser.userId,
      foodName,
      calories: Number(cal || 0),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fats: Number(fats || 0),
      mealType,
      date: logDate || selectedDate,
      createdAt: new Date().toISOString()
    };

    const nextLogs = [newEntry, ...foodLogs];
    setFoodLogs(nextLogs);
    localStorage.setItem("dietview_food_logs", JSON.stringify(nextLogs));

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid, "foodLogs", newEntry.id), newEntry);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${auth.currentUser.uid}/foodLogs/${newEntry.id}`);
      }
    }
    triggerToast(`Added ${foodName} to ${mealType}`);
  };

  const handleAddWater = async (amountMl: number, logDate?: string) => {
    const newEntry: WaterLog = {
      id: "water-" + Date.now(),
      userId: currentUser.userId,
      date: logDate || selectedDate,
      amount: Number(amountMl || 0),
      createdAt: new Date().toISOString()
    };

    const nextLogs = [newEntry, ...waterLogs];
    setWaterLogs(nextLogs);
    localStorage.setItem("dietview_water_logs", JSON.stringify(nextLogs));

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid, "waterLogs", newEntry.id), newEntry);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${auth.currentUser.uid}/waterLogs/${newEntry.id}`);
      }
    }
    triggerToast(`Registered +${amountMl}ml Hydration`);
  };

  const handleRemoveFoodLog = async (id: string) => {
    const nextLogs = foodLogs.filter(log => log.id !== id);
    setFoodLogs(nextLogs);
    localStorage.setItem("dietview_food_logs", JSON.stringify(nextLogs));

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "foodLogs", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${auth.currentUser.uid}/foodLogs/${id}`);
      }
    }
    triggerToast("Entry deleted");
  };

  // Log suggested AI Recipe deck completely
  const handleLogBatchMeals = (meals: MealDetail[]) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const generatedLogs = meals.map((meal, index) => ({
      id: "ai-log-" + Date.now() + index,
      userId: currentUser.userId,
      foodName: meal.title,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      mealType: (meal.mealType || "Breakfast") as any,
      date: todayStr,
      createdAt: new Date().toISOString()
    }));

    const nextLogs = [...generatedLogs, ...foodLogs];
    setFoodLogs(nextLogs);
    localStorage.setItem("dietview_food_logs", JSON.stringify(nextLogs));
    triggerToast("Logged whole recommended diet selection!");
  };

  // Add social comments community post
  const handleAddPost = async (
    text: string, 
    privacy: "public" | "friends" | "private", 
    mealDetails?: string, 
    cal?: number, 
    protein?: number, 
    carbs?: number
  ) => {
    const newPost: SharedPost = {
      id: "post-" + Date.now(),
      userId: currentUser.userId,
      userName: currentUser.name,
      userPhoto: currentUser.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      text,
      mealDetails,
      calories: cal || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      privacy,
      timestamp: new Date().toISOString(),
      likes: []
    };

    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    localStorage.setItem("dietview_posts", JSON.stringify(nextPosts));

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await setDoc(doc(db, "posts", newPost.id), {
          ...newPost,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `posts/${newPost.id}`);
      }
    }
    triggerToast("Published Sprout Bulletin!");
  };

  // Multi-user interactive like
  const handleLikePost = async (postId: string) => {
    let targetPost: SharedPost | undefined;
    const nextPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUser.userId);
        const nextLikes = isLiked 
          ? post.likes.filter(id => id !== currentUser.userId)
          : [...post.likes, currentUser.userId];
        targetPost = { ...post, likes: nextLikes };
        return targetPost;
      }
      return post;
    });
    setPosts(nextPosts);
    localStorage.setItem("dietview_posts", JSON.stringify(nextPosts));

    if (isFirebaseConfigured && auth.currentUser && targetPost) {
      try {
        await updateDoc(doc(db, "posts", postId), {
          likes: targetPost.likes
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
      }
    }
  };

  // Visual helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLogout = () => {
    if (isFirebaseConfigured) {
      signOut(auth).then(() => {
        setFirebaseUser(null);
        triggerToast("Signed out of clouds");
      });
    }
    // Roll back to preloaded default Donna
    setCurrentUser(SYSTEM_DEFAULT_USER);
    localStorage.clear();
    setOnboarded(false);
    triggerToast("Cleared simulated offline profile logs");
  };

  if (!onboarded) {
    return (
      <Onboarding 
        onStart={() => {
          setOnboarded(true);
          localStorage.setItem("dietview_onboarded", "true");
        }} 
        darkMode={darkMode} 
      />
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-background font-sans antialiased flex flex-col justify-between" id="applet-primary-canvas">
      
      {/* Top Professional Header Bar - Cal.com/Cal.ai Inspired */}
      <header className="bg-white dark:bg-black border-b border-outline-variant/10 sticky top-0 z-50 py-3 px-6 flex items-center justify-between" id="unified-navigation-header">
        <div className="flex items-center gap-2.5 cursor-pointer selection:bg-transparent" onClick={() => setView("dashboard")} id="logo-brand-header">
          <div className="w-9 h-9 fill-none transition-transform active:scale-95 select-none shrink-0" id="brand-logo-graphics">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Rounded square dark backdrop with perfect radius matching the design exactly */}
              <rect x="2" y="2" width="96" height="96" rx="26" fill="#2d2b33" />
              
              {/* Soft rounded scanning bracket lines in corners */}
              {/* Top-Left */}
              <path d="M 28 39 L 28 32 A 4 4 0 0 1 32 28 L 39 28" stroke="#a1a1a6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              {/* Top-Right */}
              <path d="M 72 39 L 72 32 A 4 4 0 0 0 68 28 L 61 28" stroke="#a1a1a6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              {/* Bottom-Left */}
              <path d="M 28 61 L 28 68 A 4 4 0 0 0 32 72 L 39 72" stroke="#a1a1a6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              {/* Bottom-Right */}
              <path d="M 72 61 L 72 68 A 4 4 0 0 1 68 72 L 61 72" stroke="#a1a1a6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              
              {/* Elegant white outlined avocado shape */}
              <path 
                d="M 50 32 C 43.5 32 44.5 44.5 39 54.5 C 33.5 64.5 39.5 73.5 50 73.5 C 60.5 73.5 66.5 64.5 61 54.5 C 55.5 44.5 56.5 32 50 32 Z" 
                stroke="#ffffff" 
                strokeWidth="4.5" 
                strokeLinejoin="round" 
                fill="none" 
              />
              
              {/* Centered shiny seed in lower-middle segment with custom crescent cutout reflection */}
              <circle cx="50" cy="58.5" r="7.5" fill="#ffffff" />
              <path d="M 48 54.5 A 5 5 0 0 0 48 62.5 A 3.8 3.8 0 0 1 48 54.5 Z" fill="#2d2b33" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">DietView</h1>
          </div>
        </div>

        {/* Action Controls & Dark Mode System Switcher */}
        <div className="flex items-center gap-2" id="header-right-console">
          {/* Theme system toggle switcher with user-friendly organic styling */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full border border-primary/20 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 text-primary transition-all cursor-pointer flex items-center justify-center active:scale-90"
            title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            id="theme-light-dark-toggle-btn"
          >
            {darkMode ? (
              <Sun className="w-4.5 h-4.5" />
            ) : (
              <Moon className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      </header>

      {/* Dynamic Action Alerts Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 text-white text-xs font-semibold px-4.5 py-2.5 rounded-full shadow-md flex items-center gap-2 pointer-events-none"
            id="toast-notifications-banner"
          >
            <Info className="w-4 h-4 text-primary-container fill-primary-container" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Multi-Screen Tab Content Pane */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8" id="scrolling-main-viewport">
        <AnimatePresence mode="wait">
          <motion.div 
            key={view}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {view === "dashboard" && (
              <Dashboard 
                user={currentUser} 
                foodLogs={foodLogs} 
                waterLogs={waterLogs} 
                onAddWater={handleAddWater}
                onRemoveFoodLog={handleRemoveFoodLog}
                onAddQuickMeal={handleAddFieldFood}
                setView={setView}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                getLocalDateString={getLocalDateString}
              />
            )}

            {view === "tracker" && (
              <Tracker 
                user={currentUser} 
                onAddFoodLog={handleAddFieldFood} 
              />
            )}

            {view === "insights" && (
              <Insights 
                user={currentUser} 
                foodLogs={foodLogs} 
                waterLogs={waterLogs} 
              />
            )}

            {view === "ai" && (
              <AIAdvisor 
                user={currentUser} 
                onLogBatchMeals={handleLogBatchMeals} 
              />
            )}

            {view === "social" && (
              <SocialFeed 
                user={currentUser} 
                posts={posts} 
                onAddPost={handleAddPost} 
                onLikePost={handleLikePost} 
              />
            )}

            {view === "profile" && (
              <Profile 
                user={currentUser} 
                onUpdateUser={saveUserUpdate} 
                onLogout={handleLogout} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile/Desktop Synced bottom floating premium navigation layout following designer specs */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3.5 max-w-md w-[95%] sm:w-[410px] px-1" id="custom-floating-navigation">
        {/* White rounded pill capsule containing Home, Progress, Groups, Profile */}
        <nav className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800 rounded-full py-1.5 px-2 flex items-center justify-between gap-1 shadow-[0_10px_35px_rgba(0,0,0,0.08)] flex-1" id="global-navigation-floating-pill">
          
          {/* Home Button Option */}
          <button 
            onClick={() => setView("dashboard")}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "dashboard" 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-dashboard"
          >
            <Home className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>

          {/* Progress Tab for data insights */}
          <button 
            onClick={() => setView("insights")}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "insights" 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-progress"
          >
            <BarChart3 className="w-[18px] h-[18px] shrink-0" strokeWidth={2.4} />
            <span className="text-[10px] font-bold tracking-tight">Progress</span>
          </button>

          {/* AI Coach Tab for personalized intelligent insights and logger */}
          <button 
            onClick={() => setView("ai")}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "ai" 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-ai"
          >
            <Sparkles className="w-[18px] h-[18px] shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold tracking-tight">AI Coach</span>
          </button>

          {/* Profile Tab featuring our iconic cyan-avatar sphere badge */}
          <button 
            onClick={() => setView("profile")}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "profile" 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-profile"
          >
            <div className="w-[18px] h-[18px] rounded-full bg-cyan-400 shadow-sm transition-transform hover:scale-110 shrink-0 mx-auto" />
            <span className="text-[10px] font-bold tracking-tight">Profile</span>
          </button>

        </nav>

        {/* Separate Standalone Dark Floating Action Button */}
        <div className="relative shrink-0">
          <button 
            onClick={() => setView("tracker")}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-[0_6px_28px_rgba(2,184,117,0.25)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 border-none"
            title="Log food vision scanner"
            id="quick-floating-action-add-btn"
          >
            <Plus className="w-7 h-7 stroke-[2.7] text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
