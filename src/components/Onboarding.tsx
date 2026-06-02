import React, { useState, useEffect } from "react";
import { 
  Camera, HelpCircle, X, Shield, Sparkles, Zap, ChevronRight, ArrowLeft, 
  Check, Star, Calendar, MessageSquare, Award, ArrowUpRight, AwardIcon,
  Flame, Bell, Activity, User, Heart, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingProps {
  onStart: () => void;
  darkMode: boolean;
}

export default function Onboarding({ onStart, darkMode }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);
  
  // Selection States
  const [heardFrom, setHeardFrom] = useState<string>("");
  const [goal, setGoal] = useState<string>("Maintain");
  const [accomplish, setAccomplish] = useState<string>("");
  const [diet, setDiet] = useState<string>("Classic");
  const [workouts, setWorkouts] = useState<string>("3 - 5");
  const [gender, setGender] = useState<string>("Female");
  const [birthMonth, setBirthMonth] = useState<string>("January");
  const [birthDay, setBirthDay] = useState<string>("01");
  const [birthYear, setBirthYear] = useState<string>("2001");
  
  // Height & Weight states
  const [isMetric, setIsMetric] = useState<boolean>(true);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(6);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [weightLbs, setWeightLbs] = useState<number>(119);

  // Setup Checklist percentage loading
  const [setupChecklistProgress, setSetupChecklistProgress] = useState<number>(35);
  const [checkedItems, setCheckedItems] = useState<string[]>(["Calories", "Carbs"]);

  // Multi-step auto simulator for the setup step
  useEffect(() => {
    if (step === 11) {
      const interval = setInterval(() => {
        setSetupChecklistProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + 13;
          
          // Tick dynamic checks
          if (next > 50 && !checkedItems.includes("Protein")) {
            setCheckedItems(c => [...c, "Protein"]);
          }
          if (next > 75 && !checkedItems.includes("Fats")) {
            setCheckedItems(c => [...c, "Fats"]);
          }
          if (next > 95 && !checkedItems.includes("Health score")) {
            setCheckedItems(c => [...c, "Health score"]);
          }

          return next > 100 ? 100 : next;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Total steps in the process
  const totalQuestionSteps = 16;

  const nextStep = () => {
    if (step < totalQuestionSteps) {
      setStep(prev => prev + 1);
    } else {
      onStart();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const skipAll = () => {
    onStart();
  };

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between py-5 px-4.5 transition-colors duration-200`} id="onboarding-master">
      
      {/* Top Header Row with Arrow back, progress line tracker, and Skip button */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between min-h-[44px]" id="onboarding-navigator-header">
        {step > 0 ? (
          <button 
            onClick={prevStep}
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-850 dark:text-zinc-200 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            id="onboarding-back-btn"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5" id="onboarding-brand-logo">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-extrabold font-mono text-xs shadow-sm">
              DV
            </div>
            <span className="text-xs font-black tracking-wide uppercase text-zinc-800 dark:text-zinc-100">DietView</span>
          </div>
        )}

        {/* Progress horizontal line indicators when in survey questions */}
        {step > 0 && step < 11 && (
          <div className="flex-1 mx-4 max-w-[180px] bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden" id="onboarding-progress-bar-container">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 10) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Actions list container top right */}
        <div className="flex items-center gap-2" id="onboarding-top-right-meta">
          {/* Universal Skip option to bypass anytime */}
          {step < 11 && (
            <button 
              onClick={skipAll}
              className="text-[11px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest hover:opacity-80 transition-colors py-1.5 px-3 rounded-full bg-orange-500/10 dark:bg-orange-400/5 border border-orange-500/10 cursor-pointer"
              id="onboarding-global-skip-btn"
            >
              Skip
            </button>
          )}

          {/* Mini Language code indicator as shown in reference */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 py-1 px-2.5 rounded-full flex items-center gap-1 text-[10px] font-bold select-none cursor-default">
            <span className="text-xs select-none">🇺🇸</span>
            <span className="text-zinc-600 dark:text-zinc-350">EN</span>
          </div>
        </div>
      </header>

      {/* Primary Animated Screen Content Layout Area */}
      <main className="flex-1 max-w-md w-full mx-auto flex flex-col justify-center py-6" id="onboarding-main-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full flex flex-col"
          >
            
            {/* Step 0: Splash / Smartphone Viewfinder Landing Page */}
            {step === 0 && (
              <div className="flex flex-col text-center" id="onboarding-screen-0">
                {/* Hero Visual Column: Phone Mockup */}
                <div className="flex items-center justify-center my-3 relative overflow-visible" id="onboarding-mockup-wrapper">
                  {/* Glowing Ambient BG light */}
                  <div className="absolute -inset-4 bg-orange-500/10 rounded-[48px] blur-2xl opacity-60 dark:opacity-40 select-none pointer-events-none"></div>

                  {/* Smartphone Frame Wrapper */}
                  <div className="relative w-[236px] aspect-[9/18] rounded-[40px] border-[5px] border-zinc-900 dark:border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl select-none" id="simulated-smartphone-chassis">
                    
                    {/* Dynamic Island Notch */}
                    <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-18 h-3.5 bg-black rounded-full z-30 flex items-center justify-center gap-1.5 px-2">
                      <div className="w-1.5 h-1.5 bg-zinc-850 rounded-full"></div>
                      <div className="w-1 h-1 bg-amber-500/20 rounded-full"></div>
                    </div>

                    {/* Inside view frame screen */}
                    <div className="w-full h-full rounded-[32px] overflow-hidden bg-zinc-900 relative flex flex-col justify-between py-5 px-3" id="simulated-smartphone-viewport">
                      
                      {/* Backlit high premium meal viewport wallpaper */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center brightness-95 contrast-[1.02]" 
                        style={{ 
                          backgroundImage: `url("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80")` 
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35"></div>
                      </div>

                      {/* Viewport Top Actions layer */}
                      <div className="relative z-10 flex justify-between items-center mt-2" id="mock-nav-overlay">
                        <div className="w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center text-[8px] font-bold">X</div>
                        <div className="w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center text-[8px] font-bold">?</div>
                      </div>

                      {/* Scanning Brackets Frame viewfinder locator */}
                      <div className="relative z-10 my-auto flex items-center justify-center" id="mock-brackets-viewfinder">
                        <div className="relative w-32 h-32">
                          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-white/95 rounded-tl-sm"></div>
                          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-white/95 rounded-tr-sm"></div>
                          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-white/95 rounded-bl-sm"></div>
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-white/95 rounded-br-sm"></div>

                          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-white tracking-wide uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-black/30 backdrop-blur-sm">
                            <Sparkles className="w-2.5 h-2.5 text-orange-400 rotate-12" />
                            Scan Ready
                          </div>
                        </div>
                      </div>

                      {/* Camera mode switcher and bottom trigger drawer console screen area */}
                      <div className="relative z-10 flex flex-col gap-2.5" id="mock-camera-controls">
                        
                        {/* Mode Switcher Pill */}
                        <div className="bg-white/95 backdrop-blur-md rounded-full py-0.5 px-1 flex items-center justify-between border border-white/20 text-zinc-900 shadow">
                          <div className="bg-zinc-900 text-white rounded-full py-0.5 px-2.5 text-[8px] font-extrabold uppercase tracking-tight">
                            Scan Food
                          </div>
                          <div className="flex gap-2 items-center pr-2 text-zinc-650 scale-90">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                          </div>
                        </div>

                        {/* Trigger button circles */}
                        <div className="flex justify-between items-center px-1 scale-90">
                          <div className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center">⚡</div>
                          <div className="w-8 h-8 rounded-full border border-white/80 p-0.5"><div className="w-full h-full rounded-full bg-white"></div></div>
                          <div className="w-6 h-6"></div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                    Calorie tracking <br />
                    <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">made easy</span>
                  </h1>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-2 max-w-xs mx-auto">
                    Take pictures of your food to instantly map macros, calculate nutrient profiles, and synchronize goals automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Where did you hear about us? */}
            {step === 1 && (
              <div className="flex flex-col" id="onboarding-screen-1">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white leading-tight tracking-tight text-center mb-6">
                  Where did you <br />hear about us?
                </h2>
                
                <div className="flex flex-col gap-3" id="heard-from-choices">
                  {[
                    { id: "tiktok", label: "TikTok", icon: "🎵" },
                    { id: "youtube", label: "YouTube", icon: "📺" },
                    { id: "google", label: "Google", icon: "🔍" },
                    { id: "playstore", label: "Play Store", icon: "🤖" },
                    { id: "facebook", label: "Facebook", icon: "👥" },
                    { id: "friends", label: "Friend or family", icon: "💬" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setHeardFrom(option.id);
                        setTimeout(nextStep, 150); // Auto advances smoothly
                      }}
                      className={`w-full text-left py-4 px-5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        heardFrom === option.id 
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500/80 text-orange-950 dark:text-orange-300 font-semibold" 
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-zinc-350 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-xl font-sans">{option.icon}</span>
                        <span className="text-sm font-bold">{option.label}</span>
                      </div>
                      {heardFrom === option.id && (
                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: What is your goal? */}
            {step === 2 && (
              <div className="flex flex-col" id="onboarding-screen-2">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight text-center">
                  What is your goal?
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 mb-7 text-center max-w-xs mx-auto">
                  This helps us generate a plan for your calorie intake.
                </p>

                <div className="flex flex-col gap-3" id="goal-choices">
                  {[
                    { key: "Lose Weight", label: "Lose Weight", desc: "Burn fats, tone muscles, and increase stamina" },
                    { key: "Maintain", label: "Maintain", desc: "Keep track of everyday activity macro values" },
                    { key: "Gain Weight", label: "Gain Weight", desc: "Build muscles and gain bulk healthily" }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setGoal(option.key);
                        setTimeout(nextStep, 150);
                      }}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col gap-1 cursor-pointer ${
                        goal === option.key 
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500/80 text-orange-950 dark:text-orange-300 font-bold" 
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-zinc-350 dark:hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-sm font-extrabold">{option.label}</span>
                      <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-400">{option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: What would you like to accomplish? */}
            {step === 3 && (
              <div className="flex flex-col" id="onboarding-screen-3">
                <h2 className="text-2xl.5 font-black text-zinc-950 dark:text-white tracking-tight leading-tight text-center mb-6">
                  What would you like <br />to accomplish?
                </h2>

                <div className="flex flex-col gap-3" id="accomplish-choices">
                  {[
                    { id: "healthier", label: "Eat and live healthier", icon: "🍎" },
                    { id: "energy", label: "Boost my energy and mood", icon: "☀️" },
                    { id: "motivated", label: "Stay motivated and consistent", icon: "💪" },
                    { id: "body", label: "Feel better about my body", icon: "🧘" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setAccomplish(option.id);
                        setTimeout(nextStep, 150);
                      }}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                        accomplish === option.id 
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500/80 text-orange-950 dark:text-orange-300 font-bold" 
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-zinc-350 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg shadow-inner">
                        {option.icon}
                      </div>
                      <span className="text-sm font-extrabold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Do you follow a specific diet? */}
            {step === 4 && (
              <div className="flex flex-col" id="onboarding-screen-4">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight text-center mb-6">
                  Do you follow <br />a specific diet?
                </h2>

                <div className="flex flex-col gap-3" id="diet-choices">
                  {[
                    { id: "Classic", label: "Classic", icon: "🍖", desc: "No specific dietary bounds or rules" },
                    { id: "Pescatarian", label: "Pescatarian", icon: "🐟", desc: "Seafood and plant-restricted elements" },
                    { id: "Vegetarian", label: "Vegetarian", icon: "🍅", desc: "Plant-derived diet without animal weights" },
                    { id: "Vegan", label: "Vegan", icon: "🌱", desc: "Completely plant-derived dietary foods" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setDiet(option.id);
                        setTimeout(nextStep, 150);
                      }}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                        diet === option.id 
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500/80 text-orange-950 dark:text-orange-300 font-bold" 
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-zinc-350 dark:hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{option.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold">{option.label}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-400">{option.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: How many workouts do you do per week? */}
            {step === 5 && (
              <div className="flex flex-col" id="onboarding-screen-5">
                <h2 className="text-2.5xl font-black text-zinc-950 dark:text-white tracking-tight leading-tight text-center">
                  How many workouts <br />do you do per week?
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6 text-center max-w-xs mx-auto">
                  This will be used to calibrate your custom plan.
                </p>

                <div className="flex flex-col gap-3" id="workout-choices">
                  {[
                    { id: "0 - 2", label: "0 - 2", desc: "Workouts now and then", icon: "●" },
                    { id: "3 - 5", label: "3 - 5", desc: "A few workouts per week", icon: "▲" },
                    { id: "6+", label: "6+", desc: "Dedicated athlete", icon: "⚄" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setWorkouts(option.id);
                        setTimeout(nextStep, 150);
                      }}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                        workouts === option.id 
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500/80 text-orange-950 dark:text-orange-300 font-bold" 
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-zinc-350 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-mono font-bold shrink-0">
                        {option.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold">{option.label}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-400">{option.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Choose your Gender */}
            {step === 6 && (
              <div className="flex flex-col" id="onboarding-screen-6">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight text-center">
                  Choose your Gender
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-2 mb-7 text-center">
                  This will be used to calibrate your custom plan.
                </p>

                <div className="flex flex-col gap-3" id="gender-choices">
                  {["Female", "Male", "Other"].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setGender(item);
                        setTimeout(nextStep, 150);
                      }}
                      className={`w-full py-4 rounded-2xl text-center border text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                        gender === item 
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500 text-orange-950 dark:text-orange-300 shadow-sm" 
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: When were you born? */}
            {step === 7 && (
              <div className="flex flex-col" id="onboarding-screen-7">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight text-center">
                  When were you born?
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-8 text-center max-w-xs mx-auto">
                  This will be taken into account when calculating your daily nutrition goals.
                </p>

                {/* Simulated native column scroll selector mockup viewports */}
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/60 dark:border-zinc-800 flex justify-center gap-4.5 relative overflow-hidden" id="native-scroll-cal-mockup">
                  {/* Subtle selector accent bar lines overlay background */}
                  <div className="absolute left-0 right-0 top-[45%] h-12 bg-orange-500/5 dark:bg-orange-500/10 border-y border-orange-500/25 pointer-events-none"></div>
                  
                  {/* Month */}
                  <div className="flex flex-col items-center gap-3.5 w-1/3">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Month</span>
                    <select 
                      value={birthMonth} 
                      onChange={(e) => setBirthMonth(e.target.value)}
                      className="bg-transparent border-none text-sm font-black text-center focus:outline-none w-full text-zinc-800 dark:text-white"
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                        <option className="bg-white dark:bg-zinc-920 text-zinc-900" key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Day */}
                  <div className="flex flex-col items-center gap-3.5 w-1/3 border-x border-zinc-200/50 dark:border-zinc-800/80">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Day</span>
                    <select 
                      value={birthDay} 
                      onChange={(e) => setBirthDay(e.target.value)}
                      className="bg-transparent border-none text-sm font-black text-center focus:outline-none w-full text-zinc-800 dark:text-white"
                    >
                      {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map(d => (
                        <option className="bg-white dark:bg-zinc-920 text-zinc-900" key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="flex flex-col items-center gap-3.5 w-1/3">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Year</span>
                    <select 
                      value={birthYear} 
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="bg-transparent border-none text-sm font-black text-center focus:outline-none w-full text-zinc-800 dark:text-white"
                    >
                      {Array.from({ length: 70 }, (_, i) => String(1960 + i)).reverse().map(y => (
                        <option className="bg-white dark:bg-zinc-920 text-zinc-900" key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Height & Weight Calibration Screen */}
            {step === 8 && (
              <div className="flex flex-col" id="onboarding-screen-8">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight text-center">
                  Height & Weight
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6 text-center max-w-xs mx-auto">
                  This will be taken into account when calculating your daily nutrition goals.
                </p>

                {/* Imperial / Metric switcher */}
                <div className="flex justify-center mb-5" id="metric-imperial-tabs">
                  <div className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full flex gap-1 border border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={() => setIsMetric(false)}
                      className={`py-1.5 px-4.5 rounded-full text-[10px] font-bold uppercase transition-all select-none cursor-pointer ${!isMetric ? 'bg-white dark:bg-zinc-850 shadow text-orange-500 dark:text-white' : 'text-zinc-650'}`}
                    >
                      Imperial
                    </button>
                    <button 
                      onClick={() => setIsMetric(true)}
                      className={`py-1.5 px-4.5 rounded-full text-[10px] font-bold uppercase transition-all select-none cursor-pointer ${isMetric ? 'bg-white dark:bg-zinc-850 shadow text-orange-500 dark:text-white' : 'text-zinc-650'}`}
                    >
                      Metric
                    </button>
                  </div>
                </div>

                {/* Custom sliders or select selectors looks like wheel reels */}
                <div className="grid grid-cols-2 gap-4" id="metric-inputs-wheels">
                  
                  {/* Height Select column */}
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-4.5 border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-2.5">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Height Target</span>
                    
                    {isMetric ? (
                      <div className="flex items-center justify-between">
                        <input 
                          type="number" 
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="bg-transparent border-none text-2xl font-black w-24 focus:outline-none dark:text-white"
                        />
                        <span className="text-xs font-bold text-zinc-450 uppercase">cm</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={heightFt}
                            onChange={(e) => setHeightFt(Number(e.target.value))}
                            className="bg-transparent border-none text-2xl font-black w-10 focus:outline-none text-right dark:text-white"
                          />
                          <span className="text-xs font-bold text-zinc-450">ft</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={heightIn}  
                            onChange={(e) => setHeightIn(Number(e.target.value))}
                            className="bg-transparent border-none text-2xl font-black w-10 focus:outline-none text-right dark:text-white"
                          />
                          <span className="text-xs font-bold text-zinc-450">in</span>
                        </div>
                      </div>
                    )}
                    <span className="text-[10px] font-semibold text-zinc-400">Calibrated for BMR metrics</span>
                  </div>

                  {/* Weight input column */}
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-4.5 border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-2.5">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Weight Current</span>
                    
                    <div className="flex items-center justify-between">
                      <input 
                        type="number" 
                        value={isMetric ? weightKg : weightLbs}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (isMetric) {
                            setWeightKg(val);
                            setWeightLbs(Math.round(val * 2.2046));
                          } else {
                            setWeightLbs(val);
                            setWeightKg(Math.round(val / 2.2046));
                          }
                        }}
                        className="bg-transparent border-none text-2xl font-black w-24 focus:outline-none dark:text-white"
                      />
                      <span className="text-xs font-bold text-zinc-450 uppercase">
                        {isMetric ? "kg" : "lb"}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400">Used for activity BMR calcs</span>
                  </div>

                </div>
              </div>
            )}

            {/* Step 9: DietView creates long term results (Weight comparison Graph Card) */}
            {step === 9 && (
              <div className="flex flex-col" id="onboarding-screen-9">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight mb-5 text-center">
                  DietView creates <br />long-term results
                </h2>

                {/* Simulated weight dynamic chart card box */}
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-[28px] p-5.5 border border-zinc-200/60 dark:border-zinc-800 shadow-sm relative overflow-hidden" id="weight-loss-graph-card">
                  <span className="text-[11px] font-extrabold text-zinc-850 dark:text-zinc-200 uppercase tracking-widest block mb-4">
                    Your weight trajectory
                  </span>

                  {/* Weight labels */}
                  <div className="flex justify-between items-start text-[10px] font-bold text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-800/80 mb-2">
                    <span>Month 1</span>
                    <span>Month 6</span>
                  </div>

                  {/* Real hand-drawn style premium SVG curves */}
                  <div className="relative h-28 my-4 flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                      {/* Dotted grid lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="65" x2="300" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Traditional Diet Curve (goes down but goes back up in month 6) */}
                      <path 
                        d="M 10 20 C 80 20, 120 90, 170 65 C 220 35, 275 10, 290 15" 
                        fill="none" 
                        stroke="#f43f5e" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />
                      
                      {/* DietView Goal Curve (goes down smoothly and stays constant at bottom) */}
                      <path 
                        d="M 10 20 C 100 20, 160 85, 290 85" 
                        fill="none" 
                        stroke="#22c55e" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeShadow="0 4px 6px rgba(0,0,0,0.1)"
                      />

                      {/* Labels placed over paths */}
                      <circle cx="10" cy="20" r="4.5" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
                      
                      {/* End point for DietView */}
                      <circle cx="290" cy="85" r="4.5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />

                    </svg>

                    {/* Floating pill overlays */}
                    <div className="absolute right-2 top-0.5 bg-rose-50 text-rose-600 text-[8px] font-bold py-0.5 px-2 rounded-full shadow border border-rose-100">
                      Traditional diet
                    </div>

                    <div className="absolute bottom-5 right-2 bg-emerald-500 text-white text-[8px] font-bold py-0.5 px-2 rounded-full shadow-sm">
                      ✨ DietView Weight
                    </div>
                  </div>

                  {/* Caption line */}
                  <div className="bg-white dark:bg-zinc-850 p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-850/80 mt-2 flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <p className="text-[11px] leading-relaxed font-semibold text-zinc-600 dark:text-zinc-300">
                      <span className="text-green-600 dark:text-green-500 font-extrabold">80% of DietView users</span> maintain their target weight even 6 months later.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 10: Confirm Account Plan */}
            {step === 10 && (
              <div className="flex flex-col text-center" id="onboarding-screen-10">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight mb-4">
                  Account Plan Ready
                </h2>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 max-w-xs mx-auto mb-8 font-medium">
                  We've successfully customized your profile targets. Your local database is configured and ready.
                </p>

                <div className="flex flex-col gap-4 max-w-sm mx-auto w-full" id="auth-buttons-container">
                  <button 
                    onClick={nextStep}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-extrabold py-3.5 rounded-full flex items-center justify-center gap-3 shadow transition-transform active:scale-[0.98] cursor-pointer"
                    id="confirm-plan-btn"
                  >
                    Activate Profile
                  </button>
                </div>

                <div className="mt-8 text-[11px] text-zinc-400 max-w-[240px] mx-auto font-medium leading-relaxed">
                  DietView secures all logs locally in your browser. No registration required.
                </div>
              </div>
            )}

            {/* Step 11: Setup Checklist Percentage loader state screen */}
            {step === 11 && (
              <div className="flex flex-col text-center" id="onboarding-screen-11">
                {/* Dynamically increases up to 100 with BMR formulas */}
                <h1 className="text-6xl font-black text-zinc-900 dark:text-white font-sans tracking-tighter">
                  {setupChecklistProgress}%
                </h1>
                
                <h3 className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100 mt-4">
                  We're setting everything up for you
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1 mb-8 animate-pulse">
                  Applying BMR formula...
                </p>

                {/* Animated check off lists */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 rounded-3xl p-5 max-w-sm mx-auto w-full flex flex-col gap-3.5 text-left" id="onboarding-formula-checklist">
                  <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    Daily diet recommendation for
                  </span>

                  {[
                    { id: "Calories", title: "Calories" },
                    { id: "Carbs", title: "Carbs" },
                    { id: "Protein", title: "Protein" },
                    { id: "Fats", title: "Fats" },
                    { id: "Health score", title: "Health score" }
                  ].map((x) => {
                    const isChecked = checkedItems.includes(x.id);
                    return (
                      <div key={x.id} className="flex justify-between items-center py-0.5">
                        <span className={`text-xs font-bold ${isChecked ? 'text-zinc-850 dark:text-white' : 'text-zinc-400'}`}>
                          • {x.title}
                        </span>
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-bounce">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-zinc-200 dark:border-zinc-700"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Continue becomes available once 100% loaded */}
                <div className="mt-8">
                  {setupChecklistProgress >= 100 ? (
                    <button 
                      onClick={nextStep}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3 px-6 rounded-full animate-bounce cursor-pointer"
                    >
                      Process Completed! Continue &rarr;
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-450 uppercase tracking-wider font-semibold">Running local algorithms...</span>
                  )}
                </div>
              </div>
            )}

            {/* Step 12: Rollover extra calories? Input checklist card */}
            {step === 12 && (
              <div className="flex flex-col" id="onboarding-screen-12">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight text-center">
                  Rollover extra <br />calories to the next day?
                </h2>
                
                <div className="flex justify-center my-3.5">
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-100 dark:bg-orange-950/40 border border-orange-500/10 px-3 py-1 rounded-full">
                    Rollover up to 200 cals
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 my-4" id="rollover-preview-grid">
                  {/* Yesterday indicator card */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 w-1/2 shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden">
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full uppercase w-max tracking-wide">
                      Yesterday
                    </span>
                    <div className="text-center my-2">
                      <span className="text-lg font-black block">350<span className="text-xs text-zinc-400">/500</span></span>
                      <span className="text-[9px] text-zinc-450 uppercase block font-bold">cals kept</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1.5 text-center text-[9px] font-mono leading-none font-bold">
                      Cals left: 150
                    </div>
                  </div>

                  {/* Today increment indicators card */}
                  <div className="bg-white dark:bg-zinc-900 border-2 border-orange-400 rounded-2xl p-4 w-1/2 shadow-md flex flex-col justify-between aspect-square relative">
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full uppercase w-max tracking-wide">
                      Today
                    </span>
                    <div className="text-center my-2">
                      <span className="text-lg font-black block text-orange-500">350<span className="text-xs text-zinc-400">/650</span></span>
                      <span className="text-[8px] bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        🔄 +150 Added
                      </span>
                    </div>
                    <div className="bg-orange-500 text-white rounded-lg p-1.5 text-center text-[8px] font-mono leading-none font-bold">
                      Total: 150 + 150
                    </div>
                  </div>
                </div>

                {/* Yes No buttons selection overlay bottom as in reference image */}
                <div className="grid grid-cols-2 gap-4.5 mt-4" id="rollover-decision">
                  <button 
                    onClick={nextStep}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-extrabold text-sm py-3 px-5 rounded-full transition-transform active:scale-95 cursor-pointer text-center"
                  >
                    No
                  </button>
                  <button 
                    onClick={nextStep}
                    className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-extrabold text-sm py-3 px-5 rounded-full transition-transform active:scale-95 cursor-pointer text-center"
                  >
                    Yes
                  </button>
                </div>
              </div>
            )}

            {/* Step 13: Add calories burned? Runner graphic screen */}
            {step === 13 && (
              <div className="flex flex-col" id="onboarding-screen-13">
                <h2 className="text-2.5xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight text-center mb-5">
                  Add calories burned <br />back to your daily goal?
                </h2>

                {/* Simulated athlete wallpaper layout */}
                <div className="relative rounded-3xl h-52 overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow shadow-inner" id="runner-graphics-banner">
                  <div 
                    className="absolute inset-0 bg-cover bg-center brightness-90 grayscale" 
                    style={{ 
                      backgroundImage: `url("https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&q=80")` 
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Overlay pill block */}
                  <div className="absolute bottom-4 left-4 bg-white/95 text-zinc-950 p-3.5 rounded-2xl shadow-lg border border-white/20 w-44" id="overlay-runner-capsule">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Today's goal</span>
                    <span className="text-sm font-bold flex items-center gap-1.5 text-zinc-900 mt-1">
                      🔥 500 Cals
                    </span>
                    <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-bold text-zinc-500">
                      <span>Running</span>
                      <span className="text-green-600 font-extrabold">+100 cals</span>
                    </div>
                  </div>
                </div>

                {/* Yes No buttons decision bar */}
                <div className="grid grid-cols-2 gap-4.5 mt-6" id="runner-decision">
                  <button 
                    onClick={nextStep}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-extrabold text-sm py-3 px-5 rounded-full cursor-pointer text-center active:scale-95"
                  >
                    No
                  </button>
                  <button 
                    onClick={nextStep}
                    className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-extrabold text-sm py-3 px-5 rounded-full cursor-pointer text-center active:scale-95"
                  >
                    Yes
                  </button>
                </div>
              </div>
            )}

            {/* Step 14: Reach your goals with notifications widget dialog box */}
            {step === 14 && (
              <div className="flex flex-col text-center" id="onboarding-screen-14">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight mb-5">
                  Reach your goals <br />with notifications
                </h2>

                <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 max-w-sm mx-auto w-full my-4 relative" id="simulated-alert-wrapper">
                  
                  {/* Realistic iOS Alerts popup dialogue card */}
                  <div className="bg-white text-zinc-950 rounded-2xl p-4.5 max-w-[260px] mx-auto shadow-2xl border border-zinc-100 flex flex-col items-center" id="ios-notifications-dialog-mockup">
                    <span className="text-lg mb-1 block">🔔</span>
                    <h4 className="text-xs font-black text-center leading-tight">
                      DietView would like to <br />send you Notifications
                    </h4>
                    <p className="text-[9px] text-zinc-400 text-center leading-normal mt-1 border-b border-zinc-150 pb-3">
                      Notifications can include alerts, sound, and calorie logs updates.
                    </p>

                    <div className="grid grid-cols-2 w-full pt-1.5" id="alert-interactive-options">
                      <button 
                        onClick={nextStep}
                        className="py-1 text-[11px] font-bold text-zinc-500 hover:opacity-85 text-center cursor-pointer border-none bg-transparent"
                      >
                        Don't Allow
                      </button>
                      
                      <button 
                        onClick={nextStep}
                        className="py-1 text-[11px] font-black text-blue-600 hover:opacity-85 text-center cursor-pointer border-none bg-transparent flex items-center justify-center gap-1"
                      >
                        Allow
                      </button>
                    </div>
                  </div>

                  {/* Animated pointing hand highlight graphic icon mimicking screenshot */}
                  <div className="absolute bottom-2 right-12 animate-pulse" id="hand-pointer-highlight">
                    <span className="text-4xl text-amber-500 inline-block pointer-events-none transform -rotate-12 translate-y-2">
                      👆
                    </span>
                  </div>
                </div>

                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-4">
                  Used for meal log reminders and macro progress highlights
                </div>
              </div>
            )}

            {/* Step 15: Give us rating mockup screen */}
            {step === 15 && (
              <div className="flex flex-col text-center" id="onboarding-screen-15">
                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight mb-4">
                  Give us rating
                </h2>

                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded-3xl p-6 shadow-sm max-w-sm mx-auto w-full my-3" id="rating-graphics-box">
                  
                  {/* Rating stars layout badge */}
                  <div className="flex flex-col items-center gap-1.5 mb-5">
                    <div className="bg-orange-500 text-white text-[11px] font-extrabold py-1 px-3 rounded-full flex items-center gap-1">
                      <span>4.8</span>
                      <div className="flex text-amber-300">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-current stroke-none" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-450 uppercase tracking-widest mt-1">
                      100K+ App Ratings
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-850 dark:text-white leading-tight">
                    DietView was made for <br />people like you
                  </h3>

                  {/* Avatars circles rows */}
                  <div className="flex justify-center -space-x-2 my-4">
                    <img className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-900 object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Sarah" />
                    <img className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Alex" />
                    <img className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Mia" />
                  </div>

                  {/* Simulated App Store rating card */}
                  <div className="bg-white text-zinc-950 p-4.5 rounded-2xl border border-zinc-100 shadow text-left" id="playstore-rating-dialog-mockup">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-8.5 h-8.5 select-none shrink-0" id="rating-dialog-logo-graphics">
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
                        <h4 className="text-[11px] font-extrabold leading-tight">DietView - Calorie Tracker</h4>
                        <span className="text-[9px] text-zinc-400 leading-none">Calorie Logs & Metrics</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 my-3 text-zinc-250 border-t border-zinc-100 pt-3 justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 text-[10px] font-bold text-zinc-500">
                      <button onClick={nextStep} className="hover:text-zinc-950 cursor-pointer border-none bg-transparent font-bold">Not now</button>
                      <button onClick={nextStep} className="text-orange-500 hover:opacity-80 font-black cursor-pointer border-none bg-transparent">Submit</button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Step 16: Thank you for trusting us high five view */}
            {step === 16 && (
              <div className="flex flex-col text-center" id="onboarding-screen-16">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <span className="text-4xl">🙌</span>
                </div>

                <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight mb-2">
                  Thank you for <br />trusting us!
                </h2>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 max-w-xs mx-auto mb-7 font-medium">
                  Your customized weight plan is ready! Let's view your dashboard.
                </p>

                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-[28px] p-5 border border-zinc-200/50 dark:border-zinc-800 max-w-sm mx-auto w-full text-left" id="final-summary-highlights">
                  <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase block mb-3.5">
                    Your Configured Snapshot
                  </span>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold leading-normal">
                      <span className="text-zinc-450">Active Goal</span>
                      <span className="text-zinc-800 dark:text-zinc-100">{goal === "Maintain" ? "🎯 Maintain Weight" : goal}</span>
                    </div>

                    <div className="flex justify-between text-xs font-bold leading-normal">
                      <span className="text-zinc-450">Diet Filter</span>
                      <span className="text-zinc-800 dark:text-zinc-100">🌿 {diet}</span>
                    </div>

                    <div className="flex justify-between text-xs font-bold leading-normal">
                      <span className="text-zinc-450">Targets tuned</span>
                      <span className="text-zinc-800 dark:text-zinc-100">⏱️ Active (Calibrated)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Elegant Bottom Call to action buttons row */}
      <footer className="w-full max-w-md mx-auto pt-4 pb-2 border-t border-zinc-200/50 dark:border-zinc-800/60" id="onboarding-persistent-footer">
        {step === 0 ? (
          <button 
            onClick={nextStep}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold text-sm py-4 px-6 rounded-2xl shadow-[0_4px_12px_rgba(249,115,22,0.15)] hover:shadow-[0_4px_16px_rgba(249,115,22,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            id="onboarding-get-started-trigger-btn"
          >
            Get Started
            <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
        ) : step === 10 ? (
          /* Skip and Sign in button handled directly inline on page 10 */
          <div className="flex items-center justify-between gap-2 text-center text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mx-auto">
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Offline-first local cache backup secured
          </div>
        ) : step === 11 ? (
          /* checklist continues automatically once 100% is simulated */
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-widest py-2">
            <Activity className="w-3.5 h-3.5 text-orange-500 animate-spin" />
            Generating dynamic dashboard metrics
          </div>
        ) : (
          <button 
            onClick={nextStep}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold text-sm py-4 px-6 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            id="onboarding-continue-slide-btn"
          >
            Continue
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}

        {/* Footer info text if not page zero */}
        {step > 0 && (
          <div className="text-center text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mt-3.5 flex items-center justify-center gap-1.5" id="onboarding-footer-badge">
            <Shield className="w-3 h-3 text-emerald-500" />
            Offline-First Local Cache Backup Secure
          </div>
        )}
      </footer>

    </div>
  );
}
