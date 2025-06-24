import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  Linking,
} from "react-native";

export default function PhotoPage({ activity, onNext }) {
  const { addPagePoints, points, ThemedLogo } = useChallengeStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [scoreSelected, setScoreSelected] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const cameraRef = useRef(null);
  const { company } = useTheme();
  const Score = activity.on_app ? points : activity.score;

  // Handle screen dimension changes for rotation
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  if (!permission) {
    return null;
  }

  // Enhanced permission request handler
  const handlePermissionRequest = async () => {
    try {
      const result = await requestPermission();
      if (!result.granted) {
        // Show alert for manual settings navigation
        Alert.alert(
          "Camera Permission Required",
          "Camera access is needed to take photos. Please enable camera permission in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => {
                // For React Native, you might need to use Linking or expo-linking
                Linking.openSettings(); // Uncomment if you have linking imported
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert("Error", "Failed to request camera permission. Please try again.");
    }
  };

  if (!permission.granted) {
    return (
      <View style={cameraPermissionStyles.cameraPermissionContainer}>
        <Ionicons
          name="camera-outline"
          size={64}
          color="#666"
          style={cameraPermissionStyles.cameraPermissionIcon}
        />
        <Text style={cameraPermissionStyles.cameraPermissionTitle}>
          Camera Access Needed
        </Text>
        <Text style={cameraPermissionStyles.cameraPermissionMessage}>
          To continue, we need access to your device&apos;s camera. Please grant
          permission.
        </Text>
        <TouchableOpacity
          onPress={handlePermissionRequest}
          style={cameraPermissionStyles.cameraPermissionButton}
          activeOpacity={0.7}
        >
          <Text style={cameraPermissionStyles.cameraPermissionButtonText}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setPhoto(photoData.uri);
        setIsCameraOpen(false);
      } catch (error) {
        console.error('Photo capture error:', error);
        Alert.alert("Error", "Failed to take photo. Please try again.");
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setSubmitted(false);
    setIsCameraOpen(true);
  };

  const payLoad = {
    activity: activity.id,
    latitude: activity.location_lat,
    longitude: activity.location_lng,
    file: photo,
  };

  if (activity.on_app) {
    payLoad.driver_score = points;
  }

  const handleSubmit = async () => {
    if (!photo) return;
    setSubmitted(true);
    const fileUri = photo;
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
      onNext();
    } catch (error) {
      console.error("❌ Upload failed:", error.response?.data || error.message);
      setSubmitted(false);
    }
    addPagePoints(Score);
  };

  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };
  
  const handleActivityCompleted = () => {
    setIsActivityCompleted(true);
  };

  // Dynamic styles based on current screen dimensions
  const dynamicStyles = StyleSheet.create({
    photoPreviewContainer: {
      width: screenData.width * 0.9,
      height: Math.min(screenData.height * 0.4, screenData.width * 0.8), 
      overflow: "hidden",
    },
    cameraWrapper: {
      width: screenData.width * 0.8,
      height: Math.min(screenData.height * 0.35, screenData.width * 0.75),
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 20,
    },
  });

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

      {photo ? (
        <View style={styles.inner}>
          <Text style={styles.title}>Happy with your photo?</Text>
          <View style={dynamicStyles.photoPreviewContainer}>
            <Image
              source={{ uri: photo }}
              style={styles.photoPreview}
              resizeMode="contain"
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.outlineBtn} 
              onPress={retakePhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineText}>Retake</Text>
            </TouchableOpacity>
            {activity.on_app ? (
              scoreSelected ? (
                <ThemedButton
                  disabled={submitted}
                  title={submitted ? "Submitting..." : "Submit"}
                  onPress={handleSubmit}
                />
              ) : (
                <ThemedButton
                  title="Assign Score"
                  onPress={handleActivityCompleted}
                />
              )
            ) : (
              <ThemedButton
                disabled={submitted}
                title={submitted ? "Submitting..." : "Submit"}
                onPress={handleSubmit}
              />
            )}
          </View>
          <ScoreSetter
            isVisible={isActivityCompleted}
            onClose={handleCloseModal}
          />
        </View>
      ) : isCameraOpen ? (
        <View style={styles.fullScreenCameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.fullScreenCamera}
            facing="back"
          />
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePhoto}
              activeOpacity={0.7}
            />
          </View>
        </View>
      ) : (
        <View style={styles.inner}>
          <Text style={styles.title}>Take a photo!</Text>
          <View style={dynamicStyles.cameraWrapper}>
            <Image
              source={require("@/assets/images/TakePhoto.png")}
              style={styles.placeholder}
              resizeMode="contain"
            />
          </View>
          <View style={styles.descriptionWrapper}>
            <Text style={styles.description}>{activity.prompt}</Text>
            <ThemedButton
              title="Take Photo"
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
  placeholder: {
    width: "100%",
    height: "100%",
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
    marginTop: 20,
  },
  primaryBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginHorizontal: 8,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  disabledBtn: {
    backgroundColor: "#94a3b8",
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
    bottom: 80,
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

const cameraPermissionStyles = StyleSheet.create({
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8f8f8",
  },
  cameraPermissionIcon: {
    marginBottom: 20,
  },
  cameraPermissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  cameraPermissionMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  cameraPermissionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cameraPermissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});