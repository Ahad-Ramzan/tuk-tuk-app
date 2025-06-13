// components/layouts/QuizLayout.tsx

import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import React from "react";
import { View, Image, StyleSheet } from "react-native";

const QuizLayout = ({ children }: { children: React.ReactNode }) => {
  const { ThemedLogo } = useChallengeStore();
  const { company } = useTheme();
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImage}
      />

      {/* Logo in the top right corner */}
      <View style={styles.logoContainer}>
        {ThemedLogo ? (
          <Image source={{ uri: ThemedLogo }} style={styles.logo1} />
        ) : (
          <Image source={company.fulllogo} style={styles.logo} />
        )}
      </View>

      {/* Screen content */}
      {children}
    </View>
  );
};

export default QuizLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#EEF0F3",
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "60%",
    zIndex: 1,
  },
  logoContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 2,
  },
  logo: {
    width: 196,
    height: 60,
    resizeMode: "contain",
  },
  logo1: {
    width: 196,
    height: 80,
    resizeMode: "contain",
  },
});
