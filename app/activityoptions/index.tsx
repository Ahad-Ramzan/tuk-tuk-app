import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { postChallenge } from "@/services/api/index";
import { useChallengeStore } from "@/store/challengeStore";
import { typeActivity } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

function shuffleOptions(options: string[]) {
  return options
    .map((value, index) => ({ value, index }))
    .sort(() => Math.random() - 0.5);
}

export default function ActivityOptions({
  activity,
  onNext,
}: {
  activity: typeActivity;
  onNext: () => void;
}) {
  const { addPagePoints, points,ThemedLogo } = useChallengeStore();
  const [shuffledOptions, setShuffledOptions] = useState<
    { value: string; index: number }[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [scoreSelected, setScoreSelected] = useState(false);
  const { company } = useTheme();

  const score = activity.on_app ? points : activity.score;

  useEffect(() => {
    const originalOptions = [
      activity.choice_1,
      activity.choice_2,
      activity.choice_3,
      activity.choice_4,
    ].filter((choice) => typeof choice === "string" && choice.trim() !== "");

    setShuffledOptions(shuffleOptions(originalOptions));
  }, [activity]);

  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };

  const handleActivityCompleted = () => {
    setIsActivityCompleted(true);
    addPagePoints(score);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;

    const isCorrect = shuffledOptions[selectedOption].index === 0; // choice_1 is correct
    const earnedPoints = isCorrect ? score : 0;

    const payLoad = {
      activity: activity.id,
      latitude: activity.location_lat,
      longitude: activity.location_lng,
      answer: String(selectedOption + 1),
      ...(activity.on_app ? { driver_score: earnedPoints } : {}),
    };

    if (isCorrect) {
      addPagePoints(score);
    }

    try {
      await postChallenge(payLoad);
      onNext();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Logo */}
      {ThemedLogo ? (
        <Image source={{ uri: ThemedLogo }} style={styles.logo1} />
      ) : (
      <Image
        source={company.fulllogo}
        style={styles.logo}
        resizeMode="contain"
      />  
      )}

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.heading}>Answer the question</Text>

        <Image
          source={require("@/assets/images/activityframe1.png")}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>{activity.prompt}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {shuffledOptions.map((option, index) => (
            <OptionCard
              key={index}
              text={option.value}
              selected={selectedOption === index}
              onPress={() => setSelectedOption(index)}
            />
          ))}
        </View>

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

        <ScoreSetter
          isVisible={isActivityCompleted}
          onClose={handleCloseModal}
        />
      </View>
    </View>
  );
}

type OptionCardProps = {
  text: string;
  selected: boolean;
  onPress: () => void;
};

function OptionCard({ text, selected, onPress }: OptionCardProps) {
  const { company } = useTheme();
  return (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <View style={styles.optionInner}>
        <Ionicons
          name={
            selected ? "radio-button-on-outline" : "radio-button-off-outline"
          }
          size={20}
          color={selected ? company.theme.primaryDark : company.theme.primary}
          style={{ marginBottom: 4 }}
        />
        <Text style={styles.optionText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: screenWidth,
    height: "60%",
    zIndex: 1,
  },
  logo: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 160,
    height: 60,
    zIndex: 1,
  },
  logo1: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 180,
    height: 80,
    zIndex: 1,
    resizeMode: "contain",
  },
  content: {
    width: "90%",
    padding: 16,
    alignItems: "center",
    zIndex: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#414264",
    marginBottom: 16,
    textAlign: "center",
  },
  illustration: {
    width: 280,
    height: 260,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#414264",
    marginBottom: 16,
  },
  optionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "48%",
  },
  optionInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    color: "#414264",
    flexShrink: 1,
    fontSize: 18,
  },
});
