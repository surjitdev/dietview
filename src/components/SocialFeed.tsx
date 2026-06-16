import React, { useState } from "react";
import { 
  Share2, 
  Heart, 
  MessageSquare, 
  Lock, 
  Globe, 
  Users, 
  Plus, 
  Smile, 
  Check, 
  Send,
  EyeOff
} from "lucide-react";
import { UserProfile, SharedPost } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SocialFeedProps {
  user: UserProfile;
  posts: SharedPost[];
  onAddPost: (text: string, privacy: "public" | "friends" | "private", mealDetails?: string, cal?: number, protein?: number, carbs?: number) => void;
  onLikePost: (postId: string) => void;
}

// Baseline placeholder posts to make community feel alive straightaway
const DEMO_COMMUNITY_POSTS: SharedPost[] = [
  {
    id: "demo-post-1",
    userId: "user-2",
    userName: "Mark Peterson",
    userPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    text: "Hit my hypertrophy goals today perfectly! Checked my macros and made sure to load up 160g wholesome protein. Smashed chest workout this afternoon.",
    mealDetails: "Seared Cod & Brown Basmati Rice Bowl",
    calories: 620,
    protein: 48,
    carbs: 65,
    privacy: "public",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: ["demo-mock-like-usr"]
  },
  {
    id: "demo-post-2",
    userId: "user-3",
    userName: "Clara Green",
    userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    text: "Tried out a new recipe suggested by the AI Advisor: avocado smashed toast with poached egg! Delighted to keep my vegetarian deficit goal intact! Highly recommend computing customized meal plans.",
    mealDetails: "AI Smashed Avocado Toast Recipe",
    calories: 340,
    protein: 12,
    carbs: 28,
    privacy: "public",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes: []
  },
  {
    id: "demo-post-3",
    userId: "user-4",
    userName: "Alex Jenkins",
    userPhoto: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    text: "Weekly progressive targets update - dropped 1.2kg bodyweight while maintaining solid strength. Consistency with hydration did wonders for clearing up metabolic fatigue.",
    mealDetails: "",
    privacy: "public",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    likes: ["demo-mock-like-usr-2", "demo-mock-like-usr-3"]
  }
];

export default function SocialFeed({ user, posts, onAddPost, onLikePost }: SocialFeedProps) {
  // Post composing hooks
  const [postText, setPostText] = useState("");
  const [mealDetails, setMealDetails] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">("public");
  
  const [isComposing, setIsComposing] = useState(false);
  const [isLoggedComposed, setIsLoggedComposed] = useState(false);

  // Blend community feed posts securely (Database posts + Fallback presets)
  const blendedPosts = [...posts, ...DEMO_COMMUNITY_POSTS].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;

    onAddPost(
      postText,
      privacy,
      mealDetails || undefined,
      calories ? parseInt(calories) : undefined,
      protein ? parseInt(protein) : undefined,
      carbs ? parseInt(carbs) : undefined
    );

    // Reset controls
    setPostText("");
    setMealDetails("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setIsComposing(false);
    setIsLoggedComposed(true);
    setTimeout(() => setIsLoggedComposed(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6" id="social-feed-tab-view">
      <div className="flex justify-between items-center" id="social-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Community Sprout</h2>
          <p className="text-xs text-on-surface-variant font-medium">
            Share progress and health updates with your circle under complete privacy control.
          </p>
        </div>
        <button 
          onClick={() => setIsComposing(!isComposing)}
          className="bg-primary hover:bg-opacity-90 text-on-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow"
        >
          <Plus className="w-4 h-4" /> Share Update
        </button>
      </div>

      {/* Sharing Update Composer Panel */}
      <AnimatePresence>
        {isComposing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            id="composer-panel-expanded"
          >
            <form onSubmit={handleSubmitPost} className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-3.5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant">Update post description</label>
                  
                  {/* Privacy state controls */}
                  <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5">
                    <button 
                      type="button"
                      onClick={() => setPrivacy("public")}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all ${privacy === "public" ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
                    >
                      <Globe className="w-3 h-3" /> Public
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPrivacy("friends")}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all ${privacy === "friends" ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
                    >
                      <Users className="w-3 h-3" /> Friends
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPrivacy("private")}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all ${privacy === "private" ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
                    >
                      <Lock className="w-3 h-3" /> Private
                    </button>
                  </div>
                </div>

                <textarea 
                  required
                  placeholder="Just finished lunch catalog! Proudly logged, hit my water counts today... "
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface-container px-3.5 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary resize-none h-20"
                />
              </div>

              {/* Optional tagged meal metrics collapsible parameters */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Tag a Logged Meal (Optional)</span>
                
                <input 
                  type="text" 
                  placeholder="e.g. Avocado Toast with Egg" 
                  value={mealDetails}
                  onChange={(e) => setMealDetails(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-background px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none mb-3"
                />

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[8px] font-bold uppercase text-on-surface-variant block mb-1">Calories (kcal)</label>
                    <input 
                      type="number" 
                      placeholder="340" 
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full text-[11px] font-bold bg-white dark:bg-background px-3 py-2 rounded-xl border border-outline-variant/20"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold uppercase text-on-surface-variant block mb-1">Protein (g)</label>
                    <input 
                      type="number" 
                      placeholder="12" 
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full text-[11px] font-bold bg-white dark:bg-background px-3 py-2 rounded-xl border border-outline-variant/20"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold uppercase text-on-surface-variant block mb-1">Carbs (g)</label>
                    <input 
                      type="number" 
                      placeholder="28" 
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full text-[11px] font-bold bg-white dark:bg-background px-3 py-2 rounded-xl border border-outline-variant/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end" id="composer-actions">
                <button 
                  type="button" 
                  onClick={() => setIsComposing(false)}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-bold text-xs py-2.5 px-4 rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-opacity-90 text-on-primary font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow cursor-pointer border-none outline-none"
                >
                  Publish Post <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoggedComposed && (
        <div className="bg-primary-container/20 text-primary text-xs font-bold p-3.5 rounded-xl border border-primary/10 flex items-center justify-center gap-1.5 shadow-inner">
          <Check className="w-4 h-4" /> Healthy update posted into the sprout timeline!
        </div>
      )}

      {/* Social Timeline Listing */}
      <div className="flex flex-col gap-4.5" id="social-timeline-scroller">
        {blendedPosts.map((post) => (
          <div 
            key={post.id}
            className="bg-surface card-elevation-1 rounded-xl p-5 border border-outline-variant/10 flex flex-col gap-3.5"
            id={`post-envelope-${post.id}`}
          >
            {/* Post Header with identity information and avatar */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-surface bg-surface-container-high shrink-0">
                  <img src={post.userId === user.userId ? (user.profilePic || post.userPhoto) : post.userPhoto} alt={post.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block leading-tight">{post.userName}</span>
                  <div className="flex items-center gap-1 mt-0.5 text-[9px] text-on-surface-variant font-semibold">
                    <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 uppercase">
                      {post.privacy === "public" ? <Globe className="w-2.5 h-2.5" /> : post.privacy === "friends" ? <Users className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      {post.privacy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Text Description */}
            <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap">{post.text}</p>

            {/* Meal Attachment Display Tag Section */}
            {post.mealDetails && (
              <div className="bg-surface-container-low rounded-2xl p-3.5 border border-primary/5 flex justify-between items-center shadow-inner">
                <div>
                  <span className="text-[8px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Meal Log Tag</span>
                  <span className="text-xs font-extrabold text-on-surface block mt-1.5">{post.mealDetails}</span>
                  {post.protein !== undefined && (
                    <span className="text-[9px] text-on-surface-variant block mt-0.5">
                      Mac: P: {post.protein}g • C: {post.carbs}g
                    </span>
                  )}
                </div>
                {post.calories !== undefined && (
                  <div className="text-right">
                    <span className="text-[9px] text-on-surface-variant uppercase block font-bold leading-none mb-1">Energy Log</span>
                    <span className="text-sm font-extrabold text-primary">{post.calories} kcal</span>
                  </div>
                )}
              </div>
            )}

            {/* Interaction Footer Actions */}
            <div className="border-t border-outline-variant/10 pt-3 flex items-center justify-between mt-1 text-on-surface-variant">
              <button 
                onClick={() => onLikePost(post.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg hover:bg-surface-container transition-all cursor-pointer ${post.likes.includes(user.userId) ? 'text-error font-bold' : ''}`}
              >
                <Heart className={`w-4 h-4 ${post.likes.includes(user.userId) ? 'fill-error text-error' : ''}`} /> 
                <span>{post.likes.length} Likes</span>
              </button>

              <div className="flex gap-1.5 text-xs text-on-surface-variant font-medium">
                <MessageSquare className="w-4 h-4" /> <span>Comment disabled for privacy</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
