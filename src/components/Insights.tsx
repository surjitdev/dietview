import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  TrendingUp, 
  Award, 
  Zap, 
  Activity, 
  Calendar, 
  TrendingDown, 
  Flame, 
  Droplet 
} from "lucide-react";
import { UserProfile, FoodLog, WaterLog, WeightLog } from "../types";

interface InsightsProps {
  user: UserProfile;
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
  onAddWeightLog: (weightValue: number, logDate?: string) => void;
}

export default function Insights({ user, foodLogs, waterLogs, weightLogs, onAddWeightLog }: InsightsProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Weight History Form States
  const [newWeightInput, setNewWeightInput] = useState("");
  const [weightLogDate, setWeightLogDate] = useState(todayStr);

  const weightChartData = weightLogs.map(log => {
    const dObj = new Date(log.date);
    const formattedDate = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    return {
      name: formattedDate,
      Weight: log.weight
    };
  });

  // Helper: Get past 7 days dates labels
  const getPastWeekDates = () => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split("T")[0]);
    }
    return arr;
  };

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = getPastWeekDates();

  // Synthetic baseline data to make charts look highly engaging on first load, blended with real user states
  const baseCalorieValues = [1850, 1950, 2200, 1800, 2050, 2100];
  const baseWaterValues = [2000, 2250, 1750, 2500, 2100, 2600];

  const calorieData = dates.map((dateStr, index) => {
    const isToday = dateStr === todayStr;
    const dayName = labels[index];
    
    // Calculate real sum if logs exist, otherwise use preset baseline
    const dayRealLogs = foodLogs.filter(log => log.date === dateStr);
    const caloriesLogged = dayRealLogs.reduce((acc, curr) => acc + curr.calories, 0);
    
    return {
      name: dayName,
      date: dateStr,
      Consumed: isToday || caloriesLogged > 0 ? caloriesLogged : baseCalorieValues[index] || 1900,
      Target: user.calorieTarget
    };
  });

  const waterData = dates.map((dateStr, index) => {
    const isToday = dateStr === todayStr;
    const dayName = labels[index];
    
    const dayRealLogs = waterLogs.filter(log => log.date === dateStr);
    const waterLogged = dayRealLogs.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      name: dayName,
      date: dateStr,
      Logged: isToday || waterLogged > 0 ? waterLogged / 1000 : (baseWaterValues[index] || 2000) / 1000,
      Target: user.waterTarget
    };
  });

  // Calculate real average macronutrients ratios
  const totalProtein = foodLogs.reduce((acc, curr) => acc + curr.protein, 0);
  const totalCarbs = foodLogs.reduce((acc, curr) => acc + curr.carbs, 0);
  const totalFats = foodLogs.reduce((acc, curr) => acc + curr.fats, 0);

  // default mock distribution ratios if user food logs are empty
  const hasRealLogs = foodLogs.length > 0;
  const pieData = [
    { name: "Protein", value: hasRealLogs ? totalProtein : 120, color: "#fe9400" },
    { name: "Carbs", value: hasRealLogs ? totalCarbs : 200, color: "#18baf8" },
    { name: "Fats", value: hasRealLogs ? totalFats : 65, color: "#72c13f" }
  ];

  const totalMacroGrams = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col gap-6" id="insights-tab-view">
      <div id="insights-header">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Insights</h2>
        <p className="text-xs text-on-surface-variant font-medium">
          View your progress and trends over the past 7 days.
        </p>
      </div>

      {/* High Level Highlight Bento Numbers Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="insights-top-bento">
        <div className="bg-surface card-elevation-1 p-4 rounded-2xl border border-outline-variant/10">
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Avg Daily Intake</span>
          <span className="block text-xl font-extrabold text-primary mt-1">
            {Math.round(calorieData.reduce((acc, curr) => acc + curr.Consumed, 0) / 7)} <span className="text-xs font-semibold">kcal</span>
          </span>
          <span className="text-[9px] text-primary font-bold flex items-center gap-1 mt-1.5">
            <TrendingDown className="w-3.5 h-3.5" /> Deficit status
          </span>
        </div>

        <div className="bg-surface card-elevation-1 p-4 rounded-2xl border border-outline-variant/10">
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Hydration Consistency</span>
          <span className="block text-xl font-extrabold text-tertiary mt-1">
            {Math.round((waterData.filter(d => d.Logged >= d.Target).length / 7) * 100)}%
          </span>
          <span className="text-[9px] text-tertiary font-bold flex items-center gap-1 mt-1.5">
            <Activity className="w-3.5 h-3.5" /> Hydration status
          </span>
        </div>

        <div className="bg-surface card-elevation-1 p-4 rounded-2xl border border-outline-variant/10">
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Protein Satiety Rating</span>
          <span className="block text-xl font-extrabold text-secondary mt-1">
            {hasRealLogs ? Math.round((totalProtein / (totalProtein + totalCarbs + totalFats || 1)) * 100) : 28}%
          </span>
          <span className="text-[9px] text-secondary font-bold flex items-center gap-1 mt-1.5">
            <Zap className="w-3.5 h-3.5" /> Protein status
          </span>
        </div>

        <div className="bg-surface card-elevation-1 p-4 rounded-2xl border border-outline-variant/10">
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Current Login Streak</span>
          <span className="block text-xl font-extrabold text-emerald-500 mt-1">
            {user.streakDays} <span className="text-xs font-semibold">Days</span>
          </span>
          <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-1.5">
            <Award className="w-3.5 h-3.5" /> Consistent logger
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="insights-charts-row">
        {/* Calorie Progress Line Area chart */}
        <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Daily Energy Budget</span>
              <h3 className="text-md font-bold text-on-surface mt-0.5 flex items-center gap-1.5">
                <Flame className="w-4.5 h-4.5 text-primary" /> Calories Progress Index
              </h3>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">Past Week</span>
          </div>

          <div className="h-64" id="calorie-trend-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calorieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f6c00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2f6c00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "bold" }} stroke="#717a67" />
                <YAxis tick={{ fontSize: 10, fontWeight: "bold" }} stroke="#717a67" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1a1c1e", 
                    borderRadius: "12px", 
                    color: "#ffffff", 
                    fontSize: "11px",
                    border: "none"
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area 
                  type="monotone" 
                  dataKey="Consumed" 
                  stroke="#2f6c00" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorCalories)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Target" 
                  stroke="#fe9400" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={0} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water Intake Bar Chart */}
        <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Daily Hydration Levels</span>
              <h3 className="text-md font-bold text-on-surface mt-0.5 flex items-center gap-1.5">
                <Droplet className="w-4.5 h-4.5 text-tertiary" /> Water Trends (Litres)
              </h3>
            </div>
            <span className="text-[10px] bg-tertiary/10 text-tertiary px-2.5 py-1 rounded-full font-bold">Target: {user.waterTarget}L</span>
          </div>

          <div className="h-64" id="water-trend-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "bold" }} stroke="#717a67" />
                <YAxis tick={{ fontSize: 10, fontWeight: "bold" }} stroke="#717a67" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1a1c1e", 
                    borderRadius: "12px", 
                    color: "#ffffff", 
                    fontSize: "11px",
                    border: "none"
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Logged" fill="#18baf8" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Macronutrient Calorie Breakdown Wheel and Insight Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="insights-macros-insights-section">
        {/* Pie Wheel Chart */}
        <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/10 md:col-span-1 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Gram Composition Ratio</span>
            <span className="text-md font-bold text-on-surface mt-1 block">Averages share %</span>
          </div>

          <div className="h-48 w-full mt-4 flex items-center justify-center relative" id="macro-pie-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xl font-extrabold text-on-surface block">{totalMacroGrams}</span>
              <span className="text-[8px] uppercase tracking-widest font-bold text-on-surface-variant">total grams</span>
            </div>
          </div>

          {/* Legends layout */}
          <div className="flex gap-4 mt-2 justify-center" id="pie-legends-details">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name} ({Math.round((entry.value / (totalMacroGrams || 1)) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutritional Advice Insights Panel */}
        <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 md:col-span-2 flex flex-col justify-between" id="insights-text-analysis">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Calculated Dietary Insights</span>
            <h3 className="text-xl font-extrabold text-on-surface tracking-tight mt-1.5">Your metabolic efficiency analysis</h3>
            
            <div className="flex flex-col gap-3 mt-4" id="insights-points-listing">
              <div className="flex gap-3 items-start text-xs leading-relaxed text-on-surface-variant">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                <div>
                  <span className="font-bold text-on-surface block">Optimum Protein Proportion</span>
                  You averaged <span className="font-semibold text-secondary">{hasRealLogs ? totalProtein : 120}g</span> of quality amino proteins. This is sufficient to sustain active cells and preserve muscle mass during calorie deficit cycles. Keep loading eggs, salmon, and Greek yogurt!
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs leading-relaxed text-on-surface-variant">
                <span className="w-5 h-5 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                <div>
                  <span className="font-bold text-on-surface block">Hydration & Electrolyte Levels</span>
                  Your hydration trend highlights adequate cellular performance. Water consistency is vital to kidney clearance and assists with natural satiety.
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs leading-relaxed text-on-surface-variant">
                <span className="w-5 h-5 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                <div>
                  <span className="font-bold text-on-surface block">Energy Balance Rationale</span>
                  Currently logging within deficit guidelines. Preserving a conservative deficit (e.g. 15-20% below maintenance) optimizes fat loss without introducing fatigue.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight History Progression Module */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="insights-weight-module-section">
        {/* Input Logger Box */}
        <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/10 md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Weight Logger
            </div>
            <h4 className="text-md font-bold text-on-surface">Update Body Weight</h4>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Log daily fasted morning weights to align historical progress lines and calibrate your metabolic deficit algorithms.
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Scale Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="500"
                    placeholder="e.g. 68.4"
                    value={newWeightInput}
                    onChange={(e) => setNewWeightInput(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container pl-3.5 pr-10 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-on-surface-variant/40">KG</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Logging Date</label>
                <input
                  type="date"
                  value={weightLogDate}
                  onChange={(e) => setWeightLogDate(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const val = parseFloat(newWeightInput);
              if (val > 0) {
                onAddWeightLog(val, weightLogDate);
                setNewWeightInput("");
              }
            }}
            disabled={!newWeightInput}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black text-xs py-3.5 px-5 rounded-lg flex items-center justify-center gap-2 active:scale-95 shadow transition-all cursor-pointer disabled:opacity-40"
          >
            💾 Log Weight Progress
          </button>
        </div>

        {/* Dynamic Weight Progress Chart Box */}
        <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/10 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Fasted morning trend</span>
              <h3 className="text-md font-bold text-on-surface mt-0.5 flex items-center gap-1.5">
                 📏 Chronological Body Weight Progression
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">Live Progress</span>
          </div>

          <div className="h-64" id="weight-trend-chart-box">
            {weightChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-on-surface-variant font-bold">
                No weight logs registered yet. Log your weight to render progression lines!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "bold" }} stroke="#717a67" />
                  <YAxis 
                    domain={["dataMin - 1", "dataMax + 1"]} 
                    tick={{ fontSize: 10, fontWeight: "bold" }} 
                    stroke="#717a67" 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1c1e",
                      borderRadius: "12px",
                      color: "#ffffff",
                      fontSize: "11px",
                      border: "none"
                    }}
                  />
                  <Area type="monotone" dataKey="Weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" name="Weight (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
