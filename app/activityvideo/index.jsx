import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@react-navigation/elements";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Video } from "expo-av";
import { useChallengeStore } from "@/store/challengeStore";

export default function VideoPage({ activity }) {
  const { currentActivityPoints } = useChallengeStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [video, setVideo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef(null);
  const { company } = useTheme();
console.log(currentActivityPoints, "currentActivityPoints");
  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const videoData = await cameraRef.current.recordAsync();
        setVideo(videoData.uri);
        setIsRecording(false);
        setIsCameraOpen(false);
      } catch (error) {
        console.error("Recording failed:", error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const retakeVideo = () => {
    setVideo(null);
    setSubmitted(false);
    setIsCameraOpen(true);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image
          source={company.fulllogo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImg}
        resizeMode="cover"
      />

      {video ? (
        <View style={styles.inner}>
          <Text style={styles.title}>Happy with your video?</Text>
          <Video
            source={{ uri: video }}
            style={styles.photoPreview}
            useNativeControls
            resizeMode="contain"
            shouldPlay
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={retakeVideo}>
              <Text style={styles.outlineText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={submitted ? undefined : handleSubmit}
            >
              <Text style={styles.primaryText}>
                {submitted ? "Assign Score" : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isCameraOpen ? (
        <View style={styles.fullScreenCameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.fullScreenCamera}
            facing="front"
          />
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[
                styles.shutterButton,
                { backgroundColor: isRecording ? "red" : "white" },
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            />
          </View>
        </View>
      ) : (
        <View style={styles.inner}>
          <Text style={styles.title}>Record a video!</Text>
          <View style={styles.cameraWrapper}>
            <Image
              source={require("@/assets/images/TakePhoto.png")}
              style={styles.placeholder}
              resizeMode="contain"
            />
          </View>
          <View style={styles.descriptionWrapper}>
            <Text style={styles.description}>{activity.prompt} </Text>
            <ThemedButton
              title="Record Video"
              onPress={() => setIsCameraOpen(true)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3",
    position: "relative",
  },
  logoWrapper: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  logo: {
    width: 140,
    height: 60,
  },
  backgroundImg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "60%",
    width: "100%",
    zIndex: 0,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#414264",
    marginBottom: 20,
    textAlign: "center",
  },
  cameraWrapper: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  placeholder: {
    width: "100%",
    height: "100%",
  },
  photoPreview: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  descriptionWrapper: {
    alignItems: "center",
    marginTop: 12,
  },
  description: {
    color: "#414264",
    fontSize: 16,
    marginBottom: 38,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginHorizontal: 8,
  },
  outlineBtn: {
    borderColor: "#94a3b8",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginHorizontal: 8,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineText: {
    color: "#1e293b",
  },
  fullScreenCameraContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  fullScreenCamera: {
    flex: 1,
  },
  captureContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    zIndex: 20,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    borderWidth: 5,
    borderColor: "#AAA",
  },
});
