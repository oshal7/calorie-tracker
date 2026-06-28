import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { getProfile, saveProfile } from "./lib/storage";
import type { Profile } from "./lib/calories";

export default function App() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const handleProfileSaved = async (newProfile: Profile) => {
    await saveProfile(newProfile);
    setProfile(newProfile);
  };

  if (profile === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <>
      {profile ? (
        <HomeScreen profile={profile} onEditProfile={() => setProfile(null)} />
      ) : (
        <OnboardingScreen onComplete={handleProfileSaved} />
      )}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
