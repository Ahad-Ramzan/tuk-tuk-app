import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ErrorModal from "@/components/ErrorModal";
import ThemedButton from "@/components/ThemedButton";
import { useChallengeStore } from "@/store/challengeStore";
import { router } from "expo-router";

const ActivityPrompt = ({ onClose, ID }) => {
  const [showError, setShowError] = useState(false);
  const { activeChallenge, setActiveTask } = useChallengeStore();
  useEffect(() => {
    if (activeChallenge) {
      const taskId = ID;
      const task = activeChallenge.tasks?.find((t) => t.id === taskId);

      if (task) {
        setActiveTask(task.activities);
      } else {
        setShowError(true);
      }
    }
  }, [activeChallenge, ID, setActiveTask]);

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Time for the next activity</Text>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/onboarding2.png")} // Adjust image source for Expo
            style={styles.image}
          />
        </View>

        {/* Start Button */}
        <ThemedButton
          variant="primary"
          style={styles.startButton}
          onPress={() => router.push("/taskmanager")}
          title="Start activity"
        />
      </View>

      {/* Show ErrorModal if showError is true */}
      {showError && (
        <ErrorModal onClose={() => setShowError(false)} visible={showError} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    width: 350,
    textAlign: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 2,
    right: 2,
  },
  closeText: {
    fontSize: 34,
    color: "darkgray",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "darkgray",
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: 280,
    height: 280,
  },
  startButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default ActivityPrompt;
