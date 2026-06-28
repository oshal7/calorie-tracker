import { View, Text, Pressable, StyleSheet } from "react-native";
import type { MealEntry, MealType } from "../lib/storage";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

interface MealListProps {
  meals: MealEntry[];
  onDelete: (id: string) => void;
}

export function MealList({ meals, onDelete }: MealListProps) {
  return (
    <View>
      {MEAL_ORDER.map((mealType) => {
        const entries = meals.filter((m) => m.mealType === mealType);
        if (entries.length === 0) return null;
        return (
          <View key={mealType} style={styles.section}>
            <Text style={styles.sectionTitle}>{MEAL_LABELS[mealType]}</Text>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.rawText} numberOfLines={2}>
                    {entry.rawText}
                  </Text>
                  <Text style={styles.calories}>{entry.totalCalories} kcal</Text>
                </View>
                {entry.items.map((item, i) => (
                  <Text key={i} style={styles.itemText}>
                    • {item.quantity} {item.name} ({item.estimatedCalories} kcal)
                  </Text>
                ))}
                {entry.confidence === "low" && (
                  <Text style={styles.lowConfidence}>
                    Estimate uncertain — quantities were unclear
                  </Text>
                )}
                <Pressable onPress={() => onDelete(entry.id)}>
                  <Text style={styles.delete}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        );
      })}
      {meals.length === 0 && (
        <Text style={styles.empty}>No meals logged yet today.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rawText: { flex: 1, fontSize: 14, color: "#333", marginRight: 8 },
  calories: { fontSize: 14, fontWeight: "700", color: "#2E7D32" },
  itemText: { fontSize: 13, color: "#666", marginLeft: 4 },
  lowConfidence: { fontSize: 12, color: "#C62828", marginTop: 4 },
  delete: { fontSize: 13, color: "#C62828", marginTop: 8 },
  empty: { textAlign: "center", color: "#999", marginTop: 24 },
});
