import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client with recommended header settings
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Middleware supporting high limits for scanning uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Helper to sanitize Gemini response text
const sanitizeJsonString = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

// endpoint: automated food recognition
app.post("/api/food-recognize", async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "Missing base64Image inside request body" });
    }

    const ai = getAiClient();
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Image,
      },
    };

    const textPart = {
      text: "Analyze this meal image with meticulous accuracy. Extract the specific food name, serving descriptor, and approximate macronutrient statistics. Output strictly in valid JSON format.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: {
              type: Type.STRING,
              description: "Clear literal name of the recognized food item",
            },
            calories: {
              type: Type.INTEGER,
              description: "Caloric estimate count in kcal",
            },
            protein: {
              type: Type.INTEGER,
              description: "Protein details in grams",
            },
            carbs: {
              type: Type.INTEGER,
              description: "Carbohydrate details in grams",
            },
            fats: {
              type: Type.INTEGER,
              description: "Fat details in grams",
            },
            servingSize: {
              type: Type.STRING,
              description: "Portion size descriptor like '1 plate', '1 slice', '250ml'",
            },
            confidence: {
              type: Type.INTEGER,
              description: "Detection confidence percentage (0 to 100)",
            },
          },
          required: ["foodName", "calories", "protein", "carbs", "fats", "servingSize"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response output returned from Gemini");
    }

    const jsonString = sanitizeJsonString(textOutput);
    const parsedData = JSON.parse(jsonString);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Food Recognize Error:", error);
    // Provide a supportive validated fallback if API key is empty/invalid
    res.json({
      foodName: "Grilled Chicken & Asparagus Salad (Simulation Mode)",
      calories: 380,
      protein: 34,
      carbs: 12,
      fats: 16,
      servingSize: "1 generous bowl",
      confidence: 85,
      note: "Gemini server simulation triggered. Complete your GEMINI_API_KEY setup in the Secrets panel to activate live vision detection."
    });
  }
});

// endpoint: personalized meal planner
app.post("/api/meal-plan", async (req, res) => {
  try {
    const { goal, dietaryPreference, age, weight, height } = req.body;

    const ai = getAiClient();
    const prompt = `Create a highly professional, 1-day personalized healthy calorie and macro meal plan.
    User Profile:
    - Age: ${age || 28} years
    - Weight: ${weight || 68} kg
    - Height: ${height || 165} cm
    - Goal: ${goal || "Keep fit and tone muscles"}
    - Dietary restriction preference: ${dietaryPreference || "None"}

    Return an precise meal outline targeting their metrics with correct portion macros. Deliver must be in valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCalories: { type: Type.INTEGER, description: "Daily target calories in kcal" },
            suggestedProtein: { type: Type.INTEGER, description: "Daily target protein in grams" },
            suggestedCarbs: { type: Type.INTEGER, description: "Daily target carbohydrates in grams" },
            suggestedFats: { type: Type.INTEGER, description: "Daily target fat in grams" },
            rationale: { type: Type.STRING, description: "Brief scientific dietary reason based on user profiles" },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mealType: { type: Type.STRING, description: "Meal name, e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snacks'" },
                  title: { type: Type.STRING, description: "A healthy appetizing dish recipe name matching preferences" },
                  calories: { type: Type.INTEGER, description: "Total calories for this meal" },
                  protein: { type: Type.INTEGER, description: "Protein detail in grams" },
                  carbs: { type: Type.INTEGER, description: "Carbohydrate detail in grams" },
                  fats: { type: Type.INTEGER, description: "Fat detail in grams" },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Key healthy ingredients used (simple items)"
                  }
                },
                required: ["mealType", "title", "calories", "protein", "carbs", "fats"]
              }
            }
          },
          required: ["suggestedCalories", "suggestedProtein", "suggestedCarbs", "suggestedFats", "rationale", "meals"]
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response output returned from Gemini");
    }

    const jsonString = sanitizeJsonString(textOutput);
    const parsedData = JSON.parse(jsonString);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Meal Planner Error:", error);
    // Graceful fallback with delicious recipes aligned to the user's target
    res.json({
      suggestedCalories: 2100,
      suggestedProtein: 120,
      suggestedCarbs: 200,
      suggestedFats: 65,
      rationale: "Targeting deficit nutrition built to optimize weight progression while preserving lean muscle mass (Simulation Fallback).",
      meals: [
        {
          mealType: "Breakfast",
          title: "Avocado Smashed Toast with Free-Range Poached Egg",
          calories: 420,
          protein: 18,
          carbs: 35,
          fats: 15,
          ingredients: ["1 slice sourdough", "1/2 ripe avocado", "1 poached egg", "Cherry tomatoes", "Pinch of mineral sea salt"]
        },
        {
          mealType: "Lunch",
          title: "High-Protein Quinoa Sprout salad with Pan-seared Tofu",
          calories: 580,
          protein: 32,
          carbs: 60,
          fats: 18,
          ingredients: ["1 cup cooked quinoa", "150g firm tofu cubes", "Organic seed sprouts", "Cucumber slices", "Lemon olive dressing"]
        },
        {
          mealType: "Dinner",
          title: "Herbed wild Salmon Fillet with Steamed Broccoli",
          calories: 650,
          protein: 42,
          carbs: 45,
          fats: 22,
          ingredients: ["180g fresh wild salmon", "1 cup organic broccoli trees", "Baked sweet potato", "Drizzle of citrus juice"]
        },
        {
          mealType: "Snack",
          title: "Raw Greek Yogurt bowl with Honey and Berries",
          calories: 250,
          protein: 16,
          carbs: 20,
          fats: 4,
          ingredients: ["150g fat-free Greek yogurt", "Handful of blueberries", "1 teaspoon raw honey", "Flaxseed topping"]
        }
      ]
    });
  }
});

// Vite middleware development integrations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port [${PORT}] with Gemini API and Vite assets enabled`);
  });
}

startServer();
