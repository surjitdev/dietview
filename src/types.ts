export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  dietaryPreference: string;
  waterTarget: number; // in Litres, e.g. 2.5
  country?: string; // e.g. "India", "Japan", etc.
  mealReminders: string; // "Breakfast, Lunch, Dinner"
  waterActive: boolean;
  waterRemindersEnabled?: boolean;
  isPremium?: boolean;
  trialActive?: boolean;
  trialStartDate?: string;
  subscriptionExpiry?: string;
  aiGenerationsCount?: number;
  streakDays: number;
  profilePic?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amount: number; // in ML, e.g. 250
  createdAt: string;
}

export interface SharedPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  mealDetails?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  privacy: "public" | "friends" | "private";
  timestamp: string;
  likes: string[]; // List of userIds who liked it
}

export interface MealDetail {
  mealType: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
}

export interface MealRecommendation {
  suggestedCalories: number;
  suggestedProtein: number;
  suggestedCarbs: number;
  suggestedFats: number;
  rationale: string;
  meals: MealDetail[];
}

export interface UpiPaymentModel {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: "trial" | "monthly" | "yearly";
  planName: string;
  price: number;
  currency: string;
  transactionId: string;
  paymentMethod?: "upi" | "usdt_trc20";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  adminNote?: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight: number; // e.g. 68.5
  createdAt: string;
}

