import type { FoodItem, MealType } from "./storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
const APP_SHARED_SECRET = process.env.EXPO_PUBLIC_APP_SHARED_SECRET ?? "";

export interface ParseMealResult {
  items: FoodItem[];
  totalCalories: number;
  mealType: MealType;
  confidence: "high" | "medium" | "low";
}

export async function parseMeal(text: string, mealType: MealType): Promise<ParseMealResult> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/parse-meal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APP_SHARED_SECRET}`,
    },
    body: JSON.stringify({ text, mealType }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Meal parsing failed (${response.status}): ${body}`);
  }

  return response.json();
}
