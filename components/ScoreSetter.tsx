// components/ScoreSetter.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import {useChallengeStore} from "@/store/challengeStore";

const SCORE_OPTIONS = [0, 5, 10, 15, 20, 25];

const ScoreSetter = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const [score, setScore] = useState<number | null>(null);
  const { setPoints } = useChallengeStore();
  const handleSelectScore = (selectedScore: number) => {
    setScore(selectedScore);
    setPoints(selectedScore);
    console.log(score,"score setter")
  };

  const handleResetScore = () => {
    setScore(null);
    onClose();
    
  };

  const handleConfirm = () => {
    // Submit logic here
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="gray" />
        </TouchableOpacity>

        <Text style={styles.title}>Set a Score</Text>
        <Text style={styles.subtitle}>
          This will assign a score to the user
        </Text>

        <FlatList
          data={SCORE_OPTIONS}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.scoreItem,
                score === item && styles.selectedScoreItem,
              ]}
              onPress={() => handleSelectScore(item)}
            >
              <Text style={score === item ? styles.selectedText : styles.text}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleResetScore}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              { opacity: score === null ? 0.5 : 1 },
            ]}
            disabled={score === null}
          >
            <Text style={styles.confirmText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ScoreSetter;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  scoreItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  selectedScoreItem: {
    backgroundColor: "#e0f0ff",
  },
  text: {
    color: "#333",
  },
  selectedText: {
    color: "#007aff",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
  },
  cancelText: {
    color: "#333",
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007aff",
    borderRadius: 8,
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
  },
});
