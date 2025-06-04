import { useChallengeStore } from "@/store/challengeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Canvas,
  ImageFormat,
  Path,
  Skia,
  useCanvasRef,
} from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system";

import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScoreSetter from "./ScoreSetter";
import ThemedButton from "./ThemedButton";

const DrawingBoard = ({ activity, onNext }) => {
  const { addPagePoints, points } = useChallengeStore();
  const [dimensions, setDimensions] = React.useState({
    window: Dimensions.get("window"),
  });
  const canvasRef = useCanvasRef();
  const [scoreSelected, setScoreSelected] = useState(false);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [mode, setMode] = useState("pen");
  const [paths, setPaths] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const currentPointsRef = useRef([]);

  const color = mode === "pen" ? "black" : "white";
  const strokeWidth = mode === "pen" ? 4 : 10;
  const Score = activity.on_app ? points : activity.score;

  const handleTouchStart = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const newPoints = [[locationX, locationY]];
    currentPointsRef.current = newPoints;
    setCurrentPoints(newPoints);
  };
  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };
  const handleActivityCompleted = () => {
    setIsActivityCompleted(true);
  };

  const handleTouchMove = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const updatedPoints = [...currentPointsRef.current, [locationX, locationY]];
    currentPointsRef.current = updatedPoints;
    setCurrentPoints(updatedPoints);
  };

  const handleTouchEnd = () => {
    const points = currentPointsRef.current;
    if (points.length > 0) {
      const path = Skia.Path.Make();
      path.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        path.lineTo(points[i][0], points[i][1]);
      }
      setPaths((prev) => [...prev, { path, color, strokeWidth }]);
    }
    currentPointsRef.current = [];
    setCurrentPoints([]);
  };

  const resetCanvas = () => {
    setPaths([]);
    setCurrentPoints([]);
  };

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ window });
    });

    return () => subscription?.remove();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!canvasRef.current || !activity) {
        Alert.alert("Error", "Missing canvas or activity data.");
        return;
      }

      const image = canvasRef.current.makeImageSnapshot();
      if (!image) {
        Alert.alert("Error", "Failed to capture image snapshot.");
        return;
      }

      const base64 = image.encodeToBase64(ImageFormat.PNG);
      const fileUrl = FileSystem.documentDirectory + "drawing.png";

      await FileSystem.writeAsStringAsync(fileUrl, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileUri = fileUrl;
      const fileName = fileUri.split("/").pop();
      const fileType = fileName.split(".").pop();

      const formData = new FormData();

      formData.append("activity", activity.id);
      formData.append("latitude", activity.location_lat);
      formData.append("longitude", activity.location_lng);
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: `image/${fileType}`,
      });

      if (activity.on_app) {
        formData.append("driver_score", Score);
      }
      const token = await AsyncStorage.getItem("AUTH_TOKEN");

      await fetch(
        "https://backend.ecity.estelatechnologies.com/api/ecity/Activity/submissions/",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
            Authorization: `token ${token}`,
            "X-CSRFTOKEN":
              "UWHYzLJQNZC5K3SdzWixpRZNpZtzPxY6CO2OUCcr3wkxdGMW1TcCpmPv5X5hAg3A",
          },
          body: formData,
        }
      );

      addPagePoints(Score);
      onNext();
    } catch (error) {
      console.error("Submission failed:", error);
      Alert.alert(
        "Error",
        "Something went wrong while submitting. Please try again."
      );
    }
  };

  const currentPath = Skia.Path.Make();
  if (
    currentPoints.length > 0 &&
    currentPoints.every(
      ([x, y]) => typeof x === "number" && typeof y === "number"
    )
  ) {
    currentPath.moveTo(currentPoints[0][0], currentPoints[0][1]);
    for (let i = 1; i < currentPoints.length; i++) {
      currentPath.lineTo(currentPoints[i][0], currentPoints[i][1]);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time to darw!</Text>

      <View
        style={[
          styles.canvasContainer,
          {
            height: dimensions.window.height * 0.65,
            width: dimensions.window.width * 0.9,
          },
        ]}
      >
        <Canvas
          ref={canvasRef}
          style={styles.canvas}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {paths.map((p, index) => (
            <Path
              key={index}
              path={p.path}
              color={p.color}
              style="stroke"
              strokeWidth={p.strokeWidth}
            />
          ))}
          {currentPoints.length > 0 && (
            <Path
              path={currentPath}
              color={color}
              style="stroke"
              strokeWidth={strokeWidth}
            />
          )}
        </Canvas>

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
        <TouchableOpacity style={styles.restartBtn} onPress={resetCanvas}>
          <Text>Restart</Text>
        </TouchableOpacity>

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
};

export default DrawingBoard;

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
    height: Dimensions.get("window").height * 0.65,
    width: Dimensions.get("window").width * 0.9,
    borderWidth: 2,
    borderColor: "#CBD5E1", // light gray
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  canvas: {
    width: "100%",
    height: "100%",
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
    // fontStyle: "italic",
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
    // backgroundColor: "#e2e8f0",
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
  submitBtn: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 24,
  },
  submitText: {
    color: "#fff",
  },
});
