import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { CameraType, useVideoPlayer, VideoView } from "expo-video";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VideoPage({ activity, onNext }) {
  const [facing] = useState(CameraType?.back);
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [scoreSelected, setScoreSelected] = useState(false);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addPagePoints, points, ThemedLogo } = useChallengeStore();
  const cameraRef = useRef(null);
  const { company } = useTheme();
  const Score = activity.on_app ? points : activity.score;
  const videoTime = activity.video_time;
  const player = useVideoPlayer(recordedVideo, (player) => {
    player.loop = true;
    player.muted = false;
  });

  if (!permission || !microphonePermission) {
    return <View />;
  }

  if (!permission.granted || !microphonePermission.granted) {
    return (
      <View style={cameraStyles.permissionContainer}>
        <Ionicons
          name={!permission.granted ? "camera-outline" : "mic-outline"}
          size={64}
          color="#888"
        />
        <Text style={cameraStyles.permissionTitle}>
          {!permission.granted
            ? "Camera Access Needed"
            : "Microphone Access Needed"}
        </Text>
        <Text style={cameraStyles.permissionMessage}>
          {!permission.granted
            ? "To use this feature, we need access to your camera. Please grant permission."
            : "To record video with audio, we need access to your microphone. Please grant permission."}
        </Text>
        <TouchableOpacity
          onPress={
            !permission.granted
              ? requestPermission
              : requestMicrophonePermission
          }
          style={cameraStyles.permissionButton}
        >
          <Text style={cameraStyles.permissionButtonText}>
            {!permission.granted
              ? "Grant Camera Access"
              : "Grant Microphone Access"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };
  const handleActivityCompleted = () => {
    setIsActivityCompleted(true);
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          quality: "720p",
          maxDuration: videoTime || 20,
          mute: false,
        });
        setRecordedVideo(video.uri);
      } catch (error) {
        console.error("Error recording video:", error);
        Alert.alert("Error", "Failed to record video");
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const retakeVideo = () => {
    setRecordedVideo(null);
    if (player) {
      player.pause();
    }
  };

  const handleSubmit = async () => {
    if (!recordedVideo) return;
    setIsSubmitting(true);
    const fileUri = recordedVideo;
    const fileName = fileUri.split("/").pop();
    const fileType = fileName.split(".").pop();
    const formData = new FormData();
    formData.append("activity", activity.id);
    formData.append("latitude", activity.location_lat);
    formData.append("longitude", activity.location_lng);
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: `video/${fileType}`,
    });
    if (activity.on_app) {
      formData.append("driver_score", points);
    }

    const token = await AsyncStorage.getItem("AUTH_TOKEN");

    try {
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
      console.error("❌ Upload failed:", error.response?.data || error.message);
    } finally {
      setIsSubmitting(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        {ThemedLogo ? (
          <Image source={{ uri: ThemedLogo }} style={styles.logo1} />
        ) : (
          <Image
            source={company.fulllogo}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImg}
        resizeMode="cover"
      />

      {recordedVideo ? (
        <View style={styles.inner}>
          <Text style={styles.title}>Happy with your video?</Text>
          <VideoView
            style={styles.photoPreview}
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="contain"
            shouldPlay
            showsTimecodes={false}
            requiresLinearPlayback={true}
            nativeControls={false}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={retakeVideo}>
              <Text style={styles.outlineText}>Retake</Text>
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
                  onPress={handleActivityCompleted}
                />
              )
            ) : (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScoreSetter
            isVisible={isActivityCompleted}
            onClose={handleCloseModal}
            
          />
        </View>
      ) : isCameraOpen ? (
        <View style={styles.container1}>
          <CameraView
            style={styles.camera}
            facing={facing}
            ref={cameraRef}
            mode="video"
          />

          <View style={styles.recordingControls}>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.redDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View
                style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordButtonInnerActive,
                ]}
              />
            </TouchableOpacity>
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
  container1: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 20,
  },
  flipButton: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
  },
  flipText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  recordingControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
    marginRight: 8,
  },
  recordingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  recordButtonActive: {
    borderColor: "red",
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "red",
  },
  recordButtonInnerActive: {
    borderRadius: 8,
    width: 40,
    height: 40,
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
  logo1: {
    width: 180,
    height: 80,
    resizeMode: "contain",
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
    width: 600,
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

const cameraStyles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 12,
    color: "#333",
  },
  permissionMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
