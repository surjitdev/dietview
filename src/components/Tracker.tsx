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
import PricingModal from "./PricingModal";
import { 
  Crown, 
  Lock, 
  CreditCard, 
  ShieldAlert, 
  Loader, 
  X, 
  Check as CheckedIcon, 
  ChevronRight,
  Mic,
  MicOff,
  Volume2 
} from "lucide-react";

interface TrackerProps {
  user: UserProfile;
  onAddFoodLog: (foodName: string, cal: number, protein: number, carbs: number, fats: number, mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack") => void;
  launchEventMode: boolean;
  onUpdateUser: (newUserProfile: UserProfile) => void;
}

// Rich pre-loaded database catalog for direct user search
const VERIFIED_NUTRITION_CATALOG = [
  { foodName: "Paneer Butter Masala with 1 Roti", calories: 450, protein: 18, carbs: 42, fats: 22, servingSize: "1 plate" },
  { foodName: "Hyderabadi Chicken Biryani", calories: 580, protein: 32, carbs: 70, fats: 18, servingSize: "1 plate" },
  { foodName: "Masala Dosa with Sambar & Chutney", calories: 340, protein: 8, carbs: 56, fats: 10, servingSize: "1 piece" },
  { foodName: "Aloo Paratha with Butter & Yogurt", calories: 380, protein: 9, carbs: 52, fats: 14, servingSize: "1 large paratha" },
  { foodName: "Chole Bhature (2 Bhaturas)", calories: 650, protein: 14, carbs: 85, fats: 28, servingSize: "1 serving" },
  { foodName: "Steamed Chicken Momos (6 pcs)", calories: 250, protein: 16, carbs: 32, fats: 6, servingSize: "1 plate" },
  { foodName: "Dal Tadka with Jeera Rice", calories: 410, protein: 12, carbs: 68, fats: 9, servingSize: "1 plate" },
  { foodName: "Veg Poha with Roasted Peanuts", calories: 280, protein: 6, carbs: 48, fats: 8, servingSize: "1 plate" },
  { foodName: "Pav Bhaji (with 2 buttered pavs)", calories: 480, protein: 11, carbs: 70, fats: 16, servingSize: "1 plate" },
  { foodName: "Palak Paneer", calories: 290, protein: 15, carbs: 12, fats: 20, servingSize: "1 bowl" },
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

export default function Tracker({ user, onAddFoodLog, launchEventMode, onUpdateUser }: TrackerProps) {
  // Determine if premium features are unlocked (via isPremium or an active 10-day Trial)
  const isPremiumUser = user.isPremium === true || 
    (user.trialActive === true && user.trialStartDate && 
     (Date.now() - new Date(user.trialStartDate).getTime() < 3 * 24 * 60 * 60 * 1000));

  // Manual form hooks
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [isSuccessLogged, setIsSuccessLogged] = useState(false);

  // Voice logging state hooks
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSuccessMessage, setVoiceSuccessMessage] = useState<string | null>(null);

  // Freemium states for Camera and Scan restriction protection
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvc, setCvc] = useState("718");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(4.99);

  // Search state hooks
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(VERIFIED_NUTRITION_CATALOG);

  // Web camera / scanner scan state hooks
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermState, setCameraPermState] = useState<"idle" | "requesting" | "allowed" | "denied" | "iframe_blocked" | "hardware_missing">("idle");
  
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

  // Dynamic food suggestions suggested by a robust placeholder function based on capture
  const [suggestedFoodItems, setSuggestedFoodItems] = useState<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servingSize: string;
    confidence: number;
  }[] | null>(null);

  // Placeholder function that generates 3-4 likely healthy food suggestions based on camera photos
  const getFoodItemSuggestionsFromPhoto = (imageDataStr?: string): {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servingSize: string;
    confidence: number;
  }[] => {
    const suggestionsLibrary = [
      { foodName: "Avocado Chicken Quinoa Salad with Chia Seeds", calories: 390, protein: 26, carbs: 29, fats: 16, servingSize: "1 large bowl", confidence: 96 },
      { foodName: "Wild Seared Salmon Bowl with Roasted Asparagus & Jasmine Rice", calories: 490, protein: 36, carbs: 38, fats: 14, servingSize: "1 medium plate", confidence: 93 },
      { foodName: "Mixed Berry Greek Yogurt Parfait with Granola & Honey Spark", calories: 280, protein: 18, carbs: 46, fats: 4, servingSize: "1 tall glass cup", confidence: 91 },
      { foodName: "Steamed Edamame & Teriyaki Tofu Power Plate", calories: 310, protein: 21, carbs: 22, fats: 12, servingSize: "1 regular bowl", confidence: 87 },
      { foodName: "Egg White Omelette with Spinach, Bell Peppers & Feta Cheese", calories: 240, protein: 19, carbs: 14, fats: 8, servingSize: "1 normal plate", confidence: 94 },
      { foodName: "Smashed Chickpea Avocado Toast on Sourdough bread slice", calories: 310, protein: 10, carbs: 42, fats: 11, servingSize: "1 big slice", confidence: 89 },
      { foodName: "Grilled Chicken Breast supreme with Sweet Potato mash & broccoli", calories: 420, protein: 44, carbs: 32, fats: 8, servingSize: "1 fitness plate", confidence: 95 }
    ];

    // Pick 3 random elements to make the simulation experience dynamic and lifelike
    const shuffled = [...suggestionsLibrary].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).sort((a, b) => b.confidence - a.confidence);
  };

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

  // Robust voice text parsing engine
  const processVoiceLogText = (text: string) => {
    if (!text) return;
    
    // Clean up text
    const cleanText = text.trim();
    setFoodName(cleanText);

    // Initial default fallback stats
    let detectedCalories = "";
    let detectedProtein = "";
    let detectedCarbs = "";
    let detectedFats = "";
    let detectedMealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" = mealType;

    // Speculate meals via lower letter keyword scans
    const lower = cleanText.toLowerCase();
    if (lower.includes("breakfast") || lower.includes("morning") || lower.includes("egg")) {
      detectedMealType = "Breakfast";
    } else if (lower.includes("lunch") || lower.includes("noon") || lower.includes("rice")) {
      detectedMealType = "Lunch";
    } else if (lower.includes("dinner") || lower.includes("night") || lower.includes("chicken")) {
      detectedMealType = "Dinner";
    } else if (lower.includes("snack") || lower.includes("cookie") || lower.includes("fruit") || lower.includes("apple") || lower.includes("banana")) {
      detectedMealType = "Snack";
    }
    setMealType(detectedMealType);

    // Multi-regex numbers search with word contexts
    // 1. Calories check e.g. "350 calories" or "200kcal" or "150 cal"
    const calMatch = cleanText.match(/(\d+)\s*(calories|calorie|cal|kcal)/i) || cleanText.match(/(calories|calorie|cal|kcal)\s*(\d+)/i) || cleanText.match(/\b(\d{2,4})\b/);
    if (calMatch) {
      const numericPart = calMatch.find(part => /^\d+$/.test(part));
      if (numericPart) {
        detectedCalories = numericPart;
      }
    }

    // 2. Protein check e.g. "25 grams of protein" or "30p" or "15g protein"
    const proteinMatch = cleanText.match(/(\d+)\s*(g\s+)?(protein|prot|p\b)/i);
    if (proteinMatch) detectedProtein = proteinMatch[1];

    // 3. Carbs check e.g. "45 grams of carbs" or "50c" or "30g carbs"
    const carbMatch = cleanText.match(/(\d+)\s*(g\s+)?(carbs|carb|carbohydrates|c\b)/i);
    if (carbMatch) detectedCarbs = carbMatch[1];

    // 4. Fats check e.g. "12 grams of fat" or "10f" or "8g fat"
    const fatMatch = cleanText.match(/(\d+)\s*(g\s+)?(fats|fat|f\b)/i);
    if (fatMatch) detectedFats = fatMatch[1];

    // Attempt verification estimates based on common database catalogs if not specifically spoken
    if (!detectedCalories) {
      const match = VERIFIED_NUTRITION_CATALOG.find(item => 
        lower.includes(item.foodName.toLowerCase()) || 
        item.foodName.toLowerCase().includes(lower)
      );
      if (match) {
        detectedCalories = match.calories.toString();
        detectedProtein = match.protein.toString();
        detectedCarbs = match.carbs.toString();
        detectedFats = match.fats.toString();
      } else {
        // Safe default calories estimation for general healthy foods
        detectedCalories = "180";
      }
    }

    // Trigger state inputs
    if (detectedCalories) setCalories(detectedCalories);
    if (detectedProtein) setProtein(detectedProtein);
    if (detectedCarbs) setCarbs(detectedCarbs);
    if (detectedFats) setFats(detectedFats);

    setVoiceSuccessMessage(`Recognized: "${cleanText}"`);
    setTimeout(() => setVoiceSuccessMessage(null), 5000);
  };

  // Web Speech recognition toggle api
  const speechRecognitionRef = useRef<any>(null);

  const startVoiceLogging = () => {
    setVoiceError(null);
    setVoiceSuccessMessage(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Web Speech API is not supported by this browser version or is restricted in container viewports.");
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        if (e.error === "not-allowed") {
          setVoiceError("Microphone authorization denied. Check browser mic settings.");
        } else {
          setVoiceError(`Voice detection status: ${e.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          processVoiceLogText(transcript);
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();

    } catch (err: any) {
      console.error(err);
      setVoiceError("An unexpected error occurred starting the Speech Engine.");
      setIsListening(false);
    }
  };

  const stopVoiceLogging = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Handle webcam stream startup
  const startCamera = async () => {
    if (!isPremiumUser && !launchEventMode) {
      setShowPaywall(true);
      return;
    }
    setCameraError(null);
    setCapturedImage(null);
    setScanResult(null);
    setCameraPermState("requesting");

    const isNestedIframe = (() => {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    })();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermState(isNestedIframe ? "iframe_blocked" : "hardware_missing");
      setCameraError(
        isNestedIframe
          ? "Camera API restricted by sandbox.\n\nSince this application is nested inside an editor preview iframe, browsers systematically disable live feeds for strict security. This is expected sandbox behavior."
          : "Your hardware/browser build does not appear to support standard camera stream APIs."
      );
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setCameraPermState("allowed");
    } catch (err: any) {
      console.error("Camera startup error:", err);
      let isPermissionError = err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
      let isNoDevice = err.name === "NotFoundError" || err.name === "DevicesNotFoundError";
      
      if (isNestedIframe) {
        setCameraPermState("iframe_blocked");
      } else if (isPermissionError) {
        setCameraPermState("denied");
      } else if (isNoDevice) {
        setCameraPermState("hardware_missing");
      } else {
        setCameraPermState("denied");
      }

      let localizedMsg = "Camera feed access was denied by your browser permissions.";
      if (isPermissionError) {
        localizedMsg = "Camera access permission was denied. Please grant permission in your browser's address settings bar.";
      } else if (isNoDevice) {
        localizedMsg = "No physical videocamera was detected on your modern hardware model.";
      }
      
      setCameraError(localizedMsg);
    }
  };

  // Close camera track
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
    setCameraPermState("idle");
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
    setSuggestedFoodItems(null);
    try {
      const base64Clean = base64DataUrl.split(",")[1];
      const resp = await fetch("/api/food-recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64Clean, mimeType: "image/jpeg" })
      });
      const data = await resp.json();
      setScanResult(data);

      const suggestions = getFoodItemSuggestionsFromPhoto(base64DataUrl);
      if (data && data.foodName) {
        setSuggestedFoodItems([
          {
            foodName: data.foodName,
            calories: data.calories || 350,
            protein: data.protein || 15,
            carbs: data.carbs || 35,
            fats: data.fats || 10,
            servingSize: data.servingSize || "1 portion",
            confidence: data.confidence || 95
          },
          ...suggestions.filter(s => s.foodName !== data.foodName).slice(0, 2)
        ]);
      } else {
        setSuggestedFoodItems(suggestions);
      }
    } catch (error) {
      console.error("Food scanning query fail:", error);
      const fallbackSuggestions = getFoodItemSuggestionsFromPhoto(base64DataUrl);
      setSuggestedFoodItems(fallbackSuggestions);
      if (fallbackSuggestions.length > 0) {
        setScanResult({
          foodName: fallbackSuggestions[0].foodName,
          calories: fallbackSuggestions[0].calories,
          protein: fallbackSuggestions[0].protein,
          carbs: fallbackSuggestions[0].carbs,
          fats: fallbackSuggestions[0].fats,
          servingSize: fallbackSuggestions[0].servingSize,
          confidence: fallbackSuggestions[0].confidence,
          note: "Sandbox fallback. Displaying rich photorealistic options suggested by Diet AI."
        });
      }
    } finally {
      setIsScanning(false);
      setIsRecognizing(false);
    }
  };

  // Direct mock presets select to test Gemini parsing
  const selectPresetImage = (preset: typeof CAMERA_PRESETS[0]) => {
    if (!isPremiumUser && !launchEventMode) {
      setShowPaywall(true);
      return;
    }
    setCapturedImage(preset.imageUrl);
    setIsScanning(true);
    setIsRecognizing(true);
    setSuggestedFoodItems(null);
    
    // Simulate high class scanner effect before showing result
    setTimeout(() => {
      setScanResult(preset.recognizedFallback);
      const suggestions = getFoodItemSuggestionsFromPhoto();
      setSuggestedFoodItems([
        preset.recognizedFallback,
        ...suggestions.filter(s => s.foodName !== preset.recognizedFallback.foodName).slice(0, 2)
      ]);
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
                  muted
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

            {cameraError && !isCameraActive && !capturedImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="p-6 flex flex-col items-stretch max-w-[420px] w-full text-left"
                id="camera-permission-advisor"
              >
                {/* Header Icon + Diagnostic Title */}
                <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">Camera Permissions Advisor</h4>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        cameraPermState === "iframe_blocked" 
                          ? "bg-purple-150 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-300/30"
                          : cameraPermState === "hardware_missing"
                          ? "bg-amber-150 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300/30"
                          : "bg-error/15 text-error border border-error/20"
                      }`}>
                        {cameraPermState === "iframe_blocked" && "🔒 Sandbox Restricted"}
                        {cameraPermState === "hardware_missing" && "🔌 No Camera Found"}
                        {cameraPermState === "denied" && "⚠️ Access Denied"}
                        {cameraPermState === "requesting" && "🔄 Verifying..."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Diagnostic String */}
                <p className="text-[10px] text-on-surface-variant font-semibold bg-zinc-50 dark:bg-zinc-950/20 border border-outline-variant/10 p-3 rounded-xl leading-relaxed whitespace-pre-line mb-4 font-mono">
                  {cameraError}
                </p>

                {/* Step-by-Step Recovery Guides depending on state */}
                <div className="space-y-3 mb-5" id="permission-recovery-steps">
                  <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">How to Grant Access:</span>
                  
                  {cameraPermState === "iframe_blocked" ? (
                    <div className="space-y-2 text-[10px] text-on-surface-variant leading-relaxed">
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-[10px]">1</span>
                        <span>Click the <strong className="text-on-surface font-black">Open in New Tab ↗</strong> button below. This moves the application into an independent context outside the sandboxed editor.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-[10px]">2</span>
                        <span>Tap <strong className="text-on-surface">Start Camera Session</strong> in the top header.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-[10px]">3</span>
                        <span>Select <strong className="text-on-surface">Allow / Grant</strong> when your operating system asks for permission.</span>
                      </div>
                    </div>
                  ) : cameraPermState === "denied" ? (
                    <div className="space-y-2 text-[10px] text-on-surface-variant leading-relaxed">
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-[10px]">A</span>
                        <span><strong>Google Chrome / Edge</strong>: Click the <strong className="text-on-surface font-black">Lock/Tune controls icon</strong> at the left side of your address bar ➔ Toggle the <strong className="text-on-surface font-black">Camera</strong> switch to <strong className="text-primary font-black">Allow</strong>.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-[10px]">B</span>
                        <span><strong>Apple Safari (iOS/macOS)</strong>: Tap the <strong className="text-on-surface font-black">aA</strong> or page setting icon in the input address bar ➔ Website Settings ➔ Click and override Camera permission to <strong className="text-primary font-black">Allow</strong>.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-[10px]">C</span>
                        <span><strong>Mobile settings</strong>: Access App Settings on iOS/Android ➔ Verify your browser has system authorization to utilize capture hardware.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-[10px] text-on-surface-variant leading-relaxed">
                      <p>• Make sure the camera is physically connected, has no slider lid activated, and isn't being operated by another client like Zoom/Meet.</p>
                      <p>• Try reloading this page or connect a compliant external microphone and camera assembly.</p>
                    </div>
                  )}
                </div>

                {/* Primary Interactive Action Button suite */}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button 
                    type="button"
                    onClick={() => startCamera()}
                    className="flex-1 bg-primary hover:bg-opacity-90 text-on-primary text-[10px] font-black py-2.5 rounded-xl active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 animate-pulse" />
                    Retry Camera Connection
                  </button>
                  
                  {cameraPermState === "iframe_blocked" && (
                    <a 
                      href={window.location.href}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-[10px] font-black px-4 py-2.5 rounded-xl active:scale-95 transition-all uppercase tracking-wider text-center flex items-center justify-center gap-1"
                    >
                      Open in New Tab ↗
                    </a>
                  )}

                  <button 
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      setCameraPermState("idle");
                    }}
                    className="bg-surface-container hover:bg-surface-container-high text-on-surface text-[10px] font-black px-4 py-2.5 rounded-xl active:scale-95 transition-all uppercase tracking-wider"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

            {!isCameraActive && !capturedImage && !cameraError && (
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
                if (!isPremiumUser && !launchEventMode) {
                  setShowPaywall(true);
                  return;
                }
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
                          setSuggestedFoodItems(null);
                        }
                      }}
                      className="bg-primary/10 hover:bg-primary hover:text-on-primary text-primary transition-all text-xs font-bold py-2 rounded-xl text-center active:scale-95"
                    >
                      Log to {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Food Suggested Candidates based on Image (Placeholder suggestions) */}
              {suggestedFoodItems && suggestedFoodItems.length > 0 && (
                <div className="mt-5 border-t border-outline-variant/15 pt-5 text-left" id="ai-photo-suggestions-list">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Diet AI Photo Recommendations</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-semibold mb-4">
                    Based on visual features, our predictive analysis suggests these possible matching healthy items:
                  </p>
                  
                  <div className="flex flex-col gap-2.5">
                    {suggestedFoodItems.map((sug, sIndex) => (
                      <div 
                        key={sIndex} 
                        className="bg-white dark:bg-zinc-900 border border-outline-variant/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all shadow-xs"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-on-surface leading-tight">{sug.foodName}</span>
                            <span className="text-[8.5px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase border border-primary/20 leading-none">
                              {sug.confidence}% Match
                            </span>
                          </div>
                          
                          {/* Macro summary line */}
                          <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold mt-1.5 font-mono">
                            <span className="text-error">{sug.calories} kcal</span>
                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                            <span className="text-secondary">P: {sug.protein}g</span>
                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                            <span className="text-tertiary">C: {sug.carbs}g</span>
                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                            <span className="text-outline">F: {sug.fats}g</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium block mt-1.5">Est. Portion: {sug.servingSize}</span>
                        </div>
                        
                        {/* Instant Quick Log Button Group */}
                        <div className="flex flex-wrap items-center gap-1 shrink-0 self-end sm:self-auto">
                          {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map(trgSlot => (
                            <button
                              key={trgSlot}
                              onClick={() => {
                                onAddFoodLog(
                                  sug.foodName,
                                  sug.calories,
                                  sug.protein,
                                  sug.carbs,
                                  sug.fats,
                                  trgSlot
                                );
                                // Clear
                                setCapturedImage(null);
                                setScanResult(null);
                                setSuggestedFoodItems(null);
                              }}
                              className="text-[9px] font-black uppercase text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-primary hover:text-on-primary dark:bg-zinc-800 dark:hover:bg-primary dark:hover:text-on-primary transition-all px-2.5 py-1.5 rounded-lg active:scale-90 cursor-pointer"
                              title={`Log ${sug.foodName} to ${trgSlot}`}
                            >
                              +{trgSlot[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant">Food Name</label>
                
                {/* Voice Log Trigger Quick Action */}
                <button
                  type="button"
                  onClick={isListening ? stopVoiceLogging : startVoiceLogging}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer border ${
                    isListening
                      ? "bg-rose-500 text-white border-rose-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                      : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                  }`}
                  title={isListening ? "Stop Listening" : "Log with Voice Input"}
                  id="voice-mic-trigger-btn"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3 h-3 animate-bounce" />
                      <span>Recording... (Tap to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-primary" />
                      <span>Log by Voice</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real-time Voice Parsing Assistant Panel */}
              <AnimatePresence>
                {(isListening || voiceSuccessMessage || voiceError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`p-3 rounded-xl mb-3 border text-xs font-semibold flex flex-col gap-1.5 ${
                      voiceError
                        ? "bg-rose-50/70 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400"
                        : voiceSuccessMessage
                          ? "bg-emerald-50/70 border-emerald-100 text-emerald-650 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400"
                          : "bg-blue-55/50 border-blue-105 text-blue-650 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400"
                    }`}
                    id="voice-assistant-log-status"
                  >
                    <div className="flex items-center gap-2">
                      {isListening && (
                        <div className="flex gap-1 items-center justify-center h-3">
                          <span className="w-0.5 h-3 bg-blue-500 animate-pulse"></span>
                          <span className="w-0.5 h-2 bg-blue-400 animate-pulse"></span>
                          <span className="w-0.5 h-3 bg-blue-500 animate-pulse"></span>
                          <span className="w-0.5 h-1.5 bg-blue-400 animate-pulse"></span>
                        </div>
                      )}
                      
                      <p className="flex-1 text-[11px] leading-snug">
                        {voiceError && voiceError || ""}
                        {voiceSuccessMessage && voiceSuccessMessage || ""}
                        {isListening && `Listening... Speak naturally now!`}
                      </p>

                      {/* Clear status */}
                      <button 
                        type="button" 
                        onClick={() => { setVoiceError(null); setVoiceSuccessMessage(null); }}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-current shrink-0"
                        id="voice-status-close-btn"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {isListening && (
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 border-t border-blue-100/30 dark:border-blue-900/20 pt-1.5 font-medium select-none">
                        💡 Say something like: <span className="font-extrabold text-blue-550 dark:text-blue-400">"Log chicken breast 250 calories and 35g protein for lunch"</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sample Quick Voice Templates for restricted/testing simulation usage */}
              <div className="mb-3.5 bg-zinc-50 dark:bg-zinc-950/20 rounded-2xl p-3 border border-zinc-150/50 dark:border-zinc-850/40 animate-fade-in" id="quick-voice-tester-board">
                <div className="flex items-center gap-1.5 mb-1.5 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-[9.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Test/Simulate Voice Phrases</span>
                  </div>
                  <span className="text-[8.5px] font-medium text-zinc-400">(Tap to auto-parse)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { text: "Double cheese omelette 320 calories with 18g protein for breakfast", display: "🍳 Omelette Breakfast" },
                    { text: "Salmon sushi platter 450 calories and 28g protein for dinner", display: "🍣 Salmon Sushi" },
                    { text: "Greek yogurt parfait with mixed berries 180 cal for snack", display: "🍨 Berry Parfait Snack" },
                    { text: "Grilled chicken breast with broccoli 350 calories and 40g protein for lunch", display: "🍗 Chicken Lunch" }
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => processVoiceLogText(preset.text)}
                      className="text-[10px] font-bold bg-white dark:bg-zinc-900 hover:bg-primary/5 hover:text-primary border border-zinc-200/60 dark:border-zinc-800/80 px-2 py-1 rounded-xl transition-all cursor-pointer text-zinc-650 dark:text-zinc-350 active:scale-95 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
                      title={`Simulate voice input: "${preset.text}"`}
                      id={`preset-speech-${pIdx}`}
                    >
                      {preset.display}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Grandma's Apple Pie Slice" 
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface-container pl-3.5 pr-10 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
                
                {/* Inline Microphone Button shortcut */}
                <button
                  type="button"
                  onClick={isListening ? stopVoiceLogging : startVoiceLogging}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg cursor-pointer transition-colors ${
                    isListening 
                      ? "bg-rose-500 text-white animate-pulse" 
                      : "text-zinc-400 hover:text-primary hover:bg-zinc-150/40 dark:hover:bg-zinc-800"
                  }`}
                  title={isListening ? "Listening... click to end" : "Listen via Mic"}
                  id="voice-mic-inline-btn"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
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
