import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  ShieldAlert, 
  Check, 
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebase";

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
  darkMode: boolean;
  triggerToast: (msg: string) => void;
}

export default function AuthScreen({ onAuthSuccess, darkMode, triggerToast }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Form states
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Friendly error translator
  const translateFirebaseError = (error: any): string => {
    const code = error?.code || "";
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email. Please sign up.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please verify your credentials.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Access has been temporarily restricted.";
      default:
        return error?.message || "An authentication error occurred. Please try again.";
    }
  };

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Baseline validation
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // 2. Set profile display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });
      }
      setSuccessMsg("Account created successfully! Preparing dashboard...");
      triggerToast(`Welcome to DietView, ${name}!`);
      
      // Allow user credentials setting logic in App state
      setTimeout(() => {
        onAuthSuccess(userCredential.user);
      }, 1000);
    } catch (err: any) {
      console.error("Sign Up error: ", err);
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("Logged in successfully! Loading your database backup...");
      triggerToast(`Welcome back, ${userCredential.user.displayName || "Healthy Sprout"}!`);
      
      setTimeout(() => {
        onAuthSuccess(userCredential.user);
      }, 1000);
    } catch (err: any) {
      console.error("Sign In error: ", err);
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!isFirebaseConfigured) {
      setErrorMsg("Firebase is currently not configured. Please contact the administrator.");
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      triggerToast(`Signed in as ${result.user.displayName || "User"} successfully!`);
      onAuthSuccess(result.user);
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-center items-center py-10 px-4 transition-colors duration-200" id="auth-master-page">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl opacity-60 dark:opacity-30 select-none pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10" id="auth-panel-container">
        
        {/* App Title & Header Logo */}
        <div className="flex flex-col items-center text-center mb-6" id="auth-logo-header">
          <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold font-mono text-xl shadow-md mb-2">
            DV
          </div>
          <h1 className="text-2.5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1">
            Diet<span className="text-orange-500">View</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs font-semibold">
            {isSignUp 
              ? "Create your account to enable real-time cloud sync & track progress across devices." 
              : "Sign in to synchronize your calorie goals, diet logs, and AI meal recommendations."
            }
          </p>
        </div>

        {/* Tab Toggle Switch (Sign In vs Sign Up) */}
        <div className="bg-zinc-100 dark:bg-zinc-950 p-1.2 rounded-xl flex mb-6 border border-zinc-200/50 dark:border-zinc-850/80" id="auth-tab-switch">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`w-1/2 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              !isSignUp 
                ? "bg-white dark:bg-zinc-805 text-zinc-900 dark:text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
            }}
            className={`w-1/2 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              isSignUp 
                ? "bg-white dark:bg-zinc-805 text-zinc-900 dark:text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Success Notifications */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 text-rose-700 dark:text-rose-450 text-xs font-semibold p-3.5 rounded-xl mb-5 flex items-start gap-2.5 text-left"
              id="auth-error-banner"
            >
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-450 text-xs font-semibold p-3.5 rounded-xl mb-5 flex items-start gap-2.5 text-left"
              id="auth-success-banner"
            >
              <div className="w-4.5 h-4.5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials Form */}
        <form onSubmit={isSignUp ? handlePasswordSignUp : handlePasswordSignIn} className="space-y-4" id="auth-credentials-form">
          {isSignUp && (
            <div className="flex flex-col text-left" id="group-name">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Donna Sprout"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
                  id="auth-name-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col text-left" id="group-email">
            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="donna@dietview.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
                id="auth-email-input"
                required
              />
            </div>
          </div>

          <div className="flex flex-col text-left" id="group-password">
            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-11 pl-10 pr-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
                id="auth-password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="flex flex-col text-left" id="group-confirm-password">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
                  id="auth-confirm-password-input"
                  required
                />
              </div>
            </div>
          )}

          {/* Core Submit Auth Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {isSignUp ? "Create My Account" : "Sign In to My Account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        {isFirebaseConfigured && (
          <>
            <div className="flex items-center my-5" id="auth-divider">
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest px-3">or</span>
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            {/* Google Single Sign-On Integration */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-11 bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-3.5 cursor-pointer shadow-sm disabled:opacity-50 active:scale-[0.98]"
              id="auth-google-btn"
            >
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.12-5.136 4.12A5.72 5.72 0 018.27 12.8a5.72 5.72 0 015.72-5.72c1.472 0 2.802.553 3.82 1.455l3.123-3.123C18.99 3.633 16.634 2.8 13.99 2.8a9.4 9.4 0 00-9.4 9.4 9.4 9.4 0 009.4 9.4c5.093 0 9.073-3.535 9.073-9.073 0-.52-.045-1.018-.135-1.442H12.24z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

      </div>
    </div>
  );
}
