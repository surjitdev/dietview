import React, { useState } from "react";
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
  Loader
} from "lucide-react";
import { UserProfile, MealRecommendation, MealDetail } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AIAdvisorProps {
  user: UserProfile;
  onLogBatchMeals: (meals: MealDetail[]) => void;
}

export default function AIAdvisor({ user, onLogBatchMeals }: AIAdvisorProps) {
  // Goal parameters states
  const [goal, setGoal] = useState("Lose fat & maintain lean tone");
  const [dietaryPreference, setDietaryPreference] = useState(user.dietaryPreference || "No Restrictions");
  const [age, setAge] = useState(user.age.toString());
  const [weight, setWeight] = useState(user.weight.toString());
  const [height, setHeight] = useState(user.height.toString());

  // Recommendation return state
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<MealRecommendation | null>(null);
  const [batchLogged, setBatchLogged] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
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
          height: parseInt(height) || 165
        })
      });
      const data = await resp.json();
      setRecommendation(data);
    } catch (err) {
      console.error("AI Advisor generation error:", err);
    } finally {
      setIsLoading(false);
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
      <div id="ai-header">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">AI Weight Plan & Recipes</h2>
        <p className="text-xs text-on-surface-variant font-medium">
          Get custom meal ideas and deficit parameters matching your profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="ai-advisor-container">
        {/* Param Setup Column */}
        <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 md:col-span-1" id="ai-planner-form">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-4">
            <Activity className="w-4 h-4" /> Personal Metrics
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Your Goal</label>
              <select 
                className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="Lose progressive fat (deficit focus)">Lose weight</option>
                <option value="Standard weight maintenance & vitality">Maintain weight</option>
                <option value="Build lean muscular hypertrophy">Build muscle</option>
                <option value="Peak athletic performance tone">Athletic training</option>
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
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Low-Carb / Keto">Keto / Low-Carb</option>
                <option value="Paleo / Whole Foods">Paleo</option>
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
    </div>
  );
}
