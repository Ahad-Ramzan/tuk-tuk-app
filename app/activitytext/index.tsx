import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton"; // Imported ThemedButton
import { useTheme } from "@/context/ThemeContext";
import { postChallenge } from "@/services/api";
import { useChallengeStore } from "@/store/challengeStore";
import { typeActivity } from "@/types";

type PayLoad = {
  activity: number;
  latitude: number;
  longitude: number;
  answer: string;
  driver_score?: number;
};
export default function TextQuiz({
  activity,
  onNext,
}: {
  activity: typeActivity;
  onNext: () => void;
}) {
  const { addPagePoints, points, ThemedLogo } = useChallengeStore();
  const [answer, setAnswer] = useState<string>("");
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);

  const [scoreSelected, setScoreSelected] = useState(false);
  const { company } = useTheme();

  const Score = activity.on_app ? points : activity.score;
  const payLoad: PayLoad = {
    activity: activity.id,
    latitude: activity.location_lat,
    longitude: activity.location_lng,
    answer: answer,
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

  const handleSubmit = async () => {
    addPagePoints(Score);
    try {
      await postChallenge(payLoad);
      onNext();
    } catch (error) {
      console.error("Error submitting challenge:", error);
    }
  };

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
          <Image
            source={{ uri: ThemedLogo }} // Check this path!
            style={styles.logo}
          />
        ) : (
          <Image source={company.fulllogo} style={styles.logo} />
        )}
      </View>

      <View style={styles.contentContainer}>
        {/* Main content */}
        <View style={styles.card}>
          <Text style={styles.heading}>Answer the question</Text>

          {/* Circular Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require("@/assets/images/activityframe1.png")}
              style={styles.circularImage}
            />
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{activity.prompt}</Text>

          {/* Answer Input */}
          <TextInput
            style={[
              styles.textInput,
              { minHeight: 150, textAlignVertical: "top" },
            ]}
            placeholder="Your answer goes here"
            multiline
            numberOfLines={8}
            value={answer}
            onChangeText={setAnswer}
          />

          {/* Submit / Assign Score Button */}
          <View style={styles.buttonContainer}>
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
          <ScoreSetter
            isVisible={isActivityCompleted}
            onClose={handleCloseModal}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3", // Light Gray background color
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
    zIndex: 1, // Ensure background image is behind other content
  },
  nextButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 2,
  },
  contentContainer: {
    width: "90%",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // ensure it overlaps correctly
    backgroundColor: "transparent", // Make this transparent
    zIndex: 2,
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
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#414264", // darkGray
    marginBottom: 16,
    textAlign: "center",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  circularImage: {
    width: 280,
    height: 260,
    borderRadius: 90, // make image circular
    resizeMode: "contain",
  },
  subtitle: {
    textAlign: "center",
    color: "#414264", // darkGray
    marginBottom: 16,
  },
  textInput: {
    width: "100%",
    padding: 16,
    borderColor: "#CACACA",
    backgroundColor: "#F9FAFB",

    borderRadius: 8,
    color: "#374151", // darkGray
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center", // Center the button inside the container
  },
  defaultButtonStyle: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0f766e", // primaryDark color
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "auto", // Ensure button doesn't stretch to full width
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
