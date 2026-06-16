import React, { useState, useRef, useEffect } from "react";
import { 
  Apple, 
  Send, 
  X, 
  Trash2, 
  Sparkles, 
  Loader,
  ChevronDown
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

interface DietAIChatbotProps {
  user: UserProfile;
  onOpenPricing: () => void;
}

export default function DietAIChatbot({ user, onOpenPricing }: DietAIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string; timestamp: string }[]>(() => {
    const saved = localStorage.getItem("dietview_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    
    const defaultIntro = `Hello ${user.name || "friend"}! 👋

I'm **Diet AI**, your 24/7 fitness coach and meal strategist.

Ask me for fat-loss splits, low-fat recipes, deficit budgets, or nutritional assessments. Let's hit those health targets together!`;
    return [{ role: "assistant", content: defaultIntro, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
  });

  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Free chats counter (Limit of 30 messages for non-premium accounts)
  const [freeChatCount, setFreeChatCount] = useState<number>(() => {
    const saved = localStorage.getItem("dietview_free_chat_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  const isPremiumUser = user.isPremium === true || 
    (user.trialActive === true && user.trialStartDate && 
     (Date.now() - new Date(user.trialStartDate).getTime() < 3 * 24 * 60 * 60 * 1000));

  // Save chat history to local storage
  useEffect(() => {
    localStorage.setItem("dietview_chat_history", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen]);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    // Check message quota
    if (!isPremiumUser && freeChatCount >= 30) {
      onOpenPricing();
      return;
    }

    const userMsg = chatInput.trim();
    setChatInput("");

    const updatedMessages = [
      ...chatMessages,
      { 
        role: "user" as const, 
        content: userMsg, 
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
      }
    ];

    setChatMessages(updatedMessages);
    setChatLoading(true);

    if (!isPremiumUser) {
      const nextCount = freeChatCount + 1;
      setFreeChatCount(nextCount);
      localStorage.setItem("dietview_free_chat_count", String(nextCount));
    }

    try {
      const res = await fetch("/api/diet-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: updatedMessages.slice(0, -1).map(m => ({ 
            role: m.role === "assistant" ? "assistant" : "user", 
            content: m.content 
          })),
          userProfile: user
        })
      });

      if (!res.ok) {
        throw new Error("Our coaching servers are busy. Let's retry in a second!");
      }

      const data = await res.json();
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: data.reply || "I am processing. Please share your metric details!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err: any) {
      console.error("Coaching chat failed:", err);
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: `⚠️ **Connection issue**: ${err.message || "Coaching server offline. Try again!"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Do you want to reset your conversation history with Diet AI?")) {
      const intro = `Hello ${user.name || "friend"}! 👋

I'm **Diet AI**, your 24/7 fitness coach and meal strategist.

How can I fuel your wellness targets today?`;
      
      const res = [{
        role: "assistant" as const,
        content: intro,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }];
      setChatMessages(res);
      localStorage.setItem("dietview_chat_history", JSON.stringify(res));
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (chatLoading) return;
    setChatInput(prompt);
  };

  return (
    <>
      {/* Floating Apple-like Logo Button */}
      <div className="fixed bottom-24 right-5 sm:bottom-28 sm:right-6 z-40 select-none" id="floating-diet-ai-bubble-anchor">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all ${
            isOpen 
              ? "bg-zinc-900 border border-zinc-800 text-red-500 shadow-xl" 
              : "bg-gradient-to-tr from-rose-500 to-red-650 text-white shadow-[0_4px_20px_rgba(239,68,68,0.35)]"
          }`}
          title="Diet AI Assistant"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Apple className="w-5.5 h-5.5 fill-current text-white drop-shadow-sm animate-pulse" />
              {/* Optional tiny notification dot */}
              {!isPremiumUser && freeChatCount < 30 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-zinc-950 font-black text-[7.5px] px-1 rounded-full border border-red-500 leading-none py-0.5">
                  AI
                </span>
              )}
            </div>
          )}
        </motion.button>
      </div>

      {/* Expanded Mini Panel with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 35 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed right-4 bottom-38 sm:right-6 sm:bottom-42 z-40 w-[90vw] max-w-[325px] h-[390px] bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2.5xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden"
            id="diet-ai-chat-drawer"
          >
            {/* Header */}
            <div className="px-3.5 py-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-zinc-950/20 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-left">
                <div className="w-7.5 h-7.5 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Apple className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-[12.5px] font-black text-zinc-900 dark:text-zinc-100 leading-tight">Diet AI Advisor</h4>
                  <span className="text-[9.5px] text-zinc-450 dark:text-zinc-400 font-bold flex items-center gap-1 leading-none mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Coach Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear Chat History"
                  className="w-7 h-7 rounded-lg border border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="w-7 h-7 rounded-lg border border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quota Gauge */}
            {!isPremiumUser && (
              <div className="bg-amber-50/80 dark:bg-amber-950/20 border-b border-amber-100/40 dark:border-amber-950/40 px-3 py-1.5 flex justify-between items-center text-[10px] font-bold text-amber-800 dark:text-amber-400 shrink-0">
                <span>Free Tier Quota: {freeChatCount}/30 asks</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenPricing();
                  }}
                  className="text-[9.5px] font-black underline hover:text-amber-600 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Go Premium 👑
                </button>
              </div>
            )}

            {/* Scrollable conversation box */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-50/10 dark:bg-zinc-950/10 flex flex-col no-scrollbar">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 max-w-[88%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}
                >
                  <div className="flex flex-col">
                    <div
                      className={`p-2.5 rounded-2xl text-[11px] font-semibold leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-on-primary rounded-tr-none shadow-sm font-sans"
                          : "bg-surface border border-zinc-100 dark:border-zinc-800 text-zinc-850 dark:text-zinc-200 rounded-tl-none shadow-sm"
                      }`}
                    >
                      <div className="markdown-body text-left">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-2 max-w-[85%] self-start pb-2">
                  <div className="p-2.5 rounded-2xl rounded-tl-none bg-surface border border-zinc-100 dark:border-zinc-800 text-zinc-500 text-[10px] font-bold flex items-center gap-2">
                    <Loader className="w-3 h-3 animate-spin text-primary" />
                    <span>Diet AI is drafting...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Micro Prompt Suggestions */}
            {chatMessages.length <= 1 && !chatLoading && (
              <div className="p-1.5 bg-zinc-55/10 dark:bg-zinc-950/30 border-t border-zinc-100 dark:border-zinc-800/40 flex gap-1.5 shrink-0 overflow-x-auto select-none no-scrollbar">
                {[
                  "Suggest 500kcal high-protein foods",
                  "Suggest quick 20-min cardio setup",
                  "Healthy midnight snack items?"
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-[9px] font-black text-zinc-650 bg-white hover:bg-zinc-50 border border-zinc-200 dark:text-zinc-355 dark:bg-zinc-850 dark:border-zinc-800 whitespace-nowrap px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input */}
            <form
              onSubmit={handleSendChat}
              className="p-2 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-zinc-950/20 flex gap-1.5 shrink-0 items-center"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading || (!isPremiumUser && freeChatCount >= 30)}
                placeholder={
                  !isPremiumUser && freeChatCount >= 30
                    ? "Quota filled. Upgrade to premium!"
                    : "Ask anything about metrics, diet..."
                }
                className="flex-1 text-[11px] font-semibold px-3 py-2 rounded-xl bg-surface border border-zinc-200 dark:border-zinc-800/80 focus:outline-none focus:border-primary placeholder-zinc-400 dark:placeholder-zinc-500 disabled:opacity-65"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading || (!isPremiumUser && freeChatCount >= 30)}
                className="p-2 rounded-xl bg-primary text-on-primary hover:bg-primary/95 disabled:bg-zinc-200 dark:disabled:bg-zinc-850 disabled:text-zinc-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
