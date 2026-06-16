import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Crown, X, Check, Sparkles, ShieldCheck, Loader, 
  Globe, CreditCard, Gift, ArrowRight, QrCode, History, AlertCircle, RefreshCw,
  Clipboard, Wallet, Coins
} from "lucide-react";
import { UserProfile, UpiPaymentModel } from "../types";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from "../firebase";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => Promise<void> | void;
}

interface PlanDetails {
  id: "trial" | "monthly" | "yearly";
  name: string;
  badge?: string;
  features: string[];
}

const PLAN_TEMPLATES: PlanDetails[] = [
  {
    id: "trial",
    name: "3-Day Trial",
    features: [
      "Full Premium Access",
      "Unlimited AI Coach",
      "Unlimited Food Scanner",
      "Advanced Analytics",
      "Cancel Anytime"
    ]
  },
  {
    id: "monthly",
    name: "Pro Monthly ⭐",
    features: [
      "Unlimited AI Coach",
      "Unlimited Food Tracking",
      "Unlimited Food Scans",
      "Personalized Diet Guidance",
      "Weight Goal Tracking",
      "Progress Analytics",
      "Priority Support"
    ]
  },
  {
    id: "yearly",
    name: "Pro Yearly 🔥",
    features: [
      "Everything in Pro Monthly",
      "Save 33%",
      "Early Access to New Features",
      "Premium Support"
    ]
  }
];

export const COUNTRY_PRICING = {
  "India": {
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    symbol: "₹",
    rates: {
      trial: { display: "₹7 for 3 days", raw: 7 },
      monthly: { display: "₹199/month", raw: 199 },
      yearly: { display: "₹1,199/year", raw: 1199 }
    }
  },
  "USA": {
    name: "USA",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    rates: {
      trial: { display: "$0.99 for 3 days", raw: 0.99 },
      monthly: { display: "$7.99/month", raw: 7.99 },
      yearly: { display: "$59.99/year", raw: 59.99 }
    }
  },
  "Japan": {
    name: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    symbol: "¥",
    rates: {
      trial: { display: "¥100 for 3 days", raw: 100 },
      monthly: { display: "¥900/month", raw: 900 },
      yearly: { display: "¥7,000/year", raw: 7000 }
    }
  },
  "Mexico": {
    name: "Mexico",
    flag: "🇲🇽",
    currency: "MXN",
    symbol: "MX$",
    rates: {
      trial: { display: "MX$15 for 3 days", raw: 15 },
      monthly: { display: "MX$129/month", raw: 129 },
      yearly: { display: "MX$999/year", raw: 999 }
    }
  },
  "Italy": {
    name: "Italy",
    flag: "🇮🇹",
    currency: "EUR",
    symbol: "€",
    rates: {
      trial: { display: "€0.99 for 3 days", raw: 0.99 },
      monthly: { display: "€6.99/month", raw: 6.99 },
      yearly: { display: "€54.99/year", raw: 54.99 }
    }
  },
  "France": {
    name: "France",
    flag: "🇫🇷",
    currency: "EUR",
    symbol: "€",
    rates: {
      trial: { display: "€0.99 for 3 days", raw: 0.99 },
      monthly: { display: "€6.99/month", raw: 6.99 },
      yearly: { display: "€54.99/year", raw: 54.99 }
    }
  },
  "Middle East": {
    name: "Middle East",
    flag: "🌍",
    currency: "USD",
    symbol: "$",
    rates: {
      trial: { display: "$0.99 for 3 days", raw: 0.99 },
      monthly: { display: "$7.99/month", raw: 7.99 },
      yearly: { display: "$59.99/year", raw: 59.99 }
    }
  }
};

type CountryKey = keyof typeof COUNTRY_PRICING;

export default function PricingModal({ isOpen, onClose, user, onUpdateUser }: PricingModalProps) {
  // Determine standard default country
  const detectDefaultCountry = (): CountryKey => {
    if (!user.country) return "India";
    const userCountryLower = user.country.toLowerCase();
    
    if (userCountryLower.includes("india")) return "India";
    if (userCountryLower.includes("usa") || userCountryLower.includes("united states") || userCountryLower.includes("america")) return "USA";
    if (userCountryLower.includes("japan") || userCountryLower.includes("nippon")) return "Japan";
    if (userCountryLower.includes("mexico") || userCountryLower.includes("mx")) return "Mexico";
    if (userCountryLower.includes("italy") || userCountryLower.includes("italia")) return "Italy";
    if (userCountryLower.includes("france")) return "France";
    if (userCountryLower.includes("middle east") || userCountryLower.includes("dubai") || userCountryLower.includes("uae") || userCountryLower.includes("saudi")) return "Middle East";
    
    return "India";
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryKey>("India");
  const [selectedPlanId, setSelectedPlanId] = useState<"trial" | "monthly" | "yearly">("trial");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "usdt_trc20">("upi");
  const [addressCopied, setAddressCopied] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Manual payment specific states
  const [upiTxId, setUpiTxId] = useState("");
  const [submittingUpi, setSubmittingUpi] = useState(false);
  const [userPayments, setUserPayments] = useState<UpiPaymentModel[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [upiSuccessMessage, setUpiSuccessMessage] = useState<string | null>(null);
  const [upiFormError, setUpiFormError] = useState<string | null>(null);

  const fetchUserPayments = async () => {
    if (!isFirebaseConfigured || !user.userId) return;
    setLoadingHistory(true);
    try {
      const q = query(collection(db, "upiPayments"), where("userId", "==", user.userId));
      const snap = await getDocs(q);
      const list: UpiPaymentModel[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as UpiPaymentModel);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserPayments(list);
    } catch (err) {
      console.error("Error fetching user upi history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Sync to correct default state once user country loads or updates
  useEffect(() => {
    if (isOpen) {
      const detected = detectDefaultCountry();
      setSelectedCountry(detected);
      if (detected === "India") {
        setPaymentMethod("upi");
      } else {
        setPaymentMethod("usdt_trc20");
      }
      fetchUserPayments();
      setUpiSuccessMessage(null);
      setUpiFormError(null);
      setUpiTxId("");
    }
  }, [isOpen, user.country]);

  if (!isOpen) return null;

  const countryInfo = COUNTRY_PRICING[selectedCountry];
  const activeRate = countryInfo.rates[selectedPlanId];
  
  // Base USD equivalents for crypto / international
  const usdtRates = {
    trial: 0.99,
    monthly: 7.99,
    yearly: 59.99
  };
  
  // Calculate final checkout price with discount if coupon is applied (Local regional rate)
  let finalPriceValue = activeRate.raw;
  if (couponApplied) {
    if (selectedPlanId === "trial") {
      finalPriceValue = Math.max(0, parseFloat((activeRate.raw * 0.5).toFixed(2))); // 50% trial discount
    } else if (selectedPlanId === "monthly") {
      finalPriceValue = Math.max(0, parseFloat((activeRate.raw * 0.8).toFixed(2))); // 20% discount
    } else {
      finalPriceValue = Math.max(0, parseFloat((activeRate.raw * 0.7).toFixed(2))); // 30% discount
    }
  }

  // Calculate final checkout price in USDT with discount if coupon is applied
  let usdtPriceClean = usdtRates[selectedPlanId];
  if (couponApplied) {
    if (selectedPlanId === "trial") {
      usdtPriceClean = Math.max(0, parseFloat((usdtPriceClean * 0.5).toFixed(2))); // 50% trial discount
    } else if (selectedPlanId === "monthly") {
      usdtPriceClean = Math.max(0, parseFloat((usdtPriceClean * 0.8).toFixed(2))); // 20% discount
    } else {
      usdtPriceClean = Math.max(0, parseFloat((usdtPriceClean * 0.7).toFixed(2))); // 30% discount
    }
  }

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (["PROMO20", "HEALTH33", "SAVE30", "DIETVIEW", "FREE50"].includes(code)) {
      setCouponApplied(true);
    } else {
      setCouponError("Special coupon code invalid or has reached its simulation limit.");
      setCouponApplied(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpiFormError(null);
    setUpiSuccessMessage(null);
    
    const txIdClean = upiTxId.trim();
    if (!txIdClean) {
      setUpiFormError(
        paymentMethod === "upi"
          ? "Please enter your 12-digit UPI Transaction ID or UTR Reference."
          : "Please enter your USDT TRC-20 Transaction Hash (TXID)."
      );
      return;
    }
    
    if (txIdClean.length < 6) {
      setUpiFormError("Please enter a valid Transaction ID / Hash (minimum 6 characters).");
      return;
    }

    if (!isFirebaseConfigured) {
      setUpiFormError("Firebase setup is unconfigured. Real transactions require Cloud Credentials to persist.");
      return;
    }

    setSubmittingUpi(true);
    try {
      const paymentId = (paymentMethod === "upi" ? "upi-ref-" : "usdt-ref-") + Date.now() + Math.random().toString(36).substring(2, 6);
      
      const price = paymentMethod === "upi" ? finalPriceValue : usdtPriceClean;
      const currency = paymentMethod === "upi" ? countryInfo.currency : "USDT";

      const newPayment: UpiPaymentModel = {
        id: paymentId,
        userId: user.userId,
        userEmail: user.email || "user@dietview.app",
        userName: user.name || "Healthy Sprout",
        planId: selectedPlanId,
        planName: PLAN_TEMPLATES.find(p => p.id === selectedPlanId)?.name || "Premium Plan",
        price: price,
        currency: currency,
        transactionId: txIdClean,
        paymentMethod: paymentMethod,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "upiPayments", paymentId), newPayment);
      
      setUpiTxId("");
      setUpiSuccessMessage(
        paymentMethod === "upi"
          ? `UPI Transaction reference logged! Ref ID: ${paymentId}. Note: An administrator will verify your payment details shortly (approx 5-15 mins).`
          : `USDT TRC-20 Transaction Hash logged! Ref ID: ${paymentId}. Note: Our blockchain validation engine / admin auditor will verify your USD receipt shortly.`
      );
      fetchUserPayments();
    } catch (err) {
      console.error("Error saving manual payment request:", err);
      setUpiFormError("Failed to submit transaction receipt to cloud. Please review rules.");
    } finally {
      setSubmittingUpi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="pricing-plans-system-modal">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md cursor-pointer"
        id="pricing-plans-overlay"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-[28px] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 z-10 max-h-[92vh] overflow-y-auto flex flex-col gap-6"
        id="pricing-plans-container"
      >
        {/* Glow decorative graphics */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-8 -mb-8" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Crown className="w-4 h-4 fill-amber-500/10 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-50">AI Health Plus Premium</h2>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-400 font-bold block mt-0.5">Customize your regional currency and subscription models</span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-all cursor-pointer"
            id="pricing-close-trigger"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Country Selector Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <Globe className="w-3 h-3 text-zinc-400" /> Choose Country Configuration
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
            {(Object.keys(COUNTRY_PRICING) as CountryKey[]).map((ck) => {
              const info = COUNTRY_PRICING[ck];
              const isSelected = selectedCountry === ck;
              return (
                <button
                  key={ck}
                  type="button"
                  onClick={() => setSelectedCountry(ck)}
                  className={`py-2 px-1 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    isSelected 
                      ? "bg-amber-500/10 border-amber-550 text-amber-600 dark:text-amber-400 font-extrabold" 
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850"
                  }`}
                >
                  <span className="text-base leading-none">{info.flag}</span>
                  <span className="truncate max-w-[56px]">{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Pricing Plans Options */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Select Your Preferred Pro Tier
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PLAN_TEMPLATES.map((tmpl) => {
              const isSelected = selectedPlanId === tmpl.id;
              let displayPrice = "";
              if (tmpl.id === "trial") {
                displayPrice = countryInfo.rates.trial.display;
              } else if (tmpl.id === "monthly") {
                displayPrice = countryInfo.rates.monthly.display;
              } else {
                displayPrice = countryInfo.rates.yearly.display;
              }

              return (
                <button
                  type="button"
                  key={tmpl.id}
                  onClick={() => setSelectedPlanId(tmpl.id)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-5 transition-all cursor-pointer active:scale-[0.98] relative overflow-hidden ${
                    isSelected 
                      ? "bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/50" 
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                  <div>
                    <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 mt-0.5">
                      {tmpl.id === "trial" ? "Flexible Sandbox Starter" : tmpl.id === "monthly" ? "Most Retained Tier" : "Best Lifetime Value"}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {displayPrice}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan Feature Grid details */}
        <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left flex flex-col gap-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block border-b border-zinc-150 dark:border-zinc-850/60 pb-1.5">
            Included in {PLAN_TEMPLATES.find(p => p.id === selectedPlanId)?.name}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {PLAN_TEMPLATES.find(p => p.id === selectedPlanId)?.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-tight">
                <Check className="w-3.5 h-3.5 text-emerald-555 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Coupons Panel */}
        <div className="flex flex-col sm:flex-row gap-2" id="coupon-redemption-engine">
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="ENTER SPECIAL COUPON (E.G. SAVE30, PROMO20)"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError("");
              }}
              className="w-full text-xs font-bold font-mono tracking-wider bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 placeholder:text-zinc-405 placeholder:font-sans outline-none uppercase"
            />
            {couponApplied && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black tracking-widest animate-pulse">
                CODE APPLIED
              </span>
            )}
          </div>
          <button 
            type="button"
            onClick={handleApplyCoupon}
            className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 font-bold text-xs cursor-pointer select-none active:scale-95"
          >
            Apply Code
          </button>
        </div>
        {couponError && (
          <span className="text-[10px] text-red-500 font-bold -mt-3 self-start">{couponError}</span>
        )}

        {/* Select Payment Method Tab Switcher */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
            Secure Payment Gateway Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`py-2 px-3 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                paymentMethod === "upi"
                  ? "bg-amber-500 dark:bg-amber-600 text-white shadow-sm font-extrabold"
                  : "text-zinc-650 dark:text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI Pay (🇮🇳 Recommended)</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("usdt_trc20")}
              className={`py-2 px-3 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                paymentMethod === "usdt_trc20"
                  ? "bg-amber-500 dark:bg-amber-600 text-white shadow-sm font-extrabold"
                  : "text-zinc-650 dark:text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>USDT TRC-20 (🌍 Crypto)</span>
            </button>
          </div>
        </div>

        {/* Call to Actions or Custom UPI/USDT Panel */}
        <div className="flex flex-col gap-2 mt-1">
          {paymentMethod === "upi" ? (
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex flex-col gap-4 text-left animate-fade-in" id="upi-verification-panel">
              <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-2.5">
                <QrCode className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-black text-zinc-850 dark:text-zinc-100 uppercase tracking-wider">Manual UPI Billing Portal</h4>
              </div>

              {/* Show UPI QR Image */}
              <div className="flex flex-col sm:flex-row items-center gap-4 py-1.5">
                <div className="bg-white p-2 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=gupta60@yesfam&pn=DietView&am=${finalPriceValue}&cu=INR&tn=DietView%20Premium`)}`} 
                    className="w-36 h-36 border-none select-none" 
                    alt="UPI Scan to Pay QR Code" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start leading-none mb-1">
                    Scan to pay via BHIM • GPAY • PHONEPE
                  </span>
                  <div className="text-xs font-medium text-zinc-650 dark:text-zinc-350 leading-normal">
                    Please use your smartphone camera or any trusted UPI app to scan and execute payment for:
                    <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1 flex items-baseline gap-1">
                      <span className="text-emerald-600 dark:text-emerald-450">{countryInfo.symbol}{finalPriceValue} {countryInfo.currency}</span>
                      <span className="text-[10px] text-zinc-400 font-semibold">({PLAN_TEMPLATES.find(p => p.id === selectedPlanId)?.name})</span>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-450 dark:text-zinc-405 leading-snug">
                    UPI VPA: <strong className="font-mono text-zinc-800 dark:text-white select-all">gupta60@yesfam</strong><br/>
                    Recipient: <strong className="text-zinc-805 dark:text-white">DietView Health Premium</strong>
                  </div>
                </div>
              </div>

              {/* UPI Form submission alert triggers */}
              {upiSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium rounded-xl leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{upiSuccessMessage}</span>
                </div>
              )}

              {upiFormError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 font-medium rounded-xl leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{upiFormError}</span>
                </div>
              )}

              {/* Step 3: Enter UPI transaction ID form */}
              <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-3 border-t border-zinc-150 dark:border-zinc-850/65 pt-3.5">
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Step 3: Enter UPI Transaction ID / UTR Reference ID
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. 415392815712, pay_Ok92Hka"
                      value={upiTxId}
                      onChange={(e) => setUpiTxId(e.target.value)}
                      disabled={submittingUpi}
                      required
                      className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-555 focus:bg-zinc-50/50 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider outline-none text-zinc-900 dark:text-zinc-50"
                    />
                    <button
                      type="submit"
                      disabled={submittingUpi}
                      className="px-5 bg-emerald-550 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {submittingUpi ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Submit Receipt"
                      )}
                    </button>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium mt-1.5 block leading-normal">
                    Enter the exact 12-digit transaction number shown on GPay, Paytm, PhonePe, or BHIM receipt.
                  </span>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex flex-col gap-4 text-left animate-fade-in" id="usdt-verification-panel">
              <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-2.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black text-zinc-850 dark:text-zinc-100 uppercase tracking-wider">USDT TRC-20 Crypto Gateway</h4>
              </div>

              {/* Show USDT QR Image */}
              <div className="flex flex-col sm:flex-row items-center gap-4 py-1.5">
                <div className="bg-white p-2 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TPkGRySkf7XsuQJ67sRxgPBQQELZUX3gT8`} 
                    className="w-36 h-36 border-none select-none" 
                    alt="USDT TRC-20 Scan to Pay QR Code" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start leading-none mb-1">
                    Scan via Trust Wallet • Binance • TronLink
                  </span>
                  <div className="text-xs font-medium text-zinc-650 dark:text-zinc-350 leading-normal">
                    Please transfer exactly the required USDT amount over the **TRON TRC-20 NETWORK**:
                    <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1 flex items-baseline gap-1">
                      <span className="text-amber-600 dark:text-amber-450">${usdtPriceClean.toFixed(2)} USDT</span>
                      <span className="text-[10px] text-zinc-400 font-semibold">({PLAN_TEMPLATES.find(p => p.id === selectedPlanId)?.name})</span>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-450 dark:text-zinc-405 leading-snug">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">USDT TRC-20 Wallet Address</span>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <code className="font-mono text-[10.5px] text-zinc-800 dark:text-zinc-200 select-all flex-1 break-all pr-2 font-bold select-all">TPkGRySkf7XsuQJ67sRxgPBQQELZUX3gT8</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("TPkGRySkf7XsuQJ67sRxgPBQQELZUX3gT8");
                          setAddressCopied(true);
                          setTimeout(() => setAddressCopied(false), 2000);
                        }}
                        className="py-1 px-2.5 text-[10px] font-bold rounded-lg border bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all text-zinc-650 dark:text-zinc-350 cursor-pointer shrink-0"
                      >
                        {addressCopied ? "Copied! ✓" : "Copy Address"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* USDT Form submission alert triggers */}
              {upiSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium rounded-xl leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{upiSuccessMessage}</span>
                </div>
              )}

              {upiFormError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 font-medium rounded-xl leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{upiFormError}</span>
                </div>
              )}

              {/* Step 3: Enter USDT transaction hash ID form */}
              <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-3 border-t border-zinc-150 dark:border-zinc-850/65 pt-3.5">
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Step 3: Enter USDT TRC-20 Transaction Hash (TXID)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. 5d52cc6c54784a9e8b0b8c2c842b036ca495d4b53ee9c1e198f24458f334df51"
                      value={upiTxId}
                      onChange={(e) => setUpiTxId(e.target.value)}
                      disabled={submittingUpi}
                      required
                      className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-amber-550 focus:bg-zinc-50/50 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider outline-none text-zinc-900 dark:text-zinc-50"
                    />
                    <button
                      type="submit"
                      disabled={submittingUpi}
                      className="px-5 bg-amber-550 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {submittingUpi ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Submit Hash"
                      )}
                    </button>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium mt-1.5 block leading-normal">
                    Please provide your 64-character TRON transaction identifier (TXID) to allow verification.
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* Verification history list showing both UPI and USDT entries */}
          {userPayments.length > 0 && (
            <div className="bg-zinc-100/45 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 p-4.5 rounded-2xl flex flex-col gap-2.5 text-left" id="user-payment-requests-history">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                <History className="w-3.5 h-3.5" />
                <span>Your License Audits ({userPayments.length})</span>
              </div>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                {userPayments.map((p) => {
                  const isPending = p.status === "pending";
                  const isApproved = p.status === "approved";
                  const isRejected = p.status === "rejected";

                  return (
                    <div key={p.id} className="text-[11px] p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850/60 bg-white dark:bg-zinc-900/40 flex items-center justify-between gap-4">
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-zinc-855 dark:text-zinc-205 flex flex-wrap items-center gap-1.5">
                          <span>{p.planName}</span>
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-black uppercase ${
                            p.paymentMethod === "usdt_trc20"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {p.paymentMethod === "usdt_trc20" ? "USDT" : "UPI"}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-zinc-450 dark:text-zinc-400 truncate mt-0.5" title={p.transactionId}>
                          <span className="font-semibold text-zinc-500 uppercase">TX Ref:</span> <code className="font-mono bg-zinc-50 dark:bg-zinc-950 px-1 py-0.2 border border-zinc-200/50 dark:border-zinc-800 rounded">{p.transactionId}</code>
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-1 block font-medium">Submitted: {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="shrink-0 flex items-center ml-2">
                        {isPending && (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending Audit
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approved 🎉
                          </span>
                        )}
                        {isRejected && (
                          <div className="text-right">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Rejected ❌
                            </span>
                            {p.adminNote && <span className="text-[8px] text-zinc-400 font-semibold block italic mt-0.5 max-w-[120px] truncate" title={p.adminNote}>{p.adminNote}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-medium mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit encrypted data tunnel. Cancel or modify anytime safely.</span>
          </div>
      </motion.div>
    </div>
  );
}
