import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { CalorieProgress } from "../components/CalorieProgress";
import { MealList } from "../components/MealList";
import { AddMealModal } from "../components/AddMealModal";
import { calculateDailyBudget, type Profile } from "../lib/calories";
import { parseMeal } from "../lib/api";
import {
  addMeal,
  deleteMeal,
  getMealsForDate,
  todayDateString,
  type MealEntry,
  type MealType,
} from "../lib/storage";

interface HomeScreenProps {
  profile: Profile;
  onEditProfile: () => void;
}

export function HomeScreen({ profile, onEditProfile }: HomeScreenProps) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const budget = calculateDailyBudget(profile);
  const consumed = meals.reduce((sum, m) => sum + m.totalCalories, 0);

  const loadMeals = useCallback(async () => {
    const todays = await getMealsForDate(todayDateString());
    setMeals(todays);
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const handleAddMeal = async (text: string, mealType: MealType) => {
    const result = await parseMeal(text, mealType);
    const entry: MealEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: todayDateString(),
      mealType: result.mealType ?? mealType,
      rawText: text,
      items: result.items,
      totalCalories: result.totalCalories,
      confidence: result.confidence,
      createdAt: new Date().toISOString(),
    };
    await addMeal(entry);
    await loadMeals();
  };

  const handleDelete = async (id: string) => {
    await deleteMeal(id);
    await loadMeals();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Today</Text>
          <Pressable onPress={onEditProfile}>
            <Text style={styles.editLink}>Edit goal</Text>
          </Pressable>
        </View>

        <CalorieProgress consumed={consumed} budget={budget} />
        <MealList meals={meals} onDelete={handleDelete} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Log meal</Text>
      </Pressable>

      <AddMealModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddMeal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "700" },
  editLink: { fontSize: 14, color: "#2E7D32", fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
