import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import type { ActivityLevel, GoalType, Profile, Sex } from "../lib/calories";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (desk job, little exercise)" },
  { value: "light", label: "Light (1-3 workouts/week)" },
  { value: "moderate", label: "Moderate (3-5 workouts/week)" },
  { value: "active", label: "Active (6-7 workouts/week)" },
  { value: "very_active", label: "Very active (physical job + training)" },
];

const GOAL_OPTIONS: { value: GoalType; label: string }[] = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain", label: "Gain weight" },
];

interface OnboardingScreenProps {
  onComplete: (profile: Profile) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("sedentary");
  const [goal, setGoal] = useState<GoalType>("lose");

  const isValid =
    age.trim() !== "" && heightCm.trim() !== "" && weightKg.trim() !== "";

  const handleSubmit = () => {
    if (!isValid) return;
    onComplete({
      sex,
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel,
      goal,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Let's set up your profile</Text>
      <Text style={styles.subheading}>
        This calculates your daily calorie budget. You can change it later.
      </Text>

      <Section label="Sex">
        <ChipRow options={SEX_OPTIONS} value={sex} onChange={setSex} />
      </Section>

      <Section label="Age (years)">
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
          placeholder="28"
        />
      </Section>

      <Section label="Height (cm)">
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="175"
        />
      </Section>

      <Section label="Weight (kg)">
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="72"
        />
      </Section>

      <Section label="Activity level">
        <ChipRow
          options={ACTIVITY_OPTIONS}
          value={activityLevel}
          onChange={setActivityLevel}
          vertical
        />
      </Section>

      <Section label="Goal">
        <ChipRow options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
      </Section>

      <Pressable
        style={[styles.submitButton, !isValid && styles.disabled]}
        onPress={handleSubmit}
        disabled={!isValid}
      >
        <Text style={styles.submitText}>Calculate my budget</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow<T extends string>({
  options,
  value,
  onChange,
  vertical,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  vertical?: boolean;
}) {
  return (
    <View style={vertical ? styles.chipColumn : styles.chipRow}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[
            styles.chip,
            vertical && styles.chipVertical,
            value === opt.value && styles.chipActive,
          ]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subheading: { fontSize: 14, color: "#666", marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipColumn: { gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  chipVertical: { alignSelf: "stretch" },
  chipActive: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  submitButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  disabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
