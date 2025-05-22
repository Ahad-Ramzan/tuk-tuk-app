import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { typeActivity } from "@/types";

export default function ActivityPage({ activity }: { activity: typeActivity }) {
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const { company } = useTheme();

  const handleActivityCompleted = () => {
    setIsActivityCompleted(true);
  };

  const handleCloseModal = () => {
    setIsActivityCompleted(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImage}
      />
      {/* Logo Top Right */}
      <Image
        source={company.fulllogo}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Get active!</Text>
        <Image
          source={require("@/assets/images/onboarding1.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>{activity.prompt}</Text>

        <ThemedButton
          title="Activity Completed"
          onPress={handleActivityCompleted}
        />
      </View>
      <ScoreSetter isVisible={isActivityCompleted} onClose={handleCloseModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "60%",
    zIndex: 1,
  },
  logo: {
    width: 140,
    height: 60,
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#414264",
    marginBottom: 16,
  },
  illustration: {
    width: Dimensions.get("window").width * 0.8,
    height: 400,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#414264",
    marginBottom: 28,
    textAlign: "center",
  },
  completeButton: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
