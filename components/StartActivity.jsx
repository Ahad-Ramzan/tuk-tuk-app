import { useEffect, useState, useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ErrorModal from "@/components/ErrorModal";
import ThemedButton from "@/components/ThemedButton";
import PasswordModal from "@/components/PasswordModel";
import { useChallengeStore } from "@/store/challengeStore";
import { router } from "expo-router";
import { Audio } from "expo-av";

const ActivityPrompt = ({ onClose, ID }) => {
  const [showError, setShowError] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { activeChallenge, setActiveTask } = useChallengeStore();
  const soundRef = useRef(null);
  const timerRef = useRef(null);

  // Helper to stop and unload sound
  const stopBell = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const handleClose = async () => {
    await stopBell();
    onClose();
  };

  const handleStartActivity = async () => {
    await stopBell();
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    router.push("/taskmanager");
  };

  useEffect(() => {
    async function playBell() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/bell.mp3"),
          { isLooping: true }
        );
        soundRef.current = sound;
        await sound.playAsync();
        // Stop after 16 seconds
        timerRef.current = setTimeout(() => {
          stopBell();
        }, 16000);
      } catch (e) {
        console.error("Failed to play sound", e);
      }
    }
    playBell();

    return () => {
      stopBell();
    };
  }, []);

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
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Time for the next activity</Text>

        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/onboarding2.png")}
            style={styles.image}
          />
        </View>

        <ThemedButton
          variant="primary"
          style={styles.startButton}
          onPress={handleStartActivity}
          title="Start activity"
        />
      </View>

      {showPasswordModal && (
        <PasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordSuccess}
        />
      )}

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
