import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MicButton } from "./MicButton";
import type { MealType } from "../lib/storage";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

function defaultMealForTime(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string, mealType: MealType) => Promise<void>;
}

export function AddMealModal({ visible, onClose, onSubmit }: AddMealModalProps) {
  const [text, setText] = useState("");
  const [mealType, setMealType] = useState<MealType>(defaultMealForTime());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(text.trim(), mealType);
      setText("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>What did you eat?</Text>

          <View style={styles.mealTypeRow}>
            {MEAL_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.mealTypeChip,
                  mealType === opt.value && styles.mealTypeChipActive,
                ]}
                onPress={() => setMealType(opt.value)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    mealType === opt.value && styles.mealTypeTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2 idlis with sambar and filter coffee"
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              multiline
              editable={!submitting}
            />
            <MicButton onTranscript={(t) => setText((prev) => (prev ? `${prev} ${t}` : t))} />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable onPress={onClose} disabled={submitting} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting || !text.trim()}
              style={[styles.submitButton, (submitting || !text.trim()) && styles.disabled]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Log meal</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  mealTypeRow: { flexDirection: "row", marginBottom: 16, gap: 8 },
  mealTypeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
  },
  mealTypeChipActive: { backgroundColor: "#2E7D32" },
  mealTypeText: { fontSize: 13, color: "#666" },
  mealTypeTextActive: { color: "#fff", fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  input: {
    flex: 1,
    minHeight: 60,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  errorText: { color: "#C62828", fontSize: 13, marginTop: 8 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 20 },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 16 },
  cancelText: { color: "#666", fontSize: 15 },
  submitButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
