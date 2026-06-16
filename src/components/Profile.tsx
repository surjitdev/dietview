import React, { useState, useRef, useEffect } from "react";
import { 
  Edit3, 
  Trash2, 
  Settings, 
  Bookmark, 
  ChevronRight, 
  Lock, 
  Droplet,
  Utensils,
  LogOut,
  Sparkles,
  Check,
  Award,
  Flame,
  User,
  Camera,
  Upload,
  AlertCircle,
  Bell,
  Crown,
  X,
  CreditCard,
  ShieldAlert,
  Loader,
  Cloud,
  Database,
  LogIn
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import PricingModal from "./PricingModal";

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  setView?: (v: string) => void;
  isFirebaseConfigured?: boolean;
  firebaseUser?: any;
  onGoogleLogin?: () => void;
}

export default function Profile({ 
  user, 
  onUpdateUser, 
  onLogout, 
  setView,
  isFirebaseConfigured,
  firebaseUser,
  onGoogleLogin
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  
  // Freemium Checkout Modal state hooks
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showCheckout, setShowCheckout] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(4.99);
  const [trialTimeLeft, setTrialTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!user.trialActive || !user.trialStartDate) {
      setTrialTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days in millisecond integers
      const start = new Date(user.trialStartDate!).getTime();
      const now = Date.now();
      const elapsed = now - start;
      const remaining = TRIAL_DURATION_MS - elapsed;

      if (remaining <= 0) {
        setTrialTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTrialTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [user.trialActive, user.trialStartDate]);

  const handleActivateTrial = () => {
    onUpdateUser({
      ...user,
      trialActive: true,
      trialStartDate: new Date().toISOString(),
      isPremium: false // starts with normal mode but has premium access based on trial
    });
    setShowPaywall(false);
  };

  // Drag and drop / base64 states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File uploads and canvas compression
  const handleProfilePicChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("This file type is not supported. Please upload an image (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image is too large. Please select an image under 8MB.");
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const SIZE = 240; // Output bounds standard square
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          onUpdateUser({
            ...user,
            profilePic: compressedBase64,
          });
          setIsSavedNotice(true);
          setTimeout(() => setIsSavedNotice(false), 3000);
        }
      };
      img.onerror = () => {
        setUploadError("Failed to parse image element.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError("Could not read file data.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProfilePicChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProfilePicChange(e.target.files[0]);
    }
  };

  // Edit fields states
  const [editName, setEditName] = useState(user.name);
  const [isEditingNameInline, setIsEditingNameInline] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  // Sync state if user.name changes
  useEffect(() => {
    setEditName(user.name);
    setTempName(user.name);
  }, [user.name]);

  const handleSaveNameInline = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempName.trim()) {
      onUpdateUser({
        ...user,
        name: tempName.trim()
      });
      setEditName(tempName.trim());
      setIsEditingNameInline(false);
    }
  };
  const [editAge, setEditAge] = useState(user.age.toString());
  const [editWeight, setEditWeight] = useState(user.weight.toString());
  const [editHeight, setEditHeight] = useState(user.height.toString());
  const [editCalories, setEditCalories] = useState(user.calorieTarget.toString());
  const [editProtein, setEditProtein] = useState(user.proteinTarget.toString());
  const [editCarbs, setEditCarbs] = useState(user.carbTarget.toString());
  const [editFats, setEditFats] = useState(user.fatTarget.toString());
  const [editDietStyle, setEditDietStyle] = useState(user.dietaryPreference);
  const [editWaterTarget, setEditWaterTarget] = useState(user.waterTarget.toString());
  const [editMealReminders, setEditMealReminders] = useState(user.mealReminders);
  const [editCountry, setEditCountry] = useState(user.country || "India");
  const [editWaterReminders, setEditWaterReminders] = useState(user.waterRemindersEnabled !== false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: editName,
      age: parseInt(editAge) || user.age,
      weight: parseFloat(editWeight) || user.weight,
      height: parseFloat(editHeight) || user.height,
      calorieTarget: parseInt(editCalories) || user.calorieTarget,
      proteinTarget: parseInt(editProtein) || user.proteinTarget,
      carbTarget: parseInt(editCarbs) || user.carbTarget,
      fatTarget: parseInt(editFats) || user.fatTarget,
      dietaryPreference: editDietStyle,
      waterTarget: parseFloat(editWaterTarget) || user.waterTarget,
      mealReminders: editMealReminders,
      country: editCountry,
      waterRemindersEnabled: editWaterReminders,
    });
    setIsEditing(false);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // Quick helper to flip the interactive Water Tracking toggle
  const handleToggleWater = () => {
    onUpdateUser({
      ...user,
      waterActive: !user.waterActive
    });
  };

  // Quick helper to toggle water reminders
  const handleToggleWaterReminders = () => {
    onUpdateUser({
      ...user,
      waterRemindersEnabled: user.waterRemindersEnabled === false ? true : false
    });
    setEditWaterReminders(user.waterRemindersEnabled === false ? true : false);
  };

  return (
    <div className="flex flex-col gap-6" id="profile-tab-view">
      
      {/* User Identity Header from Wireframe */}
      <section className="flex flex-col items-center pt-4 pb-2" id="profile-identity-section">
        <div className="relative mb-4 group" id="profile-avatar-container">
          {/* Hidden input element */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            accept="image/*" 
            className="hidden" 
            id="profile-picture-native-input"
          />
          
          {/* Main Drag-and-Drop Image Frame with Glow Effects */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-28 h-28 rounded-full overflow-hidden border-4 transition-all duration-300 relative cursor-pointer shadow-lg flex items-center justify-center bg-surface-container-high ${
              dragActive 
                ? 'border-primary ring-8 ring-primary/20 scale-105' 
                : 'border-white dark:border-surface-container hover:border-primary-container'
            }`}
            id="draggable-profile-avatar-frame"
          >
            {/* Background Profile Thumbnail */}
            <img 
              alt="User profile pic" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              src={user.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"} 
              referrerPolicy="no-referrer"
              id="actual-avatar-img"
            />

            {/* Hover overlay explaining select on click / drag & drop */}
            <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${dragActive ? 'opacity-100' : ''}`}>
              <Camera className="w-5 h-5 text-white animate-bounce" />
              <span className="text-[9px] text-white font-black uppercase tracking-wider text-center px-1 leading-none">
                {dragActive ? "Drop here!" : "Upload Photo"}
              </span>
              <span className="text-[7px] text-zinc-300 font-medium tracking-wide">Click or Drag</span>
            </div>
          </div>

          {/* Trigger button for profile picture modification */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary hover:bg-opacity-95 text-on-primary w-8.5 h-8.5 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface cursor-pointer transform active:scale-90 transition-transform"
            title="Upload custom profile photo"
            id="avatar-upload-trigger-pencil"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Visual Upload Error Indicator if file is unaligned */}
        {uploadError && (
          <div className="flex items-center gap-1.5 bg-error/10 text-error text-[10px] uppercase font-bold py-1 px-3.5 rounded-full mb-3 shadow-sm border border-error/10 animate-fade-in" id="profile-upload-error-tag">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
          </div>
        )}
        
        {isEditingNameInline ? (
          <form onSubmit={handleSaveNameInline} className="flex items-center justify-center gap-1.5 mt-1" id="inline-name-edit-form">
            <input 
              type="text" 
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="text-center text-lg sm:text-xl font-bold border-b-2 border-primary bg-transparent text-on-surface focus:outline-none max-w-[220px] px-1 font-sans"
              autoFocus
              id="inline-name-edit-input"
            />
            <button type="submit" className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-full cursor-pointer transition-colors" id="btn-save-inline-name">
              <Check className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => { setIsEditingNameInline(false); setTempName(user.name); }} className="p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer transition-colors" id="btn-cancel-inline-name">
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 group select-none mt-1" id="profile-name-label-container">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface text-center tracking-tight" id="profile-name-label">{user.name}</h2>
            <button 
              onClick={() => {
                setTempName(user.name);
                setIsEditingNameInline(true);
              }} 
              className="opacity-60 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer"
              title="Edit Profile Name"
              id="btn-edit-name-trigger"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <p className="text-xs text-on-surface-variant font-medium mt-1">{user.email}</p>

        {/* Highlight Age Weight Height Chips */}
        <div className="flex gap-4 mt-6" id="identity-chips-container">
          <div className="bg-surface-container rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[85px] border border-outline-variant/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Age</span>
            <span className="text-lg font-extrabold text-on-surface mt-0.5">{user.age}</span>
          </div>
          <div className="bg-surface-container rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[85px] border border-outline-variant/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Weight</span>
            <span className="text-lg font-extrabold text-on-surface mt-0.5">
              {user.weight} <span className="text-xs font-semibold text-on-surface-variant">kg</span>
            </span>
          </div>
          <div className="bg-surface-container rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[85px] border border-outline-variant/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Height</span>
            <span className="text-lg font-extrabold text-on-surface mt-0.5">
              {user.height} <span className="text-xs font-semibold text-on-surface-variant">cm</span>
            </span>
          </div>
        </div>

        {/* HIGHLIGHT COMPREHENSIVE ADMIN AUDITING DESK FOR THE SUPER USER */}
        {setView && (user.email === "ajdonna21@gmail.com") && (
          <div className="w-full max-w-sm mx-auto mt-4 px-1" id="auditor-dashboard-launcher">
            <button
              onClick={() => setView("admin")}
              className="w-full flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/15 border-2 border-dashed border-emerald-500/25 rounded-2xl cursor-pointer hover:scale-[1.01] active:scale-99 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <ShieldAlert className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-405 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest leading-none">
                    UPI Billing Audit Desk
                  </h4>
                  <p className="text-[9.5px] text-zinc-550 dark:text-zinc-400 font-semibold mt-1">
                    Manage queue of bank transactions
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
            </button>
          </div>
        )}

        {/* GOOGLE CLOUD SYNC & SIGN IN GATEWAY */}
        {isFirebaseConfigured && (
          <div className="w-full max-w-sm mx-auto mt-4 px-1" id="profile-cloud-sync-card">
            {firebaseUser ? (
              <div className="border border-emerald-500/10 dark:border-emerald-500/15 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] rounded-2xl p-4 flex flex-col gap-3.5 text-left relative overflow-hidden shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest leading-none">
                      ✓ Cloud Sync Active
                    </h4>
                    <p className="text-[10.5px] text-zinc-650 dark:text-zinc-300 mt-1.5 font-semibold truncate">
                      Synced as <span className="font-bold underline">{firebaseUser.email}</span>
                    </p>
                  </div>
                </div>
                <div className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-normal bg-zinc-50 dark:bg-zinc-950/20 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/40 font-medium">
                  Your food logs, recipes, goals, and premium status are securely backed up to the Firestore cloud database in real-time.
                </div>
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3.5 text-left shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-zinc-900 dark:text-zinc-300 uppercase tracking-widest leading-none">
                      Database Cloud Backup
                    </h4>
                    <p className="text-[10.5px] text-zinc-550 dark:text-zinc-400 mt-1.5 leading-normal font-semibold">
                      Your app profile is currently stored locally. Sign in with Google to enable real-time cloud database backup and sync your logs across all devices.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onGoogleLogin}
                  className="w-full h-10.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-850/80 text-white dark:text-zinc-950 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                  id="google-sync-login-btn"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In with Google
                </button>
              </div>
            )}
          </div>
        )}

        {/* PREMIUM MEMBERSHIP CONTROLS */}
        <div className="w-full max-w-sm mx-auto mt-4" id="profile-premium-membership-section">
          {user.isPremium ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(245,158,11,0.05)] relative overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              </div>
              <div className="text-left flex-1">
                <h4 className="text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest">👑 PRO STATUS ACTIVE</h4>
                <p className="text-[10.5px] text-zinc-650 dark:text-zinc-300 mt-1 leading-normal font-bold">
                  Unlimited custom AI recipe plans, ingredient analysis checklists, and multi-device database sync enabled!
                </p>
              </div>
            </div>
          ) : user.trialActive ? (
            <div className="bg-gradient-to-br from-amber-50/40 to-neutral-50 dark:from-zinc-950/40 dark:to-zinc-900/40 border border-amber-500/15 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    🎉 3-DAY TRIAL ACTIVE
                  </h4>
                  {trialTimeLeft?.expired ? (
                    <span className="text-[10px] font-extrabold text-red-500 mt-0.5 block uppercase animate-pulse">⚠️ Trial Period Expired</span>
                  ) : (
                    <div className="font-mono text-[11px] font-extrabold text-on-surface mt-0.5 flex gap-1 items-center">
                      ⏱️ {trialTimeLeft ? (
                        <span>
                          {trialTimeLeft.days}d {trialTimeLeft.hours}h {trialTimeLeft.minutes}m {trialTimeLeft.seconds}s left
                        </span>
                      ) : (
                        <span>Loading timer...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                {trialTimeLeft?.expired 
                  ? "Your trial period has concluded. Choose Stripe or Razorpay below to keep unlimited AI trackers, meal guides, and recipes!"
                  : "Enjoy unrestricted access to macro calculations and regional foods. Lock it in permanently at any time below."}
              </p>

              <div className="flex gap-2 border-t border-zinc-100 dark:border-zinc-850/60 pt-2.5 mt-1 select-none">
                {!trialTimeLeft?.expired && (
                  <button
                    type="button"
                    onClick={() => {
                      // Set start date to 4 days in the past to simulate expiration instantly
                      onUpdateUser({
                        ...user,
                        trialActive: true,
                        trialStartDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
                      });
                    }}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-300 font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg transition-all"
                    title="Simulate Trial Countdown Ending"
                  >
                    🧪 Expire Trial
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFinalPrice(4.99);
                    setCouponApplied(false);
                    setCouponCode("");
                    setShowPaywall(true);
                    setShowCheckout(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg ml-auto transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  🔒 {trialTimeLeft?.expired ? "Pay with Stripe/Razorpay" : "Purchase Premium"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/25 dark:bg-zinc-950/40 border border-blue-500/10 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-blue-500 animate-pulse" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-[10px] font-black text-blue-950 dark:text-zinc-200 uppercase tracking-wider">Unlock Premium AI Mode</h4>
                  <p className="text-[9.5px] text-zinc-500 dark:text-zinc-450 mt-0.5 leading-normal">
                    Free quota: <span className="font-bold text-blue-600 dark:text-blue-400">{user.aiGenerationsCount || 0}/2</span> generations used.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-1.5 border-t border-zinc-100 dark:border-zinc-850/60 pt-2.5 mt-0.5">
                <button 
                  type="button"
                  onClick={() => {
                    setFinalPrice(4.99);
                    setCouponApplied(false);
                    setCouponCode("");
                    setShowPaywall(true);
                    setShowCheckout(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[9px] uppercase tracking-wide px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  👑 Check Premium
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMPANION INTERACTIVE PROFILE EDITOR FORM */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            id="editor-dropdown-container"
          >
            <form onSubmit={handleSave} className="bg-surface border border-outline-variant/30 card-elevation-1 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                <span className="text-xs font-bold text-primary uppercase">Profile & Targets Tuning</span>
                <span className="text-[10px] text-on-surface-variant font-medium">Configure customized diet profile targets.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    required
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Age</label>
                  <input 
                    type="number" 
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Height (cm)</label>
                  <input 
                    type="number" 
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Calories (kcal)</label>
                  <input 
                    type="number" 
                    value={editCalories}
                    onChange={(e) => setEditCalories(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    value={editProtein}
                    onChange={(e) => setEditProtein(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Fats (g)</label>
                  <input 
                    type="number" 
                    value={editFats}
                    onChange={(e) => setEditFats(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Cuisine / Country</label>
                  <select 
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="Japan">🇯🇵 Japan</option>
                    <option value="Mexico">🇲🇽 Mexico</option>
                    <option value="Italy">🇮🇹 Italy</option>
                    <option value="USA">🇺🇸 USA</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Middle East">🇱🇧 Middle East</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Diet Style Filter</label>
                  <input 
                    type="text" 
                    value={editDietStyle}
                    onChange={(e) => setEditDietStyle(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Water Target (Liters)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editWaterTarget}
                    onChange={(e) => setEditWaterTarget(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Meal Reminders</label>
                  <input 
                    type="text" 
                    value={editMealReminders}
                    onChange={(e) => setEditMealReminders(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30"
                  />
                </div>
              </div>

              <div className="border-t border-outline-variant/10 pt-3.5 flex items-center justify-between" id="edit-water-reminders-subrow">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">4-Hour Water Intake Reminders</span>
                  <span className="text-[10px] text-on-surface-variant">Triggers notification alerts if no water logs are received for over 4 hours</span>
                </div>
                <div className="flex items-center">
                  <button 
                    type="button"
                    onClick={() => setEditWaterReminders(!editWaterReminders)} 
                    className={`w-12 h-6.5 rounded-full p-1.5 transition-colors duration-300 relative focus:outline-none cursor-pointer ${editWaterReminders ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 absolute top-1 ${editWaterReminders ? 'left-6.5' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end" id="editor-form-buttons">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-opacity-90 text-on-primary font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 border-none outline-none"
                >
                  Apply Changes <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isSavedNotice && (
        <div className="bg-primary-container/20 text-primary text-xs font-bold p-3.5 rounded-xl border border-primary/10 flex items-center justify-center gap-1.5 shadow-inner">
          <Check className="w-4 h-4" /> Customized targets applied successfully!
        </div>
      )}

      {/* Target goals section matching profile wireframe */}
      <section className="flex flex-col gap-4" id="target-goals-wireframe-pane">
        <div className="flex justify-between items-end">
          <h3 className="text-md font-bold text-on-surface tracking-tight uppercase tracking-wider text-[11px] text-on-surface-variant">Daily Targets</h3>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-primary text-[10px] font-bold uppercase flex items-center gap-1 hover:underline"
          >
            Edit <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" id="wireframe-targets-rows">
          {/* Calorie Card */}
          <div className="sm:col-span-2 bg-surface card-elevation-1 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:card-elevation-2 transition-all duration-300 border border-outline-variant/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-105"></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block">Calories</span>
                <span className="text-2xl font-extrabold text-primary block mt-1.5" id="calories-display">
                  {user.calorieTarget.toLocaleString()}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium mt-0.5 block">kcal / day</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center">
                <Flame className="w-5 h-5 fill-primary" />
              </div>
            </div>

            <div className="mt-5 relative z-10">
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "75%" }}></div>
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
                <span>Deficit goal</span>
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Protein Card */}
          <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-secondary-container/20 flex flex-col justify-between min-h-[140px] group hover:card-elevation-2 transition-all">
            <div>
              <span className="text-[9px] font-bold text-secondary-container uppercase tracking-widest block">Protein</span>
              <span className="text-xl font-extrabold text-on-surface block mt-1.5">{user.proteinTarget}g</span>
            </div>
            <div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-secondary-container h-full rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-tertiary-container/20 flex flex-col justify-between min-h-[140px] group hover:card-elevation-2 transition-all">
            <div>
              <span className="text-[9px] font-bold text-tertiary-container uppercase tracking-widest block">Carbs</span>
              <span className="text-xl font-extrabold text-on-surface block mt-1.5">{user.carbTarget}g</span>
            </div>
            <div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-tertiary-container h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences List matching wireframe layout */}
      <section className="flex flex-col gap-4" id="preferences-wireframe-pane">
        <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Preferences</h3>
        
        <div className="bg-surface card-elevation-1 rounded-xl overflow-hidden divide-y divide-outline-variant/10 border border-outline-variant/15">
          {/* Item: Region/Country Cuisine Locale setting */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all cursor-pointer group" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center group-hover:bg-primary-container group-hover:text-primary transition-colors text-lg select-none">
                {user.country === "India" ? "🇮🇳" :
                 user.country === "Japan" ? "🇯🇵" :
                 user.country === "Mexico" ? "🇲🇽" :
                 user.country === "Italy" ? "🇮🇹" :
                 user.country === "USA" ? "🇺🇸" :
                 user.country === "France" ? "🇫🇷" :
                 user.country === "Middle East" ? "🇱🇧" : "🇮🇳"}
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">Regional Cuisine Origin</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">{user.country || "India"} Traditional Plan</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline animate-pulse" />
          </div>

          {/* Item: Dietary Preference */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all cursor-pointer group" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center group-hover:bg-primary-container group-hover:text-primary transition-colors">
                <Utensils className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">Dietary Preference</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">{user.dietaryPreference || "No Restrictions"}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </div>

          {/* Item: Water Tracking */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center">
                <Droplet className="w-5 h-5 text-tertiary fill-tertiary-container" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">Water Tracking</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">Daily Goal: {user.waterTarget.toFixed(1)} L</span>
              </div>
            </div>

            {/* Custom iOS Slidings toggle switches */}
            <div className="flex items-center">
              <button 
                type="button"
                onClick={handleToggleWater} 
                className={`w-12 h-6.5 rounded-full p-1.5 transition-colors duration-300 relative focus:outline-none cursor-pointer ${user.waterActive ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 absolute top-1 ${user.waterActive ? 'left-6.5' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Item: 4-Hour Water Reminder */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">4-Hour Water Reminders</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">Alerts if no water logs detected for 4 hours</span>
              </div>
            </div>

            {/* Custom iOS Slidings toggle switches */}
            <div className="flex items-center">
              <button 
                type="button"
                onClick={handleToggleWaterReminders} 
                className={`w-12 h-6.5 rounded-full p-1.5 transition-colors duration-300 relative focus:outline-none cursor-pointer ${user.waterRemindersEnabled !== false ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 absolute top-1 ${user.waterRemindersEnabled !== false ? 'left-6.5' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Item: Meal Reminders */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all cursor-pointer group" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center group-hover:bg-primary-container group-hover:text-primary transition-colors">
                <Settings className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">Meal Reminders</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">{user.mealReminders}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </div>
        </div>
      </section>

      {/* Achievement badges horizontal scroll layout matching wireframe */}
      <section className="flex flex-col gap-4 pb-4" id="achievements-scroll-pane">
        <div className="flex justify-between items-center">
          <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Achievements</h3>
          <span 
            onClick={() => setShowAllAchievements(true)}
            className="text-primary text-[10px] font-bold uppercase hover:underline cursor-pointer"
            id="view-all-achievements-btn"
          >
            View All
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3.5 snap-x snap-mandatory hide-scrollbar -mx-6 px-6" id="badges-scroller">
          {/* Badge 1 */}
          <div className="snap-start shrink-0 w-32 bg-surface border border-secondary-container/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/10 to-transparent"></div>
            <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center shadow relative z-10">
              <Flame className="w-5.5 h-5.5 fill-white" />
            </div>
            <div className="relative z-10 mt-1">
              <div className="text-[11px] font-bold text-on-surface">7 Day Streak</div>
              <div className="text-[8px] font-semibold text-on-surface-variant mt-0.5">Logged every meal</div>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="snap-start shrink-0 w-32 bg-surface border border-tertiary-container/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/10 to-transparent"></div>
            <div className="w-11 h-11 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow relative z-10">
              <Droplet className="w-5.5 h-5.5 fill-white" />
            </div>
            <div className="relative z-10 mt-1">
              <div className="text-[11px] font-bold text-on-surface">Hydro Hero</div>
              <div className="text-[8px] font-semibold text-on-surface-variant mt-0.5">Hit water goal 5x</div>
            </div>
          </div>

          {/* Badge 3 (Locked) */}
          <div className="snap-start shrink-0 w-32 bg-surface-container-low border border-outline-variant/15 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden opacity-60">
            <div className="w-11 h-11 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center relative z-10">
              <Lock className="w-5 h-5" />
            </div>
            <div className="relative z-10 mt-1">
              <div className="text-[11px] font-bold text-on-surface">Macro Master</div>
              <div className="text-[8px] font-semibold text-on-surface-variant mt-0.5">Hit macros perfectly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Wireframe Log Out Button */}
      <button 
        onClick={onLogout}
        className="w-full py-3.5 border border-error text-error hover:bg-error-container/10 active:scale-95 duration-100 rounded-full font-bold text-sm tracking-tight transition-colors cursor-pointer mt-2"
        id="profile-logout-btn"
      >
        Log Out
      </button>

      {/* SECURE STRIPE CHECKOUT SYSTEM MODAL */}
      <AnimatePresence>
        <PricingModal 
          isOpen={showPaywall} 
          onClose={() => setShowPaywall(false)} 
          user={user} 
          onUpdateUser={onUpdateUser} 
        />
      </AnimatePresence>

      {/* RICH INTERACTIVE ALL ACHIEVEMENTS SYSTEM OVERLAY PANEL */}
      <AnimatePresence>
        {showAllAchievements && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            id="all-achievements-backdrop-overlay"
            onClick={() => setShowAllAchievements(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
              id="achievements-modal-content"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Award className="w-4.5 h-4.5 fill-amber-500/20" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-zinc-900 dark:text-white tracking-tight">Your Achievements</h4>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Earn elite badges as you hit your fitness benchmarks</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAllAchievements(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-full cursor-pointer transition-colors"
                  id="close-achievements-modal-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 max-h-[420px] overflow-y-auto flex flex-col gap-3.5 animate-scroller" id="achievements-items-list-container">
                {[
                  {
                    id: "7-day-streak",
                    title: "7 Day Streak",
                    description: "Keep your calorie-tracking flame alive by logging meals 7 consecutive days.",
                    category: "Consistency",
                    unlocked: true,
                    progress: "7/7 days completed",
                    iconColor: "bg-orange-500 text-white",
                    icon: <Flame className="w-5 h-5 fill-white/20" />
                  },
                  {
                    id: "hydro-hero",
                    title: "Hydro Hero",
                    description: "Stay fully loaded and balanced with natural hydration targets checked 5x.",
                    category: "Water Logs",
                    unlocked: true,
                    progress: "5/5 times completed",
                    iconColor: "bg-blue-500 text-white",
                    icon: <Droplet className="w-5 h-5 fill-white/20" />
                  },
                  {
                    id: "macro-master",
                    title: "Macro Master",
                    description: "Align your high-protein, carb, and fats requirements down to the pristine grams.",
                    category: "Precision",
                    unlocked: false,
                    progress: "1/3 target days",
                    iconColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-400",
                    icon: <Lock className="w-4.5 h-4.5" />
                  },
                  {
                    id: "calorie-cadet",
                    title: "Calorie Cadet",
                    description: "Balance dynamic daily calorie tracking strictly within recommended target zones.",
                    category: "Balance",
                    unlocked: true,
                    progress: "Perfect status",
                    iconColor: "bg-amber-500 text-white",
                    icon: <Crown className="w-5 h-5 fill-white/20" />
                  },
                  {
                    id: "fridge-magician",
                    title: "Fridge Magician",
                    description: "Co-create and craft high-grade recipes using residual leftover ingredients.",
                    category: "Kitchen Assistant",
                    unlocked: false,
                    progress: "2/5 recipes crafted",
                    iconColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-400",
                    icon: <Lock className="w-4.5 h-4.5" />
                  }
                ].map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                      item.unlocked 
                        ? "bg-zinc-50/50 dark:bg-zinc-950/10 border-zinc-100/70 dark:border-zinc-800/60" 
                        : "bg-zinc-100/10 dark:bg-zinc-950/5 border-zinc-100/30 dark:border-zinc-900/30 opacity-60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm ${item.iconColor}`}>
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{item.category}</span>
                          <h5 className="font-bold text-xs text-zinc-900 dark:text-white mt-0.5">{item.title}</h5>
                        </div>
                        {item.unlocked ? (
                          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase shrink-0">Unlocked</span>
                        ) : (
                          <span className="text-[8px] font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-full uppercase shrink-0">Locked</span>
                        )}
                      </div>
                      <p className="text-[11px] leading-snug font-medium text-zinc-500 dark:text-zinc-400 mt-1">{item.description}</p>
                      
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-zinc-150 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.unlocked ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-zinc-400'}`} 
                            style={{ width: item.unlocked ? '100%' : '40%' }} 
                          />
                        </div>
                        <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0">{item.progress}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <button
                  onClick={() => setShowAllAchievements(false)}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-black rounded-xl duration-150 transition-colors cursor-pointer"
                  id="achievements-understood-btn"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
