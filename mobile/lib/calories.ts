export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type GoalType = "lose" | "maintain" | "gain";

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT_KCAL: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function calculateBmr(profile: Pick<Profile, "sex" | "age" | "heightCm" | "weightKg">): number {
  const { sex, age, heightCm, weightKg } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTdee(profile: Profile): number {
  return calculateBmr(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}

export function calculateDailyBudget(profile: Profile): number {
  const tdee = calculateTdee(profile);
  return Math.round(tdee + GOAL_ADJUSTMENT_KCAL[profile.goal]);
}
