import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile } from "./calories";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  name: string;
  quantity: string;
  estimatedCalories: number;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  rawText: string;
  items: FoodItem[];
  totalCalories: number;
  confidence: "high" | "medium" | "low";
  createdAt: string; // ISO timestamp
}

const PROFILE_KEY = "calorie-tracker:profile";
const MEALS_KEY = "calorie-tracker:meals";

export async function getProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getAllMeals(): Promise<MealEntry[]> {
  const raw = await AsyncStorage.getItem(MEALS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getMealsForDate(date: string): Promise<MealEntry[]> {
  const meals = await getAllMeals();
  return meals.filter((m) => m.date === date);
}

export async function addMeal(entry: MealEntry): Promise<void> {
  const meals = await getAllMeals();
  meals.push(entry);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));
}

export async function deleteMeal(id: string): Promise<void> {
  const meals = await getAllMeals();
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals.filter((m) => m.id !== id)));
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
