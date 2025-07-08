//DrawingCanvas
//expo install react-native-svg

import React, { useState, useEffect } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { useChallengeStore } from "@/store/challengeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import ScoreSetter from "./ScoreSetter";
import ThemedButton from "./ThemedButton";
import { isConnected } from "@/utility/Netinfo";

export default function DrawingBoard({ activity, onNext }) {
  const { addPagePoints, points } = useChallengeStore();
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get("window"),
  });
  const [scoreSelected, setScoreSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [mode, setMode] = useState("pen");
  const [paths, setPaths] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);

  const color = mode === "pen" ? "black" : "white";
  const strokeWidth = mode === "pen" ? 4 : 10;
  const Score = activity.on_app ? points : activity.score;

  const handleTouchStart = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    setCurrentPoints([[locationX, locationY]]);
  };

  const handleTouchMove = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    setCurrentPoints((prev) => [...prev, [locationX, locationY]]);
  };

  const handleTouchEnd = () => {
    if (currentPoints.length > 0) {
      const newPath = currentPoints.reduce((acc, point, index) => {
        return index === 0
          ? `M ${point[0]} ${point[1]} `
          : `${acc} L ${point[0]} ${point[1]} `;
      }, "");
      setPaths((prev) => [...prev, { path: newPath, color, strokeWidth }]);
    }
    setCurrentPoints([]);
  };

  const resetCanvas = () => {
    setPaths([]);
    setCurrentPoints([]);
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ window });
    });

    return () => subscription?.remove();
  }, []);

  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!activity) {
        Alert.alert("Error", "Missing activity data.");
        return;
      }

      const timestamp = Date.now();
      const fileUrl = FileSystem.documentDirectory + `drawing_${timestamp}.svg`;

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${
        dimensions.window.width * 0.9
      }" height="${dimensions.window.height * 0.65}">${paths
        .map(
          (p) =>
            `<path d="${p.path}" fill="none" stroke="${p.color}" stroke-width="${p.strokeWidth}" />`
        )
        .join("")}</svg>`;

      await FileSystem.writeAsStringAsync(fileUrl, svgContent);

     const fileName = `drawing_${timestamp}.svg`;
      const fileType = fileName.split(".").pop();

      const formPayload = {
        activity: activity.id,
        latitude: activity.location_lat,
        longitude: activity.location_lng,
        fileUri: fileUrl,
        fileName,
        fileType,
        driver_score: activity.on_app ? Score : null,
      };

      const token = await AsyncStorage.getItem("AUTH_TOKEN");
      const net = await isConnected();

      if (net) {
        const formData = new FormData();
        formData.append("activity", activity.id);
        formData.append("latitude", activity.location_lat);
        formData.append("longitude", activity.location_lng);
        formData.append("file", {
          uri: fileUrl,
          name: fileName,
          type: `image/${fileType}`,
        });
        if (activity.on_app) {
          formData.append("driver_score", Score);
        }

        await fetch(
          "https://backend.ecity.estelatechnologies.com/api/ecity/Activity/submissions/",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
              Authorization: `token ${token}`,
            },
            body: formData,
          }
        );

        addPagePoints(Score);
        onNext();
      } else {
        // Save offline if no internet
        const id = generateOfflineKey();
        const offlineQueue =
          JSON.parse(await AsyncStorage.getItem("offline_submissions1")) || {};
        offlineQueue[id] = formPayload;
        await AsyncStorage.setItem(
          "offline_submissions1",
          JSON.stringify(offlineQueue)
        );
        Alert.alert(
          "Saved Offline",
          "Submission will be uploaded when internet is available."
        );
        addPagePoints(Score);
        onNext();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      Alert.alert("Error", "Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateOfflineKey = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time to draw!</Text>

      <View
        style={[
          styles.canvasContainer,
          {
            height: dimensions.window.height * 0.65,
            width: dimensions.window.width * 0.9,
          },
        ]}
      >
        <Svg
          height="100%"
          width="100%"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {paths.map((p, index) => (
            <Path
              key={index}
              d={p.path}
              stroke={p.color}
              strokeWidth={p.strokeWidth}
              fill="none"
            />
          ))}
          {currentPoints.length > 0 && (
            <Path
              d={currentPoints.reduce((acc, point, index) => {
                return index === 0
                  ? `M ${point[0]} ${point[1]} `
                  : `${acc} L ${point[0]} ${point[1]} `;
              }, "")}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          )}
        </Svg>

        {/* Placeholder */}
        {paths.length === 0 && currentPoints.length === 0 && (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Your drawing goes here</Text>
          </View>
        )}

        {/* Inside Canvas Tools */}
        <View style={styles.insideToolColumn}>
          <TouchableOpacity
            style={[styles.toolBtn, mode === "pen" && styles.activeTool]}
            onPress={() => setMode("pen")}
          >
            <Text
              style={[styles.toolIcon, mode === "pen" && styles.activeText]}
            >
              ✏️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, mode === "eraser" && styles.activeTool]}
            onPress={() => setMode("eraser")}
          >
            <Text
              style={[styles.toolIcon, mode === "eraser" && styles.activeText]}
            >
              🧽
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.restartBtn} onPress={resetCanvas} disabled={isSubmitting}>
          <Text>Restart</Text>
        </TouchableOpacity>

        {activity.on_app ? (
          scoreSelected ? (
            <ThemedButton
              title={isSubmitting ? "Submitting..." : "Submit"}
              disabled={isSubmitting}
              onPress={handleSubmit}
            />
          ) : (
            <ThemedButton
              title="Assign Score"
              onPress={() => setIsActivityCompleted(true)}
            />
          )
        ) : (
          <ThemedButton
            title={isSubmitting ? "Submitting..." : "Submit"}
            disabled={isSubmitting}
            onPress={handleSubmit}
          />
        )}
        <ScoreSetter
          isVisible={isActivityCompleted}
          onClose={handleCloseModal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#414264",
    textAlign: "center",
    marginBottom: 16,
  },
  canvasContainer: {
    position: "relative",
    borderWidth: 2,
    borderColor: "#CBD5E1", // light gray
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  placeholderContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -10 }],
    zIndex: 1,
  },
  placeholderText: {
    fontSize: 20,
    color: "#A0A0AA",
  },
  insideToolColumn: {
    position: "absolute",
    left: 8,
    top: "50%",
    transform: [{ translateY: -40 }],
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    zIndex: 10,
  },
  toolBtn: {
    padding: 10,
    borderRadius: 8,
  },
  activeTool: {
    backgroundColor: "#e2e8f0",
  },
  toolIcon: {
    fontSize: 18,
  },
  activeText: {
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 30,
  },
  restartBtn: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    borderColor: "#94a3b8",
    borderWidth: 1,
  },
});
