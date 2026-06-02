import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Search, 
  Plus, 
  Loader2, 
  Check, 
  Utensils, 
  Info, 
  Image as ImageIcon, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { UserProfile, FoodLog } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TrackerProps {
  user: UserProfile;
  onAddFoodLog: (foodName: string, cal: number, protein: number, carbs: number, fats: number, mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack") => void;
}

// Rich pre-loaded database catalog for direct user search
const VERIFIED_NUTRITION_CATALOG = [
  { foodName: "Avocado Toast with Egg", calories: 320, protein: 12, carbs: 28, fats: 16, servingSize: "1 slice" },
  { foodName: "Grilled Chicken Breast (Skinless)", calories: 284, protein: 53, carbs: 0, fats: 6, servingSize: "200g" },
  { foodName: "Oatmeal with Blueberries & Honey", calories: 290, protein: 10, carbs: 54, fats: 4, servingSize: "1 medium bowl" },
  { foodName: "Wild Sockeye Salmon Fillet", calories: 367, protein: 40, carbs: 0, fats: 22, servingSize: "180g" },
  { foodName: "Greek Yogurt fat-free (Plain)", calories: 130, protein: 24, carbs: 9, fats: 0, servingSize: "200g" },
  { foodName: "Brown Basmati Cooked Rice", calories: 215, protein: 5, carbs: 45, fats: 1.5, servingSize: "1 cup" },
  { foodName: "Sweet Potato Baked", calories: 180, protein: 4, carbs: 41, fats: 0.3, servingSize: "1 large potato" },
  { foodName: "Beef Tenderloin Seared", calories: 324, protein: 36, carbs: 0, fats: 18, servingSize: "150g" },
  { foodName: "Mixed Green Caesar Salad", calories: 150, protein: 3, carbs: 8, fats: 12, servingSize: "1 bowl" },
  { foodName: "Whey Protein Isolate Shake", calories: 140, protein: 30, carbs: 2, fats: 1, servingSize: "1 scoop" },
  { foodName: "Medium Size Banana", calories: 105, protein: 1.3, carbs: 27, fats: 0.3, servingSize: "1 piece" },
  { foodName: "Raw Hard-boiled Egg", calories: 78, protein: 6, carbs: 0.6, fats: 5, servingSize: "1 egg" }
];

// Curated library of test images of food items to allow camera simulation
const CAMERA_PRESETS = [
  {
    name: "Healthy Salad Presets",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    base64_sim: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Dummy fallback base64
    recognizedFallback: {
      foodName: "Fresh Garden Sprout & Avocado Bowl",
      calories: 340,
      carbs: 18,
      protein: 10,
      fats: 24,
      servingSize: "1 medium plate",
      confidence: 96
    }
  },
  {
    name: "Seared Salmon Presets",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80",
    base64_sim: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    recognizedFallback: {
      foodName: "Herbed King Salmon with Veggies",
      calories: 520,
      carbs: 15,
      protein: 42,
      fats: 26,
      servingSize: "1 single fillet plate",
      confidence: 94
    }
  },
  {
    name: "Classic Pancakes Presets",
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80",
    base64_sim: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    recognizedFallback: {
      foodName: "Healthy Oat Pancakes with Raspberries",
      calories: 410,
      carbs: 65,
      protein: 12,
      fats: 8,
      servingSize: "3 pancakes stack",
      confidence: 91
    }
  }
];

export default function Tracker({ user, onAddFoodLog }: TrackerProps) {
  // Manual form hooks
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [isSuccessLogged, setIsSuccessLogged] = useState(false);

  // Search state hooks
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(VERIFIED_NUTRITION_CATALOG);

  // Web camera / scanner scan state hooks
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Gemini recognition return
  const [scanResult, setScanResult] = useState<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servingSize: string;
    confidence: number;
    note?: string;
  } | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update search list
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(VERIFIED_NUTRITION_CATALOG);
      return;
    }
    const filtered = VERIFIED_NUTRITION_CATALOG.filter(item => 
      item.foodName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Submit manual meal
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    onAddFoodLog(
      foodName,
      parseInt(calories),
      parseInt(protein) || 0,
      parseInt(carbs) || 0,
      parseInt(fats) || 0,
      mealType
    );

    // Reset fields
    setFoodName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setIsSuccessLogged(true);
    setTimeout(() => setIsSuccessLogged(false), 2500);
  };

  // Handle webcam stream startup
  const startCamera = async () => {
    try {
      setCapturedImage(null);
      setScanResult(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera startup error:", err);
      alert("Camera frame access not supported or denied by browser. Using supportive fallback preset list below instead!");
    }
  };

  // Close camera track
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
  };

  // Capture snapshots from stream
  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        stopCamera();
        runFoodAnalysis(dataUrl);
      }
    }
  };

  // Trigger base64 meal check
  const runFoodAnalysis = async (base64DataUrl: string) => {
    setIsScanning(true);
    setIsRecognizing(true);
    try {
      const base64Clean = base64DataUrl.split(",")[1];
      const resp = await fetch("/api/food-recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64Clean, mimeType: "image/jpeg" })
      });
      const data = await resp.json();
      setScanResult(data);
    } catch (error) {
      console.error("Food scanning query fail:", error);
    } finally {
      setIsScanning(false);
      setIsRecognizing(false);
    }
  };

  // Direct mock presets select to test Gemini parsing
  const selectPresetImage = (preset: typeof CAMERA_PRESETS[0]) => {
    setCapturedImage(preset.imageUrl);
    setIsScanning(true);
    setIsRecognizing(true);
    
    // Simulate high class scanner effect before showing result
    setTimeout(() => {
      // In simulation mode, we query with standard image parameters
      // If server is up, it can parse. Let's do direct payload mapping
      setScanResult(preset.recognizedFallback);
      setIsScanning(false);
      setIsRecognizing(false);
    }, 2000);
  };

  // Logging selected verified target catalog
  const logCatalogItem = (item: typeof VERIFIED_NUTRITION_CATALOG[0], slot: typeof mealType) => {
    onAddFoodLog(
      item.foodName,
      item.calories,
      item.protein,
      item.carbs,
      item.fats,
      slot
    );
  };

  // Clear camera scans
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col gap-6" id="tracker-tab-view">
      <div id="tracker-header">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Tracker</h2>
        <p className="text-xs text-on-surface-variant font-medium">
          Log meals by camera scan, quick search, or manual input.
        </p>
      </div>

      {/* Camera Scanning Section */}
      <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/30 select-none relative overflow-hidden" id="tracker-scanner-bento">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-surface-container rounded-lg text-on-surface flex items-center justify-center border border-outline-variant/30">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">Camera Scan Recognition</span>
          </div>
        </div>

        {/* Real Live Camera Stream Viewport */}
        <div className="bg-surface-container rounded-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[240px] border border-outline-variant/30" id="video-stream-box">
          
          <AnimatePresence mode="wait">
            {isCameraActive && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
                id="camera-active-viewport"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 border-[3px] border-dashed border-primary/40 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-background bg-on-background/80 px-2 py-0.5 rounded font-medium">Target food inside boundary</span>
                </div>
              </motion.div>
            )}

            {capturedImage && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="w-full h-full relative flex items-center justify-center"
                id="snapshot-display"
              >
                <img 
                  src={capturedImage} 
                  alt="Captured Meal" 
                  className="w-full h-64 object-cover" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Laser scan bar effect */}
                {isScanning && (
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_12px_rgba(114,193,63,0.8)] z-10"
                    style={{ position: 'absolute' }}
                  />
                )}
              </motion.div>
            )}

            {!isCameraActive && !capturedImage && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center p-6 flex flex-col items-center"
                id="camera-idle-view"
              >
                <ImageIcon className="w-12 h-12 text-on-surface-variant stroke-[1.5] mb-2" />
                <p className="text-xs font-bold text-on-surface">No Image Uploaded or Captured</p>
                <p className="text-[10px] text-on-surface-variant mt-1.5 max-w-[280px]">
                  Utilize your phone/device camera to automate recognition, or select one of the ready-to-test preset dishes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden Canvas helper */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Camera Control Action buttons */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {!isCameraActive ? (
            <button 
              onClick={startCamera}
              className="bg-primary hover:bg-opacity-90 text-on-primary text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 active:scale-95 transition-all text-center"
            >
              <Camera className="w-4 h-4" /> Start Camera Session
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={captureSnapshot}
                className="bg-secondary-container text-on-secondary-container text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow hover:opacity-95 active:scale-95 transition-all"
              >
                Capture Food Specimen
              </button>
              <button 
                onClick={stopCamera}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold py-2.5 px-4 rounded-xl active:scale-95 transition-all"
              >
                Turn Off Camera
              </button>
            </div>
          )}

          {/* Custom File Upload Input */}
          <label className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer flex items-center gap-2 transition-all">
            <ImageIcon className="w-4 h-4 text-primary" /> Upload Image File
            <input 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const dataUrl = event.target?.result as string;
                    setCapturedImage(dataUrl);
                    if (isCameraActive) stopCamera();
                    runFoodAnalysis(dataUrl);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>

        {/* PRESET CHIPS LIST FOR QUICK SIM TESTING */}
        <div className="mt-5 border-t border-outline-variant/20 pt-4" id="tracker-preset-grid">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2.5">Preset specimen list (For quick web simulator test):</span>
          <div className="grid grid-cols-3 gap-2.5">
            {CAMERA_PRESETS.map((preset, idx) => (
              <button 
                key={idx}
                onClick={() => selectPresetImage(preset)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container hover:border-primary/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <img src={preset.imageUrl} alt={preset.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-on-surface block max-w-[80px] truncate">{preset.name.split(" ")[0]}</span>
                  <span className="text-[8px] text-primary font-bold">Simulate</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SCANNER RESULTS INTERACTIVE CARD */}
        <AnimatePresence>
          {isRecognizing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-5 bg-surface-container p-4 rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center py-8 text-center"
              id="scanning-spinner"
            >
              <Loader2 className="w-6 h-6 text-on-surface animate-spin mb-2" />
              <p className="text-xs font-semibold text-on-surface">Scanning image content...</p>
              <p className="text-[10px] text-on-surface-variant mt-1 max-w-sm">Generating macro metrics and verified calorie bounds.</p>
            </motion.div>
          )}

          {scanResult && !isRecognizing && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 bg-surface-container-low p-5 rounded-2xl border border-primary-container/20 shadow-sm"
              id="vision-detection-results-sheet"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded-full uppercase">Detected Specimen</span>
                  <h4 className="text-lg font-bold text-on-surface mt-1.5">{scanResult.foodName}</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">Est. Serving: {scanResult.servingSize}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-on-surface">Confidence</span>
                  <span className="block text-xl font-extrabold text-primary">{scanResult.confidence}%</span>
                </div>
              </div>

              {/* Macro block details */}
              <div className="grid grid-cols-4 gap-3 bg-white dark:bg-background rounded-xl p-3.5 mt-4 text-center shadow-inner">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wide text-error block">Calories</span>
                  <span className="text-sm font-bold text-on-surface">{scanResult.calories}</span>
                  <span className="text-[8px] text-on-surface-variant block uppercase font-bold">kcal</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wide text-secondary block">Protein</span>
                  <span className="text-sm font-bold text-on-surface">{scanResult.protein}g</span>
                  <span className="text-[8px] text-on-surface-variant block uppercase font-bold">muscle</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wide text-tertiary block">Carbs</span>
                  <span className="text-sm font-bold text-on-surface">{scanResult.carbs}g</span>
                  <span className="text-[8px] text-on-surface-variant block uppercase font-bold">energy</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wide text-outline block">Fats</span>
                  <span className="text-sm font-bold text-on-surface">{scanResult.fats}g</span>
                  <span className="text-[8px] text-on-surface-variant block uppercase font-bold">essential</span>
                </div>
              </div>

              {scanResult.note && (
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 mt-3.5 flex gap-2 items-start text-left text-xs text-primary leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" /> 
                  <span>{scanResult.note}</span>
                </div>
              )}

              {/* Action buttons to submit to slots */}
              <div className="mt-4 border-t border-outline-variant/10 pt-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Target Meal Record Slot:</span>
                <div className="grid grid-col-2 sm:grid-cols-4 gap-2">
                  {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map(slot => (
                    <button
                      key={slot}
                      onClick={() => {
                        if (scanResult) {
                          onAddFoodLog(
                            scanResult.foodName,
                            scanResult.calories,
                            scanResult.protein,
                            scanResult.carbs,
                            scanResult.fats,
                            slot
                          );
                          setCapturedImage(null);
                          setScanResult(null);
                        }
                      }}
                      className="bg-primary/10 hover:bg-primary hover:text-on-primary text-primary transition-all text-xs font-bold py-2 rounded-xl text-center active:scale-95"
                    >
                      Log to {slot}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tracker-manual-database-row">
        {/* Verified Database catalog look up search list */}
        <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10 flex flex-col justify-between" id="tracker-database-picker">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Dietary Catalog Search</span>
            <span className="text-xs text-on-surface-variant font-medium">Verify calorie counts in real-time.</span>
            
            <div className="relative mt-4 mb-4">
              <input 
                type="text" 
                placeholder="Search catalog... e.g. Oatmeal, Chicken, Basmati" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full text-xs font-medium bg-surface-container pl-10 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
            </div>

            <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1" id="database-search-scroller">
              {searchResults.length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant text-xs font-semibold">
                  No verified items matched. Try searching general foods.
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-surface-container-low hover:bg-surface-container rounded-2xl p-3.5 border border-outline-variant/10 flex justify-between items-center transition-all group"
                  >
                    <div>
                      <span className="text-xs font-bold text-on-surface block">{item.foodName}</span>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">
                        Portion: {item.servingSize} • P: {item.protein}g C: {item.carbs}g F: {item.fats}g
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary mr-2">{item.calories} kcal</span>
                      
                      {/* Log slots drop shortcuts */}
                      <div className="opacity-80 group-hover:opacity-100 flex gap-1">
                        <button 
                          onClick={() => logCatalogItem(item, "Breakfast")}
                          className="w-6 h-6 rounded-full bg-secondary/10 hover:bg-secondary text-secondary hover:text-white text-[9px] font-bold flex items-center justify-center transition-all"
                          title="Log to Breakfast"
                        >
                          B
                        </button>
                        <button 
                          onClick={() => logCatalogItem(item, "Lunch")}
                          className="w-6 h-6 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white text-[9px] font-bold flex items-center justify-center transition-all"
                          title="Log to Lunch"
                        >
                          L
                        </button>
                        <button 
                          onClick={() => logCatalogItem(item, "Dinner")}
                          className="w-6 h-6 rounded-full bg-tertiary/10 hover:bg-tertiary text-tertiary hover:text-white text-[9px] font-bold flex items-center justify-center transition-all"
                          title="Log to Dinner"
                        >
                          D
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Custom Manual Entry Form */}
        <div className="bg-surface card-elevation-1 rounded-xl p-6 border border-outline-variant/10" id="tracker-manual-form-section">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Custom Manual Log</span>
            <span className="text-xs text-on-surface-variant font-medium">Record specific recipes and external snacks.</span>
          </div>

          <form onSubmit={handleSubmitManual} className="flex flex-col gap-3.5 mt-5" id="tracker-custom-form">
            <div>
              <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Food Name</label>
              <input 
                type="text" 
                placeholder="e.g. Grandma's Apple Pie Slice" 
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Calories (kcal)</label>
                <input 
                  type="number" 
                  placeholder="350" 
                  required
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1.5">Meal Target Slot</label>
                <select 
                  className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
              <div>
                <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Protein (g)</label>
                <input 
                  type="number" 
                  placeholder="15" 
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-background px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Carbs (g)</label>
                <input 
                  type="number" 
                  placeholder="40" 
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-background px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-tertiary"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Fats (g)</label>
                <input 
                  type="number" 
                  placeholder="8" 
                  min="0"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-background px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-outline"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary text-on-primary font-bold text-xs py-3.5 px-5 rounded-2xl cursor-pointer active:scale-95 transition-all outline-none border-none mt-2 flex items-center justify-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" /> Log Custom Food Item
            </button>

            {isSuccessLogged && (
              <div className="bg-primary-container/20 text-primary text-xs font-bold p-3 rounded-xl border border-primary/20 flex items-center justify-center gap-1.5 mt-2 shadow-inner">
                <Check className="w-4 h-4" /> Item successfully logged! Update calculated budget.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
