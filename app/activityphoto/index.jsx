import ScoreSetter from "@/components/ScoreSetter";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import { Button } from "@react-navigation/elements";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PhotoPage({ activity, onNext, buttonLabel }) {
  const { addPagePoints, points } = useChallengeStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [scoreSelected, setScoreSelected] = useState(false);
  const cameraRef = useRef(null);
  const { company } = useTheme();
  console.log(activity, "Photo Page+++++");
  const Score = activity.on_app ? points : activity.score;

  if (!permission) {
    return null;
  }

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

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
      setIsCameraOpen(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setSubmitted(false);
    setIsCameraOpen(true);
  };

  const formData = new FormData();

  formData.append("activity", activity.id);
  formData.append("latitude", activity.location_lat);
  formData.append("longitude", activity.location_lng);
  formData.append("file", {
    uri: photo,
    name: "photo.jpg",
    type: "image/jpeg", // or "video/mp4" if it's a video
  });

  const handleSubmit = () => {
    // setSubmitted(true);
    addPagePoints(Score);
    onNext();
  };
  const handleCloseModal = () => {
    setIsActivityCompleted(false);
    setScoreSelected(true);
  };
  const handleActivityCompleted = () => {
    setIsActivityCompleted(true);
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

      {photo ? (
        <View style={styles.inner}>
          <Text style={styles.title}>Happy with your photo?</Text>
          <Image source={{ uri: photo }} style={styles.photoPreview} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={retakePhoto}>
              <Text style={styles.outlineText}>Retake</Text>
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
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={submitted ? undefined : handleSubmit}
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
        <View style={styles.fullScreenCameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.fullScreenCamera}
            facing="front"
          />
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePhoto}
            />
          </View>
        </View>
      ) : (
        <View style={styles.inner}>
          <Text style={styles.title}>Take a photo!</Text>
          <View style={styles.cameraWrapper}>
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
