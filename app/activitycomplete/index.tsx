import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { typeActivity } from "@/types";
import { useChallengeStore } from "@/store/challengeStore";
export default function ActivityPage({
  activity,
  onNext,
}: {
  activity: typeActivity;
  onNext: () => void;
}) {
  const { addPagePoints, points, ThemedLogo } = useChallengeStore();
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [scoreSelected, setScoreSelected] = useState(false);
  const { company } = useTheme();
  const Score = activity.on_app ? points : activity.score;

  type TpayLoad = {
    activity: number;
    latitude: number;
    longitude: number;
    driver_score?: number;
  };
  const payLoad: TpayLoad = {
    activity: activity.id,
    latitude: activity.location_lat,
    longitude: activity.location_lng,
  };

  if (activity.on_app) {
    payLoad.driver_score = points;
  }
  const handleActivityCompleted = () => {
    setIsActivityCompleted(true);
  };

  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };
  const handleSubmit = () => {
    addPagePoints(Score);
    onNext();
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImage}
      />
      {/* Logo Top Right */}
      {ThemedLogo ? (
        <Image source={{ uri: ThemedLogo }} style={styles.logo1} />
      ) : (
        <Image
          source={company.fulllogo}
          style={styles.logo}
          resizeMode="contain"
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Get active!</Text>
        <Image
          source={require("@/assets/images/onboarding1.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>{activity.prompt}</Text>

        {/* <ThemedButton
          title="Activity Completed"
          onPress={handleActivityCompleted}
         
        /> */}
        {activity.on_app ? (
          scoreSelected ? (
            <ThemedButton title="Submit" onPress={handleSubmit} />
          ) : (
            <ThemedButton
              title="Assign Score"
              onPress={handleActivityCompleted}
            />
          )
        ) : (
          <ThemedButton title="Submit" onPress={handleSubmit} />
        )}
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
  logo1: {
    width: 180,
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    top: 40,
    right: 20,
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
