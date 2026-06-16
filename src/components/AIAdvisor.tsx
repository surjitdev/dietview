import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  Activity, 
  ChevronRight, 
  Check, 
  UtensilsCrossed, 
  Egg, 
  Flame, 
  ShieldAlert,
  ListPlus,
  Loader,
  Crown,
  Lock,
  CreditCard,
  Star,
  X,
  Plus,
  MessageSquare,
  Send,
  Bot,
  Trash2,
  Apple,
  Citrus
} from "lucide-react";
import { UserProfile, MealRecommendation, MealDetail } from "../types";
import { motion, AnimatePresence } from "motion/react";
import PricingModal from "./PricingModal";
import Markdown from "react-markdown";

interface AIAdvisorProps {
  user: UserProfile;
  onLogBatchMeals: (meals: MealDetail[]) => void;
  onAddFoodLog: (foodName: string, cal: number, protein: number, carbs: number, fats: number, mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack") => void;
  onUpdateUser: (newUserProfile: UserProfile) => void;
  launchEventMode: boolean;
}

export default function AIAdvisor({ user, onLogBatchMeals, onAddFoodLog, onUpdateUser, launchEventMode }: AIAdvisorProps) {
  const isPremiumUser = user.isPremium === true || 
    (user.trialActive === true && user.trialStartDate && 
     (Date.now() - new Date(user.trialStartDate).getTime() < 3 * 24 * 60 * 60 * 1000));

  // Sub-tab toggler: "meals" (standard planner), "fridge" (leftovers companion), or "digest" (Digestion Simulator)
  const [subTab, setSubTab] = useState<"meals" | "fridge" | "digest">("meals");

  // AI Digestion Simulator state variables
  const [digestMealName, setDigestMealName] = useState("Cheese Garlic Sourdough & Chocolate Shake");
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestResult, setDigestResult] = useState<{
    mealName: string;
    digestionTimeHrs: number;
    stomachBreakdownMin: number;
    glycemicSpikeScore: number;
    acidLoadType: string;
    bioxRatePct: number;
    pairings: { title: string; tip: string; benefit: string }[];
    insights: string[];
    metabolicHeatMap: string;
  } | null>(null);

  // AI Fridge Chef state variables
  const [fridgeIngredients, setFridgeIngredients] = useState("");
  const [fridgeMealType, setFridgeMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Lunch");
  const [fridgeTargetCalories, setFridgeTargetCalories] = useState("400");
  const [fridgeIsLoading, setFridgeIsLoading] = useState(false);
  const [fridgeRecipe, setFridgeRecipe] = useState<{
    title: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    prepTime: string;
    difficulty: string;
    ingredientsList: string[];
    instructions: string[];
    chefTip?: string;
  } | null>(null);
  const [fridgeSuccessLogged, setFridgeSuccessLogged] = useState(false);

  // Goal parameters states
  const [goal, setGoal] = useState("Lose fat & maintain lean tone");
  const [dietaryPreference, setDietaryPreference] = useState(user.dietaryPreference || "No Restrictions");
  const [age, setAge] = useState(user.age.toString());
  const [weight, setWeight] = useState(user.weight.toString());
  const [height, setHeight] = useState(user.height.toString());

  // Freemium states
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCheckout, setShowCheckout] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(4.99);

  const handleActivateTrial = () => {
    onUpdateUser({
      ...user,
      trialActive: true,
      trialStartDate: new Date().toISOString(),
      isPremium: false
    });
    setShowPaywall(false);
  };

  const handleSimulateDigestion = (e: React.FormEvent) => {
    e.preventDefault();
    setDigestLoading(true);
    
    setTimeout(() => {
      const name = digestMealName.toLowerCase();
      let hrs = 3.2;
      let stomachMin = 80;
      let glycemic = 55;
      let acidType = "Neutral";
      let biox = 78;
      let items: { title: string; tip: string; benefit: string }[] = [];
      let feed: string[] = [];
      let level = "Normal Metabolic Heat";

      if (name.includes("pizza") || name.includes("burger") || name.includes("fast") || name.includes("shake") || name.includes("fry") || name.includes("coke") || name.includes("cola") || name.includes("sweet") || name.includes("cake") || name.includes("fries")) {
        hrs = 5.2;
        stomachMin = 180;
        glycemic = 88;
        acidType = "High Acidic";
        biox = 45;
        items = [
          { title: "🍋 Apple Cider Acid Regulator", tip: "Sip 1 tbsp vinegar in a glass of ambient water before eating", benefit: "Spike dampener: flattens the immediate insulin release spike by 30%" },
          { title: "🍵 Bio-Active Chamomile Mint Brew", tip: "Drink a warm infusion 35 minutes after finishing", benefit: "Motility trigger: supports gastric contractions to prevent standard post-pizza bloat" },
          { title: "🏃 10-Min Steady Pacing Walk", tip: "Take a light, unhurried walk right after dining", benefit: "Insulin-free clearance: active muscles utilize circulating sugars instantly" }
        ];
        feed = [
          "Gastric transit is delayed by 2.1x due to dense emulsified dairy lipids shielding refined flour starches from stomach pepsin.",
          "High glycemic surge of fast-acting glucose causes standard pancreas insulin secretion peaks within 45 minutes.",
          "Digestive core temperature spikes (TEF process) as liver and gallbladder release concentrated bile secretions to process dense peptide bonds."
        ];
        level = "Elevated Thermal State (High Strain)";
      } else if (name.includes("salad") || name.includes("avocado") || name.includes("veg") || name.includes("protein") || name.includes("egg") || name.includes("tofu") || name.includes("sprout") || name.includes("lentil") || name.includes("paneer") || name.includes("salmon") || name.includes("fish") || name.includes("chicken")) {
        hrs = 2.2;
        stomachMin = 45;
        glycemic = 28;
        acidType = "Mild Alkaline";
        biox = 94;
        items = [
          { title: "💧 Mineralized Celtic Sea Salt Wedge", tip: "Sip clean water containing trace electrolytes", benefit: "Gastric ease: triggers smooth muscle transit in intestinal tract segments" },
          { title: "🌿 Greek Flora Lactobacillus Seed", tip: "Spoon 2 tbsp raw curd / yogurt or sauerkraut as a base", benefit: "Microbiome optimization: inoculates key gut branches for faster vitamin absorption" }
        ];
        feed = [
          "Raw plant fibers build a supportive botanical grid in the stomach, regulating glucose release and maintaining metabolic balance.",
          "Maximum bioavailability achieved: key micronutrients absorb instantly via the highly active small intestinal brush border.",
          "Stomach acid operates at perfect equilibrium (pH 1.8), resulting in effortless peptide breakdown and optimal digestive comfort."
        ];
        level = "Perfect Homeostatis (Zero Strain)";
      } else {
        hrs = 3.4;
        stomachMin = 90;
        glycemic = 52;
        acidType = "Balanced Neutral";
        biox = 76;
        items = [
          { title: "💧 Dry-Eating Timing Adjustment", tip: "Avoid liquids during meals; drink 200ml lukewarm water 30 mins after", benefit: "Acid preservation: prevents dilution of active digestive enzymes" },
          { title: "🍊 Citrus Vitamin-C Activation", tip: "Squeeze a lime wedge over your meal prior to eating", benefit: "Mineral booster: dramatically enhances iron and zinc bioavailability" }
        ];
        feed = [
          "Standard balanced transit rates are estimated through the duodenum with normal gastric clearing.",
          "Insulin response is light and steady, reaching basic baseline within 120 minutes with zero metabolic crashes.",
          "Balanced gut motility minimizes excess fermentation or standard lower intestinal bloating patterns."
        ];
        level = "Optimized Normal State";
      }

      setDigestResult({
        mealName: digestMealName,
        digestionTimeHrs: hrs,
        stomachBreakdownMin: stomachMin,
        glycemicSpikeScore: glycemic,
        acidLoadType: acidType,
        bioxRatePct: biox,
        pairings: items,
        insights: feed,
        metabolicHeatMap: level
      });
      setDigestLoading(false);
    }, 1200);
  };

  // Recommendation return state
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<MealRecommendation | null>(null);
  const [batchLogged, setBatchLogged] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the current goal or dietary preference contains a premium badge symbol
    const isMedicalPlan = goal.includes("👑") || dietaryPreference.includes("👑");
    const isLaunchCampaignActive = launchEventMode === true;
    const hasExceededFreeQuota = (user.aiGenerationsCount || 0) >= 2;

    // Trigger premium checkout when free event is offline and user is free limit or selected advanced medical plans
    if (!isPremiumUser && !isLaunchCampaignActive) {
      if (isMedicalPlan || hasExceededFreeQuota) {
        setShowPaywall(true);
        return;
      }
    }

    setIsLoading(true);
    setRecommendation(null);
    setBatchLogged(false);

    try {
      const resp = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          dietaryPreference,
          age: parseInt(age) || 28,
          weight: parseInt(weight) || 68,
          height: parseInt(height) || 165,
          country: user.country || "India"
        })
      });
      const data = await resp.json();
      setRecommendation(data);

      onUpdateUser({
        ...user,
        aiGenerationsCount: (user.aiGenerationsCount || 0) + 1
      });
    } catch (err) {
      console.error("AI Advisor generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFridgeChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fridgeIngredients.trim()) return;

    const isLaunchCampaignActive = launchEventMode === true;
    const hasExceededFreeQuota = (user.aiGenerationsCount || 0) >= 3; // Accommodate additional test queries!

    if (!isPremiumUser && !isLaunchCampaignActive && hasExceededFreeQuota) {
      setShowPaywall(true);
      return;
    }

    setFridgeIsLoading(true);
    setFridgeRecipe(null);
    setFridgeSuccessLogged(false);

    try {
      const resp = await fetch("/api/fridge-chef", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: fridgeIngredients,
          dietaryPreference,
          mealType: fridgeMealType,
          targetCalories: parseInt(fridgeTargetCalories) || 400
        })
      });
      const data = await resp.json();
      setFridgeRecipe(data);

      onUpdateUser({
        ...user,
        aiGenerationsCount: (user.aiGenerationsCount || 0) + 1
      });
    } catch (err) {
      console.error("AI Fridge Chef generation error:", err);
    } finally {
      setFridgeIsLoading(false);
    }
  };

  const handleLogFridgeRecipe = () => {
    if (fridgeRecipe) {
      onAddFoodLog(
        fridgeRecipe.title,
        fridgeRecipe.calories,
        fridgeRecipe.protein,
        fridgeRecipe.carbs,
        fridgeRecipe.fats,
        fridgeMealType
      );
      setFridgeSuccessLogged(true);
    }
  };

  const handleBatchLog = () => {
    if (recommendation) {
      onLogBatchMeals(recommendation.meals);
      setBatchLogged(true);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="ai-advisor-tab-view">
      <div id="ai-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface card-elevation-1 p-5 rounded-2xl border border-outline-variant/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-on-surface flex items-center gap-1.5">AI Weight Plan & Recipes</h2>
            {isPremiumUser ? (
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500 fill-amber-500/20" /> PRO ACTIVE {user.trialActive && "(TRIAL)"}
              </span>
            ) : (
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer" onClick={() => setShowPaywall(true)}>
                ⚡ FREE PLAN ({user.aiGenerationsCount || 0}/2 Logs)
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Get custom meal ideas and deficit parameters matching your profile details.
          </p>
        </div>

        {!isPremiumUser && (
          <div className="flex gap-2 self-start sm:self-auto items-center">
            <button 
              type="button"
              onClick={() => {
                setFinalPrice(4.99);
                setCouponApplied(false);
                setCouponCode("");
                setShowPaywall(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[9.5px] uppercase tracking-wide px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-[0_4px_12px_rgba(245,158,11,0.15)] active:scale-95 cursor-pointer"
            >
              👑 Go Premium
            </button>
          </div>
        )}
      </div>

      {/* Mini Segment Selector */}
      <div className="flex bg-surface-container-low border border-outline-variant/20 p-1 rounded-xl max-w-sm" id="ai-sub-tab-selector">
        <button
          type="button"
          onClick={() => setSubTab("meals")}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            subTab === "meals"
              ? "bg-primary text-on-primary shadow"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          🍛 Planner
        </button>
        <button
          type="button"
          onClick={() => setSubTab("fridge")}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            subTab === "fridge"
              ? "bg-primary text-on-primary shadow"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          🍳 Chef
        </button>
        <button
          type="button"
          onClick={() => setSubTab("digest")}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            subTab === "digest"
              ? "bg-primary text-on-primary shadow"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          🔋 Digest
        </button>
      </div>

      {subTab === "meals" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="ai-advisor-container">
          {/* Param Setup Column */}
          <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 md:col-span-1" id="ai-planner-form">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-4">
              <Activity className="w-4 h-4" /> Personal Metrics
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-3.5">
              <div className="bg-primary/5 px-3 py-2.5 rounded-xl border border-primary/10 flex items-center justify-between text-[11px]" id="advisor-cuisine-type-badge">
                <span className="font-black text-on-surface-variant uppercase tracking-wider text-[8px]">Active Diet Style:</span>
                <span className="font-extrabold text-primary flex items-center gap-1">
                  {user.country === "India" ? "🇮🇳 India (Local)" :
                   user.country === "Japan" ? "🇯🇵 Japan (Local)" :
                   user.country === "Mexico" ? "🇲🇽 Mexico (Local)" :
                   user.country === "Italy" ? "🇮🇹 Italy (Local)" :
                   user.country === "USA" ? "🇺🇸 USA (Local)" :
                   user.country === "France" ? "🇫🇷 France (Local)" :
                   user.country === "Middle East" ? "🇱🇧 Middle East (Local)" : "🇮🇳 India (Local)"}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Your Goal</label>
                <select 
                  className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option value="Lose weight & optimize metabolism">Lose weight</option>
                  <option value="Maintain weight & vitality">Maintain weight</option>
                  <option value="Build lean muscular hypertrophy">Build muscle</option>
                  <option value="Diabetic Meal Plan (Glucose Stable Control) 👑">Diabetic Meal Plan (Glucose Stable) 👑</option>
                  <option value="Heart-Healthy Meal Plan (Low-Sodium/BP Control) 👑">Heart-Healthy Plan (Hypertension Control) 👑</option>
                  <option value="Renal-Safe Meal Plan (Kidney Metabolic Care) 👑">Renal-Safe Plan (Kidney Care) 👑</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Dietary Restrictions</label>
                <select 
                  className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                >
                  <option value="No Restrictions">No Restrictions</option>
                  <option value="Vegetarian/Vegan friendly options">Vegetarian / Vegan</option>
                  <option value="Gluten-Free certified options">Gluten-Free</option>
                  <option value="Low-Carb Indian & Regional Keto splits 👑">Keto / Low-Carb Regional 👑</option>
                  <option value="High-Protein Premium Macro calibration 👑">High Protein Premium 👑</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Age</label>
                  <input 
                    type="number" 
                    value={age}
                    required
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-2.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={weight}
                    required
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-2.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Height (cm)</label>
                  <input 
                    type="number" 
                    value={height}
                    required
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-2.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-2.5 bg-primary text-on-primary font-semibold text-xs py-3 px-5 rounded-lg flex items-center justify-center gap-2 active:scale-95 shadow cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Compute AI Meal Plan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Screen Column */}
          <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 md:col-span-2 flex flex-col justify-between" id="ai-planner-results">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                  id="ai-loading-panel"
                >
                  <Loader className="w-10 h-10 text-on-surface animate-spin stroke-[1.5] mb-4" />
                  <h4 className="text-md font-semibold text-on-surface">Assembling Metabolic Blueprints...</h4>
                  <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm">
                    Calculating exact protein targets, food compositions, and recipe frameworks tailored to your profile.
                  </p>
                </motion.div>
              )}

              {!isLoading && !recommendation && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                  id="ai-idle-panel"
                >
                  <UtensilsCrossed className="w-14 h-14 text-on-surface-variant stroke-[1.2] mb-3" />
                  <h4 className="text-md font-bold text-on-surface">No plan generated yet</h4>
                  <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs leading-relaxed">
                    Enter your stats on the left panel (Goal, Restrictions, age, weight, height) and submit to synthesize your clean recipe plan.
                  </p>
                </motion.div>
              )}

              {!isLoading && recommendation && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-5 text-left"
                  id="ai-results-loaded"
                >
                  {/* Micro scientific rationale card */}
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Scientific Rationale & Tips
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed">{recommendation.rationale}</p>
                  </div>

                  {/* Macro Target Recommendations */}
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2.5">Suggested Target Allocation</span>
                    <div className="grid grid-cols-4 gap-2.5">
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-error uppercase">Calories</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{recommendation.suggestedCalories} kcal</span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-secondary uppercase">Protein</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{recommendation.suggestedProtein}g</span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-tertiary uppercase">Carbs</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{recommendation.suggestedCarbs}g</span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-outline uppercase">Fats</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{recommendation.suggestedFats}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Meals and Recipes Cards */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Recommended Recipe Deck</span>
                      
                      {!batchLogged ? (
                        <button 
                          onClick={handleBatchLog}
                          className="bg-primary/10 hover:bg-primary hover:text-white text-primary text-[10px] font-extrabold py-1.5 px-3 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <ListPlus className="w-3.5 h-3.5" /> Log All To Ledger
                        </button>
                      ) : (
                        <span className="text-[10px] bg-primary-container/20 text-primary px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Meals Batch Logged
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="ai-recipes-deck">
                      {recommendation.meals.map((meal, index) => (
                        <div 
                          key={index}
                          className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">{meal.mealType}</span>
                              <span className="text-xs font-semibold text-primary">{meal.calories} kcal</span>
                            </div>
                            <h5 className="text-xs font-bold text-on-surface leading-snug">{meal.title}</h5>
                            
                            <div className="mt-3">
                              <span className="text-[8px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Key macro counts</span>
                              <div className="flex gap-2.5 text-[10px] font-bold">
                                <span className="text-secondary">P: {meal.protein}g</span>
                                <span className="text-tertiary">C: {meal.carbs}g</span>
                                <span className="text-outline">F: {meal.fats}g</span>
                              </div>
                            </div>
                          </div>

                          {meal.ingredients && meal.ingredients.length > 0 && (
                            <div className="mt-3.5 border-t border-outline-variant/10 pt-2 text-[9px] text-on-surface-variant">
                              <span className="font-bold text-on-surface block mb-1">Ingredients:</span>
                              <p className="line-clamp-2">{meal.ingredients.join(", ")}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {subTab === "fridge" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="ai-fridge-chef-viewport">
          {/* Param Setup Column */}
          <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 md:col-span-1" id="fridge-setup-column">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-4">
              <Egg className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Leftover Sauté
            </div>

            <form onSubmit={handleGenerateFridgeChef} className="flex flex-col gap-3.5">
              <div className="relative" id="fridge-ingredients-textarea-wrapper">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant flex items-center gap-1.5 mb-1.5">
                  <Apple className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10 animate-pulse" />
                  Leftover Ingredients
                </label>
                <div className="relative">
                  <textarea
                    value={fridgeIngredients}
                    onChange={(e) => setFridgeIngredients(e.target.value)}
                    required
                    rows={3}
                    placeholder="e.g. 2 eggs, broccoli, cherry tomatoes, soy sauce, a bit of chicken"
                    className="w-full text-xs font-semibold bg-surface-container pl-3.5 pr-10 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/40"
                  />
                  <div className="absolute right-3.5 bottom-3 text-orange-500/30 dark:text-orange-400/20 max-w-[20px] max-h-[20px] pointer-events-none select-none">
                    <Citrus className="w-5 h-5 animate-spin-slow" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Target Meal Type</label>
                <select
                  className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  value={fridgeMealType}
                  onChange={(e) => setFridgeMealType(e.target.value as any)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5 flex justify-between items-center">
                  <span>Maximum Calories</span>
                  <span className="text-primary font-bold text-xs">{fridgeTargetCalories} kcal</span>
                </label>
                <input
                  type="range"
                  min="150"
                  max="900"
                  step="25"
                  value={fridgeTargetCalories}
                  onChange={(e) => setFridgeTargetCalories(e.target.value)}
                  className="w-full accent-primary mt-1"
                />
                <div className="flex justify-between text-[9px] text-on-surface-variant/50 font-bold mt-1">
                  <span>150 kcal</span>
                  <span>500 kcal</span>
                  <span>900 kcal</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={fridgeIsLoading || !fridgeIngredients.trim()}
                className="w-full mt-2.5 bg-primary text-on-primary font-semibold text-xs py-3 px-5 rounded-lg flex items-center justify-center gap-2 active:scale-95 shadow cursor-pointer transition-all disabled:opacity-50"
              >
                {fridgeIsLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Cooking recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Sauté with AI Fridge Chef
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Screen Column */}
          <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 md:col-span-2 flex flex-col justify-between p-6" id="fridge-results-column">
            <AnimatePresence mode="wait">
              {fridgeIsLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <Loader className="w-10 h-10 text-on-surface animate-spin stroke-[1.5] mb-4" />
                  <h4 className="text-md font-semibold text-on-surface">Stirring and Sautéing...</h4>
                  <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm">
                    Diet AI is crafting a chef-grade fit recipe utilizing your exact leftovers and calculating physical macros.
                  </p>
                </motion.div>
              )}

              {!fridgeIsLoading && !fridgeRecipe && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <UtensilsCrossed className="w-14 h-14 text-on-surface-variant stroke-[1.2] mb-3" />
                  <h4 className="text-md font-bold text-on-surface text-center">Your leftovers are full of potential</h4>
                  <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs leading-relaxed text-center">
                    List leftover veggies, proteins, or dressings sitting around on the left panel, and Diet AI will conjure up a nutritious culinary plan.
                  </p>
                </motion.div>
              )}

              {!fridgeIsLoading && fridgeRecipe && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-5 text-left w-full animate-fade-in"
                >
                  {/* Recipe Header Card */}
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full">{fridgeRecipe.difficulty || "Easy"} • {fridgeRecipe.prepTime || "15 Min"} Prep</span>
                      <h3 className="text-md font-black text-on-surface mt-1.5">{fridgeRecipe.title}</h3>
                    </div>
                    
                    {!fridgeSuccessLogged ? (
                      <button
                        onClick={handleLogFridgeRecipe}
                        className="bg-primary hover:bg-opacity-90 text-on-primary text-[10px] font-black uppercase py-2 px-4 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow"
                      >
                        <ListPlus className="w-4 h-4" /> Log Meal
                      </button>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-xl font-black uppercase flex items-center gap-1.5 border border-emerald-500/10">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Added to Journal
                      </span>
                    )}
                  </div>

                  {/* Macro summary breakout */}
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Calculated Macros</span>
                    <div className="grid grid-cols-4 gap-2.5">
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-error uppercase">Calories</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{fridgeRecipe.calories} kcal</span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-secondary uppercase">Protein</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{fridgeRecipe.protein}g</span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-tertiary uppercase">Carbs</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{fridgeRecipe.carbs}g</span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 text-center">
                        <span className="text-[8px] font-bold text-outline uppercase">Fats</span>
                        <span className="block text-sm font-extrabold text-on-surface mt-0.5">{fridgeRecipe.fats}g</span>
                      </div>
                    </div>
                  </div>

                  {/* List elements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Ingredients Checklist */}
                    <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block border-b border-outline-variant/10 pb-1.5">Required Ingredients</span>
                      <ul className="flex flex-col gap-2">
                        {fridgeRecipe.ingredientsList.map((ing, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-semibold text-on-surface">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-primary mt-0.5 rounded cursor-pointer" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Directions list */}
                    <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block border-b border-outline-variant/10 pb-1.5">Preparation Steps</span>
                      <ol className="flex flex-col gap-3">
                        {fridgeRecipe.instructions.map((step, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-on-surface">
                            <span className="bg-primary/10 text-primary font-black text-[10px] p-1 rounded-md min-w-[20px] text-center mt-0.5">{i + 1}</span>
                            <span className="font-semibold leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {fridgeRecipe.chefTip && (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl text-xs flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                      <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[9px] block">AI Chef Advisory Tip</span>
                        <p className="mt-0.5 font-medium leading-relaxed">{fridgeRecipe.chefTip}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {subTab === "digest" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="ai-digest-viewport">
          {/* Left Column: Input Form */}
          <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 md:col-span-1 flex flex-col gap-5" id="digest-setup-column">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-500" /> Metabolic Simulator
            </div>

            <form onSubmit={handleSimulateDigestion} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Enter Meal To Analyze</label>
                <div className="relative">
                  <input
                    type="text"
                    value={digestMealName}
                    onChange={(e) => setDigestMealName(e.target.value)}
                    required
                    placeholder="e.g. Cheese Pizza with soda, or Garden chicken salad"
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
                    id="digest-meal-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={digestLoading}
                className="w-full h-11 bg-primary hover:bg-opacity-90 disabled:bg-primary/50 text-on-primary font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-97 border-none"
              >
                {digestLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Simulating Enzymes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Predict Digestion Peak</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Standard Meal Blueprints</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "🍕 Premium Sourdough Pizza & Cola", val: "Cheese Sourdough Pizza & Cola" },
                  { label: "🥗 Salmon Kale Superfood Salad", val: "Salmon Kale Salad with Avocado & Walnuts" },
                  { label: "🍛 Homemade Dal Rice with Greek Yogurt", val: "Lentil Dal, Brown Rice & Curd" }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDigestMealName(preset.val);
                      setDigestResult(null);
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-outline-variant/10 bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface transition-all flex items-center justify-between cursor-pointer active:scale-98"
                  >
                    <span>{preset.label}</span>
                    <Plus className="w-3.5 h-3.5 text-primary" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-[10.5px] leading-relaxed text-on-surface-variant font-medium">
              ⚡ This simulator calculates gastric motility and glycemic curves by cross-referencing your profile dietary types (<strong>{user.dietaryPreference || "Standard Veg"}</strong>) against the protein-fat-fiber ratios of selected ingredients.
            </div>
          </div>

          {/* Right Column: Dynamic Output Visuals */}
          <div className="md:col-span-2 flex flex-col gap-6" id="digest-output-segment">
            <AnimatePresence mode="wait">
              {!digestResult && !digestLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-surface border border-outline-variant/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[360px] gap-4"
                  id="digest-welcome-preview"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/20 animate-pulse">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-on-surface">Ready for Metabolic Ingress</h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-1 max-w-sm mx-auto leading-relaxed">
                      Enter a meal description or select an authentic pre-set blueprint to generate a detailed simulation of your body's mechanical and chemical digestion pipeline.
                    </p>
                  </div>
                </motion.div>
              )}

              {digestLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-surface border border-outline-variant/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[360px] gap-6"
                  id="digest-loading-preview"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-4 border-solid border-primary border-t-transparent animate-spin" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-center">
                    <h3 className="text-xs font-black text-on-surface uppercase tracking-wider animate-pulse">Analyzing Gastric Cleansers</h3>
                    <p className="text-[11px] text-on-surface-variant font-medium max-w-xs mx-auto leading-relaxed">
                      Computing pyloric valve constriction intervals, amino enzyme splitting rates, and initial insulin secretion velocity...
                    </p>
                  </div>
                </motion.div>
              )}

              {digestResult && !digestLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-5"
                  id="digest-details-panel"
                >
                  {/* Top Header Card */}
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/10 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider inline-block">Metabolic Blueprint Ready</span>
                      <h3 className="text-md font-black text-on-surface mt-2 capitalize">{digestResult.mealName}</h3>
                      <p className="text-xs text-on-surface-variant font-semibold mt-0.5">{digestResult.metabolicHeatMap}</p>
                    </div>

                    <div className="bg-white/80 dark:bg-zinc-950/40 rounded-xl border border-black/5 px-4.5 py-2.5 flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-center">
                      <div className="text-center">
                        <span className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest block">Transit Time</span>
                        <span className="text-lg font-black text-primary">{digestResult.digestionTimeHrs}h</span>
                      </div>
                      <div className="w-px h-8 bg-outline-variant/20" />
                      <div className="text-center">
                        <span className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest block">Enzyme pH</span>
                        <span className="text-lg font-black text-tertiary">{digestResult.acidLoadType === "High Acidic" ? "1.2" : digestResult.acidLoadType === "Mild Alkaline" ? "2.3" : "1.9"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Concentric Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="digest-pulse-matrix">
                    <div className="bg-surface border border-outline-variant/10 rounded-xl p-4 flex flex-col gap-1.5">
                      <span className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest block">Stomach Acid Load</span>
                      <span className="text-sm font-black text-on-surface">{digestResult.acidLoadType}</span>
                      <div className="w-full bg-outline-variant/10 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${digestResult.acidLoadType.includes("Acid") ? "bg-red-500" : "bg-emerald-500"}`}
                          style={{ width: digestResult.acidLoadType.includes("High") ? "85%" : "45%" }}
                        />
                      </div>
                      <span className="text-[9.5px] text-on-surface-variant font-medium mt-0.5">Influences mineral ionization efficiency.</span>
                    </div>

                    <div className="bg-surface border border-outline-variant/10 rounded-xl p-4 flex flex-col gap-1.5">
                      <span className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest block">Stomach Breakdown</span>
                      <span className="text-sm font-black text-on-surface">{digestResult.stomachBreakdownMin} mins</span>
                      <div className="w-full bg-outline-variant/10 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(100, (digestResult.stomachBreakdownMin / 200) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9.5px] text-on-surface-variant font-medium mt-0.5">Duration food stays in stomach churn.</span>
                    </div>

                    <div className="bg-surface border border-outline-variant/10 rounded-xl p-4 flex flex-col gap-1.5">
                      <span className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest block">Bioavailability Coeff.</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{digestResult.bioxRatePct}% BioX</span>
                      <div className="w-full bg-outline-variant/10 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${digestResult.bioxRatePct}%` }}
                        />
                      </div>
                      <span className="text-[9.5px] text-on-surface-variant font-medium mt-0.5">Efficiency of small intestinal absorption.</span>
                    </div>
                  </div>

                  {/* Glycemic Spiking Curve - The AI Visual Piece */}
                  <div className="bg-surface border border-outline-variant/10 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">Estimated Glycemic Spike Index</h4>
                        <span className="text-[10px] text-on-surface-variant font-medium leading-normal">
                          Glucose level tracking across 180 mins post-meal.
                        </span>
                      </div>
                      <div className="bg-primary/5 px-2.5 py-1.5 rounded-xl border border-primary/10 text-right shrink-0">
                        <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest block">Spike Index</span>
                        <span className={`text-md font-black ${digestResult.glycemicSpikeScore > 70 ? "text-rose-500" : "text-emerald-500"}`}>{digestResult.glycemicSpikeScore}/100</span>
                      </div>
                    </div>

                    {/* Highly Crafted SVG Curve */}
                    <div className="bg-zinc-50 dark:bg-zinc-950/40 rounded-xl p-4.5 border border-black/5 dark:border-white/5 relative overflow-hidden" id="blood-glucose-metabolic-wave">
                      <div className="flex items-center justify-between text-[9px] text-on-surface-variant font-black uppercase tracking-wider mb-2">
                        <span>Ingestion (0m)</span>
                        <span>Peak (45m)</span>
                        <span>Absorption (120m)</span>
                        <span>Recovery (180m)</span>
                      </div>

                      <div className="relative">
                        <svg viewBox="0 0 200 85" className="w-full h-24 overflow-visible">
                          {/* Standard high spike wave with smooth pathing */}
                          <path 
                            d="M 5 80 Q 55 10, 105 50 T 195 80" 
                            fill="none" 
                            stroke={digestResult.glycemicSpikeScore > 75 ? "#f43f5e" : "#10b981"} 
                            strokeWidth={digestResult.glycemicSpikeScore > 75 ? "2.5" : "1.5"} 
                          />
                          
                          {/* Optimized reference/flattened wave */}
                          <path 
                            d="M 5 80 Q 55 52, 105 60 T 195 80" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="2" 
                            strokeDasharray="2,3" 
                          />

                          {/* Float visual indicator representing current meal peak status */}
                          <circle cx="58" cy={digestResult.glycemicSpikeScore > 75 ? "22" : "58"} r="4" fill={digestResult.glycemicSpikeScore > 75 ? "#f43f5e" : "#10b981"} className="animate-ping" style={{ transformOrigin: "58px " + (digestResult.glycemicSpikeScore > 75 ? "22" : "58") + "px" }} />
                          <circle cx="58" cy={digestResult.glycemicSpikeScore > 75 ? "22" : "58"} r="3" fill={digestResult.glycemicSpikeScore > 75 ? "#f43f5e" : "#10b981"} />
                        </svg>

                        {/* Reference labels */}
                        <div className="absolute right-2 bottom-2 bg-white/95 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 px-2 py-1 rounded-md text-[8.5px] font-bold text-on-surface-variant flex flex-col gap-0.5">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#f43f5e] rounded-full" /> Current Meal Curve</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#10b981] rounded-full" /> Flat Curve Target</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metabolic Bio-hacks Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface border border-outline-variant/10 rounded-xl p-4 flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block border-b border-outline-variant/10 pb-1.5">Insulin Spiking Bio-Hacks</span>
                      <div className="flex flex-col gap-3">
                        {digestResult.pairings.map((pair, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs shrink-0 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {idx + 1}
                            </div>
                            <div>
                              <h5 className="text-[11px] font-black text-on-surface leading-tight capitalize">{pair.title}</h5>
                              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 leading-normal">{pair.tip}</p>
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold block mt-0.5">➔ {pair.benefit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-surface border border-outline-variant/10 rounded-xl p-4 flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block border-b border-outline-variant/10 pb-1.5">Flora Motility Insights</span>
                      <div className="flex flex-col gap-2.5">
                        {digestResult.insights.map((ins, i) => (
                          <div key={i} className="flex items-start gap-2 text-[10.5px] text-on-surface font-semibold leading-relaxed">
                            <span className="text-primary mt-1 font-black leading-none">•</span>
                            <p>{ins}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}



      {/* FREEMIUM MONETIZATION POPUPS & CHECKOUT SYSTEM */}
      <AnimatePresence>
        <PricingModal 
          isOpen={showPaywall} 
          onClose={() => setShowPaywall(false)} 
          user={user} 
          onUpdateUser={onUpdateUser} 
        />
      </AnimatePresence>
    </div>
  );
}
