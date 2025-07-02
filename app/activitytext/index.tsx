import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { postChallenge } from "@/services/api";
import { useChallengeStore } from "@/store/challengeStore";
import { isConnected } from "@/utility/Netinfo";
import { typeActivity } from "@/types";

type Props = {
  activity: typeActivity;
  onNext: () => void;
};

type PayLoad = {
  activity: number;
  latitude: number;
  longitude: number;
  answer: string;
  driver_score?: number;
};

export default function TextQuiz({ activity, onNext }: Props) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const { addPagePoints, points, ThemedLogo } = useChallengeStore();
  const { company } = useTheme();

  const [answer, setAnswer] = useState("");
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [scoreSelected, setScoreSelected] = useState(false);

  const handleActivityCompleted = () => setIsActivityCompleted(true);
  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };

  const handleSubmit = async () => {
    const score = activity.on_app ? points : activity.score;

    const payload: PayLoad = {
      activity: activity.id,
      latitude: activity.location_lat,
      longitude: activity.location_lng,
      answer,
      ...(activity.on_app && { driver_score: points }),
    };

    const online = await isConnected();

    if (!online) {
      try {
        const rawQueue = await AsyncStorage.getItem("offline_submissions1");
        const offlineQueue = rawQueue ? JSON.parse(rawQueue) : {};
        const id = Date.now().toString();
        offlineQueue[id] = payload;
        await AsyncStorage.setItem("offline_submissions1", JSON.stringify(offlineQueue));
        addPagePoints(score);
        onNext();
        return;
      } catch (err) {
        console.error("Failed to save offline submission:", err);
        return;
      }
    }

    try {
      await postChallenge(payload);
      addPagePoints(score);
      onNext();
    } catch (err) {
      console.error("Error submitting challenge:", err);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height" keyboardVerticalOffset={150}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContainer,
            isLandscape ? styles.landscapePadding : styles.portraitPadding,
          ]}
        >
          <Image
            source={require("@/assets/images/bgonboarding.png")}
            style={styles.backgroundImage}
          />

          <View style={styles.logoContainer}>
            {ThemedLogo ? (
              <Image source={{ uri: ThemedLogo }} style={styles.logo} />
            ) : (
              <Image source={company.fulllogo} style={styles.logo} />
            )}
          </View>

          <View style={[styles.contentContainer, isLandscape && styles.landscapeContent]}>
            <View style={styles.card}>
              <Text style={styles.heading}>Answer the question</Text>

              <View style={styles.imageContainer}>
                <Image
                  source={require("@/assets/images/activityframe1.png")}
                  style={styles.circularImage}
                />
              </View>

              <Text style={styles.subtitle}>{activity.prompt}</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Your answer goes here"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                value={answer}
                onChangeText={setAnswer}
              />

              <View style={styles.buttonContainer}>
                {activity.on_app && !scoreSelected ? (
                  <ThemedButton title="Assign Score" onPress={handleActivityCompleted} />
                ) : (
                  <ThemedButton title="Submit" onPress={handleSubmit} />
                )}
              </View>

              <ScoreSetter isVisible={isActivityCompleted} onClose={handleCloseModal} />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  portraitPadding: {
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  landscapePadding: {
    paddingVertical: 16,
    paddingHorizontal: 40,
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
    zIndex: 3,
  },
  logo: {
    width: 140,
    height: 60,
    resizeMode: "contain",
  },
  contentContainer: {
    width: "100%",
    maxWidth: 700,
    padding: 16,
    zIndex: 2,
  },
  landscapeContent: {
    maxWidth: 900,
  },
  card: {
    width: "100%",
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#414264",
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
    borderRadius: 90,
    resizeMode: "contain",
  },
  subtitle: {
    textAlign: "center",
    color: "#414264",
    marginBottom: 16,
  },
  textInput: {
    width: "100%",
    padding: 16,
    borderColor: "#CACACA",
    backgroundColor: "#F9FAFB",
    minHeight: 150,
    borderRadius: 8,
    color: "#374151",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
