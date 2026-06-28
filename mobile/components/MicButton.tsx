import { useState } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

interface MicButtonProps {
  onTranscript: (text: string) => void;
}

export function MicButton({ onTranscript }: MicButtonProps) {
  const [listening, setListening] = useState(false);

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) onTranscript(transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.warn("speech recognition error:", event.error, event.message);
    setListening(false);
  });

  const handlePress = async () => {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Microphone/speech permission not granted");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "en-IN",
      interimResults: true,
      continuous: false,
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.button, listening && styles.listening]}
    >
      <Text style={styles.icon}>{listening ? "■" : "🎤"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  listening: {
    backgroundColor: "#C62828",
  },
  icon: {
    fontSize: 20,
    color: "#fff",
  },
});
