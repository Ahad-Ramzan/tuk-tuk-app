// import { CameraView, useCameraPermissions } from "expo-camera";
// import { useRef, useState } from "react";
// import { Button, StyleSheet, Text, View } from "react-native";
// import { Video } from "expo-av";

// export default function App() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const cameraRef = useRef < CameraView > null;
//   const [videoUri, setVideoUri] = (useState < string) | (null > null);
//   const [recording, setRecording] = useState(false);

//   if (!permission) {
//     return null;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={{ textAlign: "center" }}>
//           We need your permission to use the camera
//         </Text>
//         <Button onPress={requestPermission} title="Grant permission" />
//       </View>
//     );
//   }

//   const handleStartRecording = async () => {
//     if (cameraRef.current) {
//       setRecording(true);
//       const video = await cameraRef.current.recordAsync();
//       setVideoUri(video.uri);
//       setRecording(false);
//     }
//   };

//   const handleStopRecording = () => {
//     if (cameraRef.current) {
//       cameraRef.current.stopRecording();
//     }
//   };

//   const renderCamera = () => {
//     return (
//       <CameraView style={styles.camera} ref={cameraRef} facing="back">
//         <View style={styles.shutterContainer}>
//           <Button
//             title={recording ? "Stop Recording" : "Start Recording"}
//             onPress={recording ? handleStopRecording : handleStartRecording}
//           />
//         </View>
//       </CameraView>
//     );
//   };

//   if (videoUri) {
//     return (
//       <View style={styles.container}>
//         <Text style={{ textAlign: "center" }}>Video Preview</Text>
//         <Video
//           source={{ uri: videoUri }}
//           style={styles.video}
//           useNativeControls
//           resizeMode="contain"
//           shouldPlay
//         />
//         <Button title="Retake Video" onPress={() => setVideoUri(null)} />
//       </View>
//     );
//   }

//   return <View style={styles.container}>{renderCamera()}</View>;
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   camera: {
//     flex: 1,
//     width: "100%",
//   },
//   shutterContainer: {
//     position: "absolute",
//     bottom: 40,
//     left: 0,
//     right: 0,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   video: {
//     width: "100%",
//     height: 300,
//     backgroundColor: "black",
//   },
// });

import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
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
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

export default function VideoScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { company } = useTheme();
  const router = useRouter();

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
    // Handle photo upload or score logic here
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
          onPress={() => router.push("/feedback")}
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