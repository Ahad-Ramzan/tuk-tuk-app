import DrawingBoard from "@/components/DrawingCanvas";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import { typeActivity } from "@/types";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function DrawingPage({
  activity,
  onNext,
}: {
  activity: typeActivity;
  onNext: () => void;
}) {
  const [step, setStep] = useState(true);
  const { company } = useTheme();
  const { ThemedLogo } = useChallengeStore();

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImage}
      />

      <View style={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          {ThemedLogo ? (
            <Image source={{ uri: ThemedLogo }} style={styles.logo1} />
          ) : (
            <Image source={company.fulllogo} style={styles.logo} />
          )}
        </View>

        {step && (
          <View style={styles.card}>
            <Text style={styles.heading}>Time to draw! </Text>
            <Image
              source={require("@/assets/images/activitydrawing.png")}
              style={styles.drawingImage}
            />
            <Text style={styles.subText}>{activity.prompt}</Text>
            <ThemedButton
              title="Start drawing"
              onPress={() => setStep(false)}
            />
          </View>
        )}

        {!step && <DrawingBoard activity={activity} onNext={onNext} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "60%",
  },
  contentContainer: {
    width: "90%",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flex: 1,
    zIndex: 1,
  },
  logoContainer: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  logo: {
    width: 140,
    height: 60,
    resizeMode: "contain",
  },
  logo1: {
    width: 180,
    height: 80,
    resizeMode: "contain",
  },
  card: {
    width: "100%",
    padding: 20,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#414264",
    marginBottom: 16,
    textAlign: "center",
  },
  drawingImage: {
    width: "100%",
    height: "50%",
    resizeMode: "contain",
    marginBottom: 16,
  },
  subText: {
    color: "#414264",
    textAlign: "center",
    marginBottom: 36,
  },
});
