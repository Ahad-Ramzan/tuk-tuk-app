import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Canvas, Path, Skia, useCanvasRef } from "@shopify/react-native-skia";
import ThemedButton from "./ThemedButton";

const DrawingBoard = () => {
  const canvasRef = useCanvasRef();
  const screenHeight = Dimensions.get("window").height;
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState("pen");
  const [paths, setPaths] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const currentPointsRef = useRef([]);

  const color = mode === "pen" ? "black" : "white";
  const strokeWidth = mode === "pen" ? 4 : 10;

  const handleTouchStart = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const newPoints = [[locationX, locationY]];
    currentPointsRef.current = newPoints;
    setCurrentPoints(newPoints);
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

  const handleSubmit = async () => {
    try {
      const image = await canvasRef.current?.makeImageSnapshot();
      const base64 = image.encodeToBase64("png");
      // console.log("Base64 image data:", base64);
      Alert.alert(
        "Canvas exported",
        "Image exported as base64 (check console)"
      );
    } catch (err) {
      Alert.alert("Error", "Could not export canvas.");
      console.error(err);
    }
  };

  // Build current path
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

      <View style={styles.canvasContainer}>
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

        {/* <ThemedButton title="Submit" onPress={handleSubmit} /> */}
        <ThemedButton
          onPress={() => setSubmitted(true)}
          title={submitted ? "Assign Score" : "Submit"}
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
