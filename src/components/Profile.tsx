import React, { useState, useRef } from "react";
import { 
  Edit3, 
  Trash2, 
  Settings, 
  Bookmark, 
  ChevronRight, 
  Lock, 
  Droplet,
  Utensils,
  LogOut,
  Sparkles,
  Check,
  Award,
  Flame,
  User,
  Camera,
  Upload,
  AlertCircle
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

export default function Profile({ user, onUpdateUser, onLogout }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  
  // Drag and drop / base64 states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File uploads and canvas compression
  const handleProfilePicChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("This file type is not supported. Please upload an image (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image is too large. Please select an image under 8MB.");
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const SIZE = 240; // Output bounds standard square
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          onUpdateUser({
            ...user,
            profilePic: compressedBase64,
          });
          setIsSavedNotice(true);
          setTimeout(() => setIsSavedNotice(false), 3000);
        }
      };
      img.onerror = () => {
        setUploadError("Failed to parse image element.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError("Could not read file data.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProfilePicChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProfilePicChange(e.target.files[0]);
    }
  };

  // Edit fields states
  const [editName, setEditName] = useState(user.name);
  const [editAge, setEditAge] = useState(user.age.toString());
  const [editWeight, setEditWeight] = useState(user.weight.toString());
  const [editHeight, setEditHeight] = useState(user.height.toString());
  const [editCalories, setEditCalories] = useState(user.calorieTarget.toString());
  const [editProtein, setEditProtein] = useState(user.proteinTarget.toString());
  const [editCarbs, setEditCarbs] = useState(user.carbTarget.toString());
  const [editFats, setEditFats] = useState(user.fatTarget.toString());
  const [editDietStyle, setEditDietStyle] = useState(user.dietaryPreference);
  const [editWaterTarget, setEditWaterTarget] = useState(user.waterTarget.toString());
  const [editMealReminders, setEditMealReminders] = useState(user.mealReminders);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: editName,
      age: parseInt(editAge) || user.age,
      weight: parseFloat(editWeight) || user.weight,
      height: parseFloat(editHeight) || user.height,
      calorieTarget: parseInt(editCalories) || user.calorieTarget,
      proteinTarget: parseInt(editProtein) || user.proteinTarget,
      carbTarget: parseInt(editCarbs) || user.carbTarget,
      fatTarget: parseInt(editFats) || user.fatTarget,
      dietaryPreference: editDietStyle,
      waterTarget: parseFloat(editWaterTarget) || user.waterTarget,
      mealReminders: editMealReminders,
    });
    setIsEditing(false);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // Quick helper to flip the interactive Water Tracking toggle
  const handleToggleWater = () => {
    onUpdateUser({
      ...user,
      waterActive: !user.waterActive
    });
  };

  return (
    <div className="flex flex-col gap-6" id="profile-tab-view">
      
      {/* User Identity Header from Wireframe */}
      <section className="flex flex-col items-center pt-4 pb-2" id="profile-demographics-section">
        <div className="relative mb-4 group" id="profile-avatar-container">
          {/* Hidden input element */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            accept="image/*" 
            className="hidden" 
            id="profile-picture-native-input"
          />
          
          {/* Main Drag-and-Drop Image Frame with Glow Effects */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-28 h-28 rounded-full overflow-hidden border-4 transition-all duration-300 relative cursor-pointer shadow-lg flex items-center justify-center bg-surface-container-high ${
              dragActive 
                ? 'border-primary ring-8 ring-primary/20 scale-105' 
                : 'border-white dark:border-surface-container hover:border-primary-container'
            }`}
            id="draggable-profile-avatar-frame"
          >
            {/* Background Profile Thumbnail */}
            <img 
              alt="User profile pic" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              src={user.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"} 
              referrerPolicy="no-referrer"
              id="actual-avatar-img"
            />

            {/* Hover overlay explaining select on click / drag & drop */}
            <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${dragActive ? 'opacity-100' : ''}`}>
              <Camera className="w-5 h-5 text-white animate-bounce" />
              <span className="text-[9px] text-white font-black uppercase tracking-wider text-center px-1 leading-none">
                {dragActive ? "Drop here!" : "Upload Photo"}
              </span>
              <span className="text-[7px] text-zinc-300 font-medium tracking-wide">Click or Drag</span>
            </div>
          </div>

          {/* Trigger button for profile picture modification */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary hover:bg-opacity-95 text-on-primary w-8.5 h-8.5 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface cursor-pointer transform active:scale-90 transition-transform"
            title="Upload custom profile photo"
            id="avatar-upload-trigger-pencil"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Visual Upload Error Indicator if file is unaligned */}
        {uploadError && (
          <div className="flex items-center gap-1.5 bg-error/10 text-error text-[10px] uppercase font-bold py-1 px-3.5 rounded-full mb-3 shadow-sm border border-error/10 animate-fade-in" id="profile-upload-error-tag">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
          </div>
        )}
        
        <h2 className="text-xl sm:text-2xl font-bold text-on-surface text-center" id="profile-name-label">{user.name}</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">{user.email}</p>

        {/* Highlight Age Weight Height Chips */}
        <div className="flex gap-4 mt-6" id="demographic-chips-container">
          <div className="bg-surface-container rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[85px] border border-outline-variant/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Age</span>
            <span className="text-lg font-extrabold text-on-surface mt-0.5">{user.age}</span>
          </div>
          <div className="bg-surface-container rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[85px] border border-outline-variant/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Weight</span>
            <span className="text-lg font-extrabold text-on-surface mt-0.5">
              {user.weight} <span className="text-xs font-semibold text-on-surface-variant">kg</span>
            </span>
          </div>
          <div className="bg-surface-container rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[85px] border border-outline-variant/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Height</span>
            <span className="text-lg font-extrabold text-on-surface mt-0.5">
              {user.height} <span className="text-xs font-semibold text-on-surface-variant">cm</span>
            </span>
          </div>
        </div>
      </section>

      {/* COMPANION INTERACTIVE DEMOGRAPHICS EDITOR FORM */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            id="editor-dropdown-container"
          >
            <form onSubmit={handleSave} className="bg-surface border border-outline-variant/30 card-elevation-1 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                <span className="text-xs font-bold text-primary uppercase">Demographics & Targets Tuning</span>
                <span className="text-[10px] text-on-surface-variant font-medium">Configure customized diet profile targets.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    required
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Age</label>
                  <input 
                    type="number" 
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Height (cm)</label>
                  <input 
                    type="number" 
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Calories (kcal)</label>
                  <input 
                    type="number" 
                    value={editCalories}
                    onChange={(e) => setEditCalories(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    value={editProtein}
                    onChange={(e) => setEditProtein(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-on-surface-variant block mb-1">Fats (g)</label>
                  <input 
                    type="number" 
                    value={editFats}
                    onChange={(e) => setEditFats(e.target.value)}
                    className="w-full text-xs font-bold bg-white px-2.5 py-2 rounded-lg border border-outline-variant/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Diet Style Filter</label>
                  <input 
                    type="text" 
                    value={editDietStyle}
                    onChange={(e) => setEditDietStyle(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Water Target (Liters)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editWaterTarget}
                    onChange={(e) => setEditWaterTarget(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Meal Reminders</label>
                  <input 
                    type="text" 
                    value={editMealReminders}
                    onChange={(e) => setEditMealReminders(e.target.value)}
                    className="w-full text-xs font-semibold bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end" id="editor-form-buttons">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-opacity-90 text-on-primary font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 border-none outline-none"
                >
                  Apply Demographic Changes <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isSavedNotice && (
        <div className="bg-primary-container/20 text-primary text-xs font-bold p-3.5 rounded-xl border border-primary/10 flex items-center justify-center gap-1.5 shadow-inner">
          <Check className="w-4 h-4" /> Customized targets applied successfully!
        </div>
      )}

      {/* Target goals section matching profile wireframe */}
      <section className="flex flex-col gap-4" id="target-goals-wireframe-pane">
        <div className="flex justify-between items-end">
          <h3 className="text-md font-bold text-on-surface tracking-tight uppercase tracking-wider text-[11px] text-on-surface-variant">Daily Targets</h3>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-primary text-[10px] font-bold uppercase flex items-center gap-1 hover:underline"
          >
            Edit <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" id="wireframe-targets-rows">
          {/* Calorie Card */}
          <div className="sm:col-span-2 bg-surface card-elevation-1 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:card-elevation-2 transition-all duration-300 border border-outline-variant/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-105"></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block">Calories</span>
                <span className="text-2xl font-extrabold text-primary block mt-1.5" id="calories-display">
                  {user.calorieTarget.toLocaleString()}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium mt-0.5 block">kcal / day</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center">
                <Flame className="w-5 h-5 fill-primary" />
              </div>
            </div>

            <div className="mt-5 relative z-10">
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "75%" }}></div>
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
                <span>Deficit goal</span>
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Protein Card */}
          <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-secondary-container/20 flex flex-col justify-between min-h-[140px] group hover:card-elevation-2 transition-all">
            <div>
              <span className="text-[9px] font-bold text-secondary-container uppercase tracking-widest block">Protein</span>
              <span className="text-xl font-extrabold text-on-surface block mt-1.5">{user.proteinTarget}g</span>
            </div>
            <div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-secondary-container h-full rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="bg-surface card-elevation-1 rounded-xl p-5 border border-tertiary-container/20 flex flex-col justify-between min-h-[140px] group hover:card-elevation-2 transition-all">
            <div>
              <span className="text-[9px] font-bold text-tertiary-container uppercase tracking-widest block">Carbs</span>
              <span className="text-xl font-extrabold text-on-surface block mt-1.5">{user.carbTarget}g</span>
            </div>
            <div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-tertiary-container h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences List matching wireframe layout */}
      <section className="flex flex-col gap-4" id="preferences-wireframe-pane">
        <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Preferences</h3>
        
        <div className="bg-surface card-elevation-1 rounded-xl overflow-hidden divide-y divide-outline-variant/10 border border-outline-variant/15">
          {/* Item: Dietary Preference */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all cursor-pointer group" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center group-hover:bg-primary-container group-hover:text-primary transition-colors">
                <Utensils className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">Dietary Preference</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">{user.dietaryPreference || "No Restrictions"}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </div>

          {/* Item: Water Tracking */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center">
                <Droplet className="w-5 h-5 text-tertiary fill-tertiary-container" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">Water Tracking</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">Daily Goal: {user.waterTarget.toFixed(1)} L</span>
              </div>
            </div>

            {/* Custom iOS Slidings toggle switches */}
            <div className="flex items-center">
              <button 
                type="button"
                onClick={handleToggleWater} 
                className={`w-12 h-6.5 rounded-full p-1.5 transition-colors duration-300 relative focus:outline-none cursor-pointer ${user.waterActive ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 absolute top-1 ${user.waterActive ? 'left-6.5' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Item: Meal Reminders */}
          <div className="p-4.5 flex items-center justify-between hover:bg-surface-container-lowest transition-all cursor-pointer group" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center group-hover:bg-primary-container group-hover:text-primary transition-colors">
                <Settings className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block">Meal Reminders</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">{user.mealReminders}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </div>
        </div>
      </section>

      {/* Achievement badges horizontal scroll layout matching wireframe */}
      <section className="flex flex-col gap-4 pb-4" id="achievements-scroll-pane">
        <div className="flex justify-between items-center">
          <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Achievements</h3>
          <span className="text-primary text-[10px] font-bold uppercase hover:underline cursor-pointer">View All</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3.5 snap-x snap-mandatory hide-scrollbar -mx-6 px-6" id="badges-scroller">
          {/* Badge 1 */}
          <div className="snap-start shrink-0 w-32 bg-surface border border-secondary-container/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/10 to-transparent"></div>
            <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center shadow relative z-10">
              <Flame className="w-5.5 h-5.5 fill-white" />
            </div>
            <div className="relative z-10 mt-1">
              <div className="text-[11px] font-bold text-on-surface">7 Day Streak</div>
              <div className="text-[8px] font-semibold text-on-surface-variant mt-0.5">Logged every meal</div>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="snap-start shrink-0 w-32 bg-surface border border-tertiary-container/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/10 to-transparent"></div>
            <div className="w-11 h-11 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow relative z-10">
              <Droplet className="w-5.5 h-5.5 fill-white" />
            </div>
            <div className="relative z-10 mt-1">
              <div className="text-[11px] font-bold text-on-surface">Hydro Hero</div>
              <div className="text-[8px] font-semibold text-on-surface-variant mt-0.5">Hit water goal 5x</div>
            </div>
          </div>

          {/* Badge 3 (Locked) */}
          <div className="snap-start shrink-0 w-32 bg-surface-container-low border border-outline-variant/15 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden opacity-60">
            <div className="w-11 h-11 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center relative z-10">
              <Lock className="w-5 h-5" />
            </div>
            <div className="relative z-10 mt-1">
              <div className="text-[11px] font-bold text-on-surface">Macro Master</div>
              <div className="text-[8px] font-semibold text-on-surface-variant mt-0.5">Hit macros perfectly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Wireframe Log Out Button */}
      <button 
        onClick={onLogout}
        className="w-full py-3.5 border border-error text-error hover:bg-error-container/10 active:scale-95 duration-100 rounded-full font-bold text-sm tracking-tight transition-colors cursor-pointer mt-2"
        id="profile-logout-btn"
      >
        Log Out
      </button>
    </div>
  );
}
