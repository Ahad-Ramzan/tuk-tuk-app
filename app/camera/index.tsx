import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/context/ThemeContext";
import ThemedButton from "@/components/ThemedButton";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { company } = useTheme();
 

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) setPhotoUri(photo.uri);
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require("@/assets/images/bgonboarding.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <Image
          source={company.fulllogo}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Happy with your photo?</Text>

        <Image
          source={{ uri: photoUri }}
          style={styles.photoPreview}
          contentFit="cover"
        />

        <View style={styles.buttonRow}>
          <ThemedButton title="Retake" onPress={handleRetake} />
          <ThemedButton
            title={submitted ? "Assign Score" : "Submit"}
            onPress={submitted ? handleSubmit : undefined}
          />
        </View>
        <ThemedButton
          title="Next"
          onPress={() => router.push("/activitycomplete")}
          style={{ position: "absolute", bottom: 30, right: 20, zIndex: 2 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={styles.shutterButton}
          onPress={handleTakePicture}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: screenWidth,
    height: "60%",
    zIndex: 1,
  },
  logo: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 160,
    height: 60,
    zIndex: 2,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  captureContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    zIndex: 10,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    borderWidth: 5,
    borderColor: "#AAA",
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    color: "#414264",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  photoPreview: {
    width: "100%",
    height: 550,
    borderRadius: 12,
    zIndex: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 16,
    zIndex: 10,
  },
});
