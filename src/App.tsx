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
  BarChart3,
  ChevronDown,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { UserProfile, FoodLog, WaterLog, SharedPost, MealDetail, UpiPaymentModel, WeightLog } from "./types";
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
  serverTimestamp,
  onSnapshot
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
import AdminDashboard from "./components/AdminDashboard";
import Onboarding from "./components/Onboarding";
import AuthScreen from "./components/AuthScreen";
import AdSenseUnit from "./components/AdSenseUnit";
import PricingModal from "./components/PricingModal";
import DietAIChatbot from "./components/DietAIChatbot";

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
  country: "India",
  waterActive: true,
  waterRemindersEnabled: true,
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

  const [view, setView] = useState<"dashboard" | "tracker" | "insights" | "ai" | "social" | "profile" | "admin">("dashboard");
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("dietview_onboarded") === "true";
  });

  // 10-Day launch event simulation state (Defaults to false to enforce standard freemium rules)
  const [launchEventActive, setLaunchEventActive] = useState<boolean>(() => {
    const cached = localStorage.getItem("dietview_launch_event");
    return cached === "true";
  });

  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);

  const handleToggleLaunchEvent = () => {
    const newVal = !launchEventActive;
    setLaunchEventActive(newVal);
    localStorage.setItem("dietview_launch_event", String(newVal));
    triggerToast(newVal ? "🚀 10-Day Free Event Activated!" : "⚙️ Launch Event ended. Freemium limits active.");
  };
  
  // Real-time synchronization states
  const [currentUser, setCurrentUser] = useState<UserProfile>(SYSTEM_DEFAULT_USER);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [posts, setPosts] = useState<SharedPost[]>([]);

  // Firebase authentication tracking
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [loadingCloud, setLoadingCloud] = useState<boolean>(false);
  
  // Dynamic alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual UPI status sync alert state
  const [activePaymentAlert, setActivePaymentAlert] = useState<{
    id: string;
    status: "approved" | "rejected";
    planName: string;
    price: number;
    transactionId: string;
    adminNote?: string;
  } | null>(null);

  // Toggle state for the drop-down SEO / App Guide Info panel
  const [showSeoGuide, setShowSeoGuide] = useState<boolean>(false);

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
      // Clean start from zero
      const baselineLogs: FoodLog[] = [];
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
      // Clean start from zero
      const baselineWater: WaterLog[] = [];
      setWaterLogs(baselineWater);
      localStorage.setItem("dietview_water_logs", JSON.stringify(baselineWater));
    }

    const localWeight = localStorage.getItem("dietview_weight_logs");
    if (localWeight) {
      try {
        setWeightLogs(JSON.parse(localWeight));
      } catch (e) {
        console.error(e);
      }
    } else {
      // 5-day baseline tracking values so the chart is styled beautifully from day one!
      const initialDate = new Date();
      const baselineWeight: WeightLog[] = [];
      const weights = [70.2, 69.8, 69.4, 68.8, 68.4, 68.0];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(initialDate.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        baselineWeight.push({
          id: "bw-" + Date.now() + i,
          userId: SYSTEM_DEFAULT_USER.userId,
          date: dateStr,
          weight: weights[5 - i] || 68.0,
          createdAt: new Date().toISOString()
        });
      }
      setWeightLogs(baselineWeight);
      localStorage.setItem("dietview_weight_logs", JSON.stringify(baselineWeight));
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
        setAuthChecked(true); // Let the application unlock and render immediately using cached credentials
        if (user) {
          // Linked Authenticated accounts
          const userDocRef = doc(db, "users", user.uid);
          let docSnap;
          try {
            docSnap = await getDoc(userDocRef);
            if (docSnap && docSnap.exists()) {
              const remoteUser = docSnap.data() as UserProfile;
              setCurrentUser(remoteUser);
              localStorage.setItem("dietview_user", JSON.stringify(remoteUser));
              setOnboarded(true);
              localStorage.setItem("dietview_onboarded", "true");
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
          } catch (e) {
            console.error("Firestore automatic loading or creation failed:", e);
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
          } catch (e: any) {
            if (e && e.code === "permission-denied") {
              handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/foodLogs`);
            } else {
              console.error("Firestore food log loading error:", e);
            }
          }

          try {
            const waterSnap = await getDocs(collection(db, "users", user.uid, "waterLogs"));
            const fetchedWater: WaterLog[] = [];
            waterSnap.forEach(d => fetchedWater.push({ id: d.id, ...d.data() } as WaterLog));
            if (fetchedWater.length > 0) {
              setWaterLogs(fetchedWater);
              localStorage.setItem("dietview_water_logs", JSON.stringify(fetchedWater));
            }
          } catch (e: any) {
            if (e && e.code === "permission-denied") {
              handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/waterLogs`);
            } else {
              console.error("Firestore water log loading error:", e);
            }
          }

          try {
            const weightSnap = await getDocs(collection(db, "users", user.uid, "weightLogs"));
            const fetchedWeight: WeightLog[] = [];
            weightSnap.forEach(d => fetchedWeight.push({ id: d.id, ...d.data() } as WeightLog));
            if (fetchedWeight.length > 0) {
              // Sort weight chronologically
              fetchedWeight.sort((a, b) => a.date.localeCompare(b.date));
              setWeightLogs(fetchedWeight);
              localStorage.setItem("dietview_weight_logs", JSON.stringify(fetchedWeight));
            }
          } catch (e: any) {
            if (e && e.code === "permission-denied") {
              handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/weightLogs`);
            } else {
              console.error("Firestore weight log loading error:", e);
            }
          }

          try {
            const q = query(collection(db, "posts"), where("privacy", "==", "public"));
            const postsSnap = await getDocs(q);
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
          } catch (e: any) {
            if (e && e.code === "permission-denied") {
              handleFirestoreError(e, OperationType.LIST, "posts");
            } else {
              console.error("Firestore posts loading error:", e);
            }
          }
        } else {
          setFirebaseUser(null);
        }
        setAuthChecked(true);
      });
      return () => unsubscribeAuth();
    } else {
      setAuthChecked(true);
    }
  }, []);

  // Real-time listener for manual UPI payment approvals/rejections
  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseUser || !firebaseUser.uid) return;

    const q = query(
      collection(db, "upiPayments"),
      where("userId", "==", firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let notifiedList: string[] = [];
      try {
        const stored = localStorage.getItem("dietview_notified_payments");
        if (stored) notifiedList = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse notified payments list:", e);
      }

      let updatedNotified = false;

      snapshot.docs.forEach((docSnap) => {
        const payment = { id: docSnap.id, ...docSnap.data() } as UpiPaymentModel;
        
        if (payment.status !== "pending" && !notifiedList.includes(payment.id)) {
          // Open the high-fidelity billing modal dialog alert in-app
          setActivePaymentAlert({
            id: payment.id,
            status: payment.status,
            planName: payment.planName,
            price: payment.price,
            transactionId: payment.transactionId,
            adminNote: payment.adminNote
          });

          if (payment.status === "approved") {
            // Hot-reload user state to unlock premium instantly in active session
            setCurrentUser(prev => ({
              ...prev,
              isPremium: true
            }));
          }

          notifiedList.push(payment.id);
          updatedNotified = true;
        }
      });

      if (updatedNotified) {
        localStorage.setItem("dietview_notified_payments", JSON.stringify(notifiedList));
      }
    }, (error) => {
      console.error("Firestore UPI snapshot listener error:", error);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

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

  const handleAddWeightLog = async (weightValue: number, logDate?: string) => {
    const targetDate = logDate || selectedDate;
    const newEntry: WeightLog = {
      id: "weight-" + Date.now(),
      userId: currentUser.userId,
      date: targetDate,
      weight: Number(weightValue),
      createdAt: new Date().toISOString()
    };

    // Replace if double logged on same day, or push
    const existingIndex = weightLogs.findIndex(log => log.date === targetDate);
    let nextLogs: WeightLog[];
    if (existingIndex > -1) {
      nextLogs = [...weightLogs];
      nextLogs[existingIndex] = newEntry;
    } else {
      nextLogs = [newEntry, ...weightLogs];
    }
    
    // Sort chronologically by date
    nextLogs.sort((a, b) => a.date.localeCompare(b.date));

    setWeightLogs(nextLogs);
    localStorage.setItem("dietview_weight_logs", JSON.stringify(nextLogs));

    // Also update current active profile weight
    const updatedUser = { ...currentUser, weight: Number(weightValue) };
    setCurrentUser(updatedUser);
    localStorage.setItem("dietview_user", JSON.stringify(updatedUser));

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid, "weightLogs", newEntry.id), newEntry);
        await setDoc(doc(db, "users", auth.currentUser.uid), { weight: Number(weightValue) }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${auth.currentUser.uid}/weightLogs/${newEntry.id}`);
      }
    }
    triggerToast(`Logged Body Weight: ${weightValue} kg`);
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

  // 1. Gated loading state while checking Firebase connection
  if (isFirebaseConfigured && !authChecked) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-500 flex flex-col justify-center items-center font-sans" id="applet-auth-loading-overlay">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black font-sans text-xl shadow-md animate-pulse">
            DV
          </div>
          <h2 className="text-[11px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
            Securing Health Vault Cloud...
          </h2>
          <div className="h-1 w-24 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate: force Sign In / Sign Up first
  if (isFirebaseConfigured && !firebaseUser) {
    return (
      <AuthScreen 
        onAuthSuccess={(userObj) => {
          setFirebaseUser(userObj);
        }}
        darkMode={darkMode}
        triggerToast={triggerToast}
      />
    );
  }

  // 3. Onboarding Questionnaire survey
  if (!onboarded) {
    return (
      <Onboarding 
        onStart={async () => {
          setOnboarded(true);
          localStorage.setItem("dietview_onboarded", "true");
          // If a registered user completes onboarding, persist a profile document placeholder
          if (isFirebaseConfigured && auth.currentUser) {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            try {
              const snap = await getDoc(userDocRef);
              if (!snap.exists()) {
                const initialProfile: UserProfile = {
                  ...currentUser,
                  userId: auth.currentUser.uid,
                  name: auth.currentUser.displayName || currentUser.name,
                  email: auth.currentUser.email || currentUser.email,
                  isPremium: currentUser.isPremium || false,
                  trialActive: currentUser.trialActive || false,
                  streakDays: 7,
                  createdAt: new Date().toISOString()
                };
                await setDoc(userDocRef, initialProfile);
                setCurrentUser(initialProfile);
                localStorage.setItem("dietview_user", JSON.stringify(initialProfile));
              }
            } catch (e) {
              console.error("Failed to write first profile snapshot:", e);
            }
          }
        }} 
        darkMode={darkMode} 
      />
    );
  }

  const isTrialActive = currentUser.trialActive === true && 
    currentUser.trialStartDate && 
    (Date.now() - new Date(currentUser.trialStartDate).getTime() < 3 * 24 * 60 * 60 * 1000);

  const isPremiumOrTrialUser = currentUser.isPremium === true || isTrialActive;

  const handleActivatePremiumHeader = () => {
    triggerToast("👑 Premium active options enabled! Select a membership option to unlock lifetime AI tools.");
    setIsPricingOpen(true);
  };

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
          {/* Active Premium Status/Action button next to App Guide option */}
          {!currentUser.isPremium ? (
            <button
              onClick={handleActivatePremiumHeader}
              className="p-2 border border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center active:scale-95 gap-1.5 px-3.5 rounded-full animate-pulse shadow-sm"
              id="header-premium-trigger"
              title="Activate Premium Lifetime Plan"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-550 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Activate Premium</span>
            </button>
          ) : (
            <button 
              onClick={() => triggerToast("👑 Lifetime Premium active! Enjoy zero ads & unlimited AI predictions.")}
              className="p-2 border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 px-3.5 rounded-full cursor-pointer transition-all active:scale-95" 
              id="header-premium-badge"
              title="Lifetime Premium Mode Enabled. Click for details!"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-550 animate-pulse" />
              <span>Premium Active</span>
            </button>
          )}

          {/* SEO Info Toggle Button with smooth active highlight */}
          <button
            onClick={() => setShowSeoGuide(!showSeoGuide)}
            className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center active:scale-90 gap-1.5 px-3.5 ${
              showSeoGuide
                ? "bg-emerald-500/10 border-emerald-555 text-emerald-600 dark:text-emerald-400 font-extrabold scale-102"
                : "border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
            title="Toggle Food Tracker On-Page SEO Guide"
            id="seo-guide-dropdown-trigger"
          >
            <BookOpen className="w-[15px] h-[15px] text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">App Guide</span>
          </button>

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

      {/* Dropdown SEO On-Page Guide with full keyword integration */}
      <AnimatePresence>
        {showSeoGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 shadow-md"
            id="seo-header-dropdown-panel"
          >
            <div className="max-w-5xl mx-auto px-6 py-6 text-left max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300">
                    <BookOpen className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">Authoritative Information</h2>
                    <h3 className="text-sm font-black text-zinc-950 dark:text-white tracking-tight">On-Page Guide & Food Tracker App Info</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowSeoGuide(false)}
                  className="text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 py-1.5 px-3 rounded-full cursor-pointer transition-all active:scale-95"
                >
                  Close Guide
                </button>
              </div>

              <div className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed space-y-4">
                <p>
                  Are you ready to take full control of your nutrition, health, and fitness goals? Welcome to our advanced <strong className="font-bold text-zinc-950 dark:text-zinc-50">food tracker app</strong>—a comprehensive, high-performance platform designed to make daily calorie counting simple, precise, and completely accessible. Whether you are seeking an interactive <strong className="font-bold text-zinc-950 dark:text-zinc-50">food tracker</strong>, an intelligent <strong className="font-bold text-emerald-500">food ai app</strong>, or a revolutionary <strong className="font-bold text-zinc-950 dark:text-zinc-50">food scanner app</strong> to analyze and log your dishes instantly, our modern utility is engineered to support your unique health journey. Studies show that using modern <strong className="font-bold text-zinc-950 dark:text-zinc-50">food tracking apps</strong> regularly can double the speed of weight management results compared to traditional non-tracking approaches.
                </p>

                <h4 className="text-xs font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
                  Why this is the Best Free Calorie Tracking App India & Globally
                </h4>
                <p>
                  For users seeking nutritional precision, logging diverse dishes can be a major challenge without local database context. That is why our proprietary system incorporates a specialized <strong className="font-bold text-zinc-950 dark:text-zinc-50">food calorie calculator Indian</strong> feature, allowing you to easily log traditional culinary favorites with highly accurate macronutrient splits. Calibrated with precise regional data, it is the <strong className="font-bold text-zinc-950 dark:text-zinc-50">best free calorie tracking app india</strong> has to offer. Instead of purchasing steep recurrent premium plans or undergoing a manual <strong className="font-bold text-zinc-950 dark:text-zinc-50">myfitnesspal app free download</strong>, users can run our platform directly on their web browsers as the <strong className="font-bold text-zinc-950 dark:text-zinc-50">best food tracking app free</strong> of charge. Designed to be a fully compatible <strong className="font-bold text-zinc-950 dark:text-zinc-50">free food tracker app for android</strong>, iOS, and computer screens, our technology provides continuous synchronization without subscriptions or ads.
                </p>

                <h4 className="text-xs font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
                  Dynamic Metatronic Engine: Your Scientific Calories Calculator Hub
                </h4>
                <p>
                  Managing your calorie intake requires reliable, evidence-backed arithmetic. That is why our program incorporates a complete, state-of-the-art <strong className="font-bold text-zinc-950 dark:text-zinc-50">calories calculator</strong> ecosystem designed to help you analyze your energy balance instantly:
                </p>
                
                <ul className="space-y-2 border border-zinc-100 dark:border-zinc-900 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/40 list-disc list-inside text-xs">
                  <li>
                    <strong className="text-zinc-950 dark:text-zinc-100 font-extrabold">Maintenance Calories Calculator:</strong> Find your exact active metabolic rate to understand how much energy is needed daily to maintain your current weight perfectly with our <strong className="font-bold text-zinc-950 dark:text-zinc-50">maintenance calories calculator</strong>.
                  </li>
                  <li>
                    <strong className="text-zinc-950 dark:text-zinc-100 font-extrabold">Calories Calculator to Lose Weight:</strong> Create a personalized body fat burning goal with a safe, sustainable caloric budget reduction custom-tuned to preserve your muscle tissue with our <strong className="font-bold text-zinc-950 dark:text-zinc-50">calories calculator to lose weight</strong>.
                  </li>
                  <li>
                    <strong className="text-zinc-950 dark:text-zinc-100 font-extrabold">Steps to Calories Calculator & Walking Calories Calculator:</strong> Daily movement makes up a massive fraction of your metabolic output. This <strong className="font-bold text-zinc-950 dark:text-zinc-50">steps to calories calculator</strong> lets you compute the energy burned during active steps, functioning as a reliable <strong className="font-bold text-zinc-950 dark:text-zinc-50">walking calories calculator</strong>.
                  </li>
                  <li>
                    <strong className="text-zinc-950 dark:text-zinc-100 font-extrabold">Food Calories Calculator & Food Tracker Online options:</strong> Break down the nutritional ratios of any meal using our integrated physical <strong className="font-bold text-zinc-950 dark:text-zinc-50">food calories calculator</strong>. You can easily access this <strong className="font-bold text-zinc-950 dark:text-zinc-50">food tracker online</strong> from any device.
                  </li>
                  <li>
                    <strong className="text-zinc-950 dark:text-zinc-100 font-extrabold">Restaurant Menu Calibration:</strong> Easily research specific restaurant options with targeted lookups such as a <strong className="font-bold text-zinc-950 dark:text-zinc-50">starbucks calories calculator</strong> or a <strong className="font-bold text-zinc-950 dark:text-zinc-50">chipotle bowl calories calculator</strong> to ensure your custom quick entries match your true intake metrics.
                  </li>
                </ul>

                <h4 className="text-xs font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
                  Advanced Companion and Online Food Tracker Access
                </h4>
                <p>
                  Our system functions as a robust <strong className="font-bold text-zinc-950 dark:text-zinc-50">free calorie counter app for android</strong> and iOS devices that lives fully in your pocket, and is also accessible on the web as a fully responsive, secure <strong className="font-bold text-zinc-950 dark:text-zinc-50">free calorie tracker online</strong>. Skip the setup delays and log macro parameters on any day using this lightweight <strong className="font-bold text-zinc-950 dark:text-zinc-50">food tracker app free</strong> utility. Realize your body's potential using our cloud backing, friendly community feed, and custom AI coach outputs to support a healthier, happier lifestyle!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        {/* Dynamic Safe Google AdSense Unit only for free users who are not in active trial */}
        {!isPremiumOrTrialUser && (
          <AdSenseUnit />
        )}

        <AnimatePresence mode="wait">
          <motion.div 
            key={view}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
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
                onUpdateUser={saveUserUpdate}
                onRequestPricing={() => setIsPricingOpen(true)}
              />
            )}

            {view === "tracker" && (
              <Tracker 
                user={currentUser} 
                onAddFoodLog={handleAddFieldFood} 
                launchEventMode={launchEventActive}
                onUpdateUser={saveUserUpdate}
              />
            )}

            {view === "insights" && (
              <Insights 
                user={currentUser} 
                foodLogs={foodLogs} 
                waterLogs={waterLogs} 
                weightLogs={weightLogs}
                onAddWeightLog={handleAddWeightLog}
              />
            )}

            {view === "ai" && (
              <AIAdvisor 
                user={currentUser} 
                onLogBatchMeals={handleLogBatchMeals} 
                onAddFoodLog={handleAddFieldFood}
                onUpdateUser={saveUserUpdate}
                launchEventMode={launchEventActive}
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
                isFirebaseConfigured={isFirebaseConfigured}
                firebaseUser={firebaseUser}
                onGoogleLogin={handleGoogleLogin}
                setView={(v) => setView(v as any)}
              />
            )}

            {view === "admin" && (
              <AdminDashboard 
                onBack={() => setView("profile")}
                triggerToast={triggerToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile/Desktop Synced bottom floating premium navigation layout following designer specs */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3.5 max-w-md w-[95%] sm:w-[410px] px-1" id="custom-floating-navigation">
        {/* White rounded pill capsule containing Home, Progress, Groups, Profile */}
        <nav className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800 rounded-full py-1.5 px-2 flex items-center justify-between gap-1 shadow-[0_10px_35px_rgba(0,0,0,0.08)] flex-1 relative z-10" id="global-navigation-floating-pill">
          
          {/* Home Button Option */}
          <button 
            onClick={() => setView("dashboard")}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "dashboard" 
                ? 'text-zinc-950 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-dashboard"
          >
            {view === "dashboard" && (
              <motion.div 
                layoutId="floating-nav-indicator" 
                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Home className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>

          {/* Progress Tab for data insights */}
          <button 
            onClick={() => setView("insights")}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "insights" 
                ? 'text-zinc-900 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-progress"
          >
            {view === "insights" && (
              <motion.div 
                layoutId="floating-nav-indicator" 
                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <BarChart3 className="w-[18px] h-[18px] shrink-0" strokeWidth={2.4} />
            <span className="text-[10px] font-bold tracking-tight">Progress</span>
          </button>

          {/* AI Coach Tab for personalized intelligent insights and logger */}
          <button 
            onClick={() => setView("ai")}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "ai" 
                ? 'text-zinc-950 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-ai"
          >
            {view === "ai" && (
              <motion.div 
                layoutId="floating-nav-indicator" 
                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Sparkles className="w-[18px] h-[18px] shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold tracking-tight">AI Coach</span>
          </button>

          {/* Profile Tab featuring our iconic cyan-avatar sphere badge */}
          <button 
            onClick={() => setView("profile")}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
              view === "profile" 
                ? 'text-zinc-900 dark:text-white font-extrabold scale-102' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            id="nav-to-profile"
          >
            {view === "profile" && (
              <motion.div 
                layoutId="floating-nav-indicator" 
                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
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

      {/* Real-time Manual UPI Payment Audit Status In-App Alert Portal */}
      <AnimatePresence>
        {activePaymentAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left" id="upi-payment-status-alert-overlay">
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md cursor-pointer"
              onClick={() => setActivePaymentAlert(null)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 md:p-7 z-10 flex flex-col gap-5 text-center shadow-2xl"
            >
              {activePaymentAlert.status === "approved" ? (
                <>
                  {/* Premium Approved Hero Design */}
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border-2 border-dashed border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce" style={{ animationDuration: '3s' }}>
                    <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  </div>

                  <div className="flex flex-col gap-1.5 text-center">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 rounded-full uppercase tracking-widest self-center text-center">
                      Payment Verified
                    </span>
                    <h2 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight mt-1.5 text-center">
                      Premium Activated!
                    </h2>
                    <p className="text-xs text-zinc-550 dark:text-zinc-400 font-medium leading-relaxed px-1 text-center">
                      Great news! Your manual UPI billing receipt has been successfully verified and approved by our system audit group. Your premium benefits are now active.
                    </p>
                  </div>

                  {/* Transaction Details Block */}
                  <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-4 text-left flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">Plan Subscription</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">{activePaymentAlert.planName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-800/40 pt-2">
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">Receipt Price Paid</span>
                      <span className="text-emerald-650 dark:text-emerald-500 font-black">₹{activePaymentAlert.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-800/40 pt-2">
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">UTR Reference ID</span>
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 px-1.5 py-0.5 rounded text-[10.5px]">
                        {activePaymentAlert.transactionId}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActivePaymentAlert(null);
                      setView("dashboard");
                    }}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-97 cursor-pointer shadow-sm hover:shadow-md border-none"
                  >
                    Unlock Super Charged AI Co-Pilot
                  </button>
                </>
              ) : (
                <>
                  {/* Rejected Warning Hero Design */}
                  <div className="w-16 h-16 rounded-full bg-red-500/10 dark:bg-red-500/15 border-2 border-dashed border-red-500/20 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 animate-pulse" />
                  </div>

                  <div className="flex flex-col gap-1.5 text-center">
                    <span className="text-[10px] font-black text-red-650 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-3 py-1 rounded-full uppercase tracking-widest self-center text-center">
                      Invoice Rejected
                    </span>
                    <h2 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight mt-1.5 text-center">
                      Verification Failed
                    </h2>
                    <p className="text-xs text-zinc-550 dark:text-zinc-400 font-medium leading-relaxed px-1 text-center">
                      Our system audit department was unable to verify your manual payment receipt transaction.
                    </p>
                  </div>

                  {/* Rejection Note Details Block */}
                  <div className="bg-red-500/5 dark:bg-red-950/10 rounded-2xl border border-red-500/15 p-4 text-left flex flex-col gap-2.5">
                    <div>
                      <span className="text-red-550 dark:text-red-400 font-extrabold uppercase tracking-wider text-[9px] block">Audit rejection note:</span>
                      <p className="text-xs font-semibold text-red-900 dark:text-red-350 mt-1 leading-normal italic">
                        "{activePaymentAlert.adminNote || 'Transaction UTR reference number not found in bank settlements account.'}"
                      </p>
                    </div>
                    <div className="border-t border-red-500/10 pt-2 flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">Declined Reference UTR</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 px-1.5 py-0.5 rounded text-[10.5px]">
                        {activePaymentAlert.transactionId}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActivePaymentAlert(null)}
                      className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-97 cursor-pointer border-none"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        setActivePaymentAlert(null);
                        setView("profile");
                      }}
                      className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-97 cursor-pointer border-none"
                    >
                      Resubmit Details
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
        user={currentUser} 
        onUpdateUser={saveUserUpdate} 
      />

      {/* Global Mini-Floating Diet AI Chatbot (Apple Logo Design) */}
      {currentUser && (
        <DietAIChatbot 
          user={currentUser} 
          onOpenPricing={() => setIsPricingOpen(true)} 
        />
      )}
    </div>
  );
}
