import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import ThemedButton from "@/components/ThemedButton";
import { star, welldone, QRcode } from "@/assets/images";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { useChallengeStore } from "@/store/challengeStore";

export default function PointsScreen() {
  const {resetAllPoints,grandTotalPoints}  = useChallengeStore();
  const { company } = useTheme();
  const points = grandTotalPoints;
  const handleExit = () => {
    resetAllPoints();
    router.replace("/mapprogress");
  };

  return (
    <View style={styles.container}>
      {/* Exit Button */}
      <View style={styles.exitButton}>
        <ThemedButton title="Exit" onPress={handleExit} />
      </View>

      {/* Company Logo */}
      <Image source={company.fulllogo} style={styles.logo} />

      {/* Points Display */}
      <View style={styles.pointsContainer}>
        <Image source={star} style={[styles.star, styles.leftStar]} />
        <Text style={styles.pointsText}>{points} Points</Text>
        <Image source={star} style={[styles.star, styles.rightStar]} />
      </View>

      {/* Congratulations Image */}
      <Image source={welldone} style={styles.wellDoneImage} />

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <Image source={QRcode} style={styles.qrImage} />
        <View style={styles.qrTextContainer}>
          <Text style={styles.qrTitle}>Thank you for choosing Tuk on Me!</Text>
          <Text style={styles.qrSubtitle}>
            If you liked this tour, please give us a 5⭐ review!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#EEF0F3",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  exitButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logo: {
    width: 140,
    height: 60,
    resizeMode: "contain",
    position: "absolute",
    top: 40,
    right: 20,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pointsText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2B2D42",
    textAlign: "center",
  },
  star: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  leftStar: {
    transform: [{ rotate: "-90deg" }],
  },
  rightStar: {
    transform: [{ rotate: "90deg" }],
  },
  wellDoneImage: {
    width: "90%",
    height: 280,
    resizeMode: "contain",
    marginVertical: 20,
    marginTop: -40,
  },
  qrSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: "90%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  qrImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 16,
  },
  qrTextContainer: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#2B2D42",
  },
  qrSubtitle: {
    fontSize: 14,
    color: "#555",
  },
});
