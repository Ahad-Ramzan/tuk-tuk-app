import DrawingCanvas from "@/components/DrawingCanvas";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { typeActivity } from "@/types";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function DrawingPage({ activity }: { activity: typeActivity }) {
  const [step, setStep] = useState(1);
  const { company } = useTheme();
  console.log(activity, "Drawing activity=======++++++++");
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
          <Image source={company.fulllogo} style={styles.logo} />
        </View>

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.heading}>Time to draw! </Text>
            <Image
              source={require("@/assets/images/activitydrawing.png")}
              style={styles.drawingImage}
            />
            <Text style={styles.subText}>{activity.prompt}</Text>
            <ThemedButton title="Start drawing" onPress={() => setStep(2)} />
          </View>
        )}

        {step === 2 && <DrawingCanvas />}
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
    width: 550,
    height: 400,
    resizeMode: "contain",
    marginBottom: 16,
  },
  subText: {
    color: "#414264",
    textAlign: "center",
    marginBottom: 36,
  },
});
