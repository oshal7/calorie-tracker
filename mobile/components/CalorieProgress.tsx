import { View, Text, StyleSheet } from "react-native";

interface CalorieProgressProps {
  consumed: number;
  budget: number;
}

export function CalorieProgress({ consumed, budget }: CalorieProgressProps) {
  const remaining = budget - consumed;
  const pct = budget > 0 ? Math.min(consumed / budget, 1) : 0;
  const overBudget = remaining < 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.bigNumber}>{consumed}</Text>
        <Text style={styles.label}>consumed of {budget} kcal</Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${pct * 100}%` },
            overBudget && styles.barOver,
          ]}
        />
      </View>
      <Text style={[styles.remaining, overBudget && styles.overText]}>
        {overBudget
          ? `${Math.abs(remaining)} kcal over budget`
          : `${remaining} kcal remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1B1B1B",
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
  },
  barOver: {
    backgroundColor: "#C62828",
  },
  remaining: {
    marginTop: 8,
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  overText: {
    color: "#C62828",
  },
});
