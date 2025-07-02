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
import { isConnected } from "@/utility/Netinfo";
import React, { useRef, useState, useEffect } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
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
  const [cameraPermissionRequesting, setCameraPermissionRequesting] = useState(false);
  const [micPermissionRequesting, setMicPermissionRequesting] = useState(false);

  const { addPagePoints, points, ThemedLogo } = useChallengeStore();
  const cameraRef = useRef(null);
  const { company } = useTheme();
  const Score = activity.on_app ? points : activity.score;
  const videoTime = activity.video_timer;
  const player = useVideoPlayer(recordedVideo, (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Enhanced camera permission request handler
  const handleCameraPermissionRequest = async () => {
    if (cameraPermissionRequesting) return;
    
    setCameraPermissionRequesting(true);
    
    try {
      console.log('Requesting camera permission...');
      const result = await requestPermission();
      
      console.log('Camera permission result:', result);
      
      if (result.granted) {
        console.log('Camera permission granted');
      } else {
        console.log('Camera permission denied');
        
        if (result.canAskAgain === false) {
          Alert.alert(
            "Camera Permission Required",
            "Camera access has been permanently denied. Please enable it manually in your device settings to continue.",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Open Settings", 
                onPress: async () => {
                  try {
                    if (Platform.OS === 'android') {
                      await Linking.openSettings();
                    } else {
                      await Linking.openURL('app-settings:');
                    }
                  } catch (error) {
                    console.error('Failed to open settings:', error);
                    Alert.alert("Error", "Could not open settings. Please manually enable camera permission in your device settings.");
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert(
            "Camera Permission Required",
            "This app needs camera access to record videos. Please grant permission to continue.",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Try Again", 
                onPress: () => {
                  setTimeout(() => {
                    setCameraPermissionRequesting(false);
                    handleCameraPermissionRequest();
                  }, 500);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Camera permission request error:', error);
      Alert.alert(
        "Permission Error", 
        "Failed to request camera permission. Please try again or check your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Try Again", 
            onPress: () => {
              setTimeout(() => {
                setCameraPermissionRequesting(false);
                handleCameraPermissionRequest();
              }, 500);
            }
          }
        ]
      );
    } finally {
      setCameraPermissionRequesting(false);
    }
  };

  // Enhanced microphone permission request handler
  const handleMicrophonePermissionRequest = async () => {
    if (micPermissionRequesting) return;
    
    setMicPermissionRequesting(true);
    
    try {
      console.log('Requesting microphone permission...');
      const result = await requestMicrophonePermission();
      
      console.log('Microphone permission result:', result);
      
      if (result.granted) {
        console.log('Microphone permission granted');
      } else {
        console.log('Microphone permission denied');
        
        if (result.canAskAgain === false) {
          Alert.alert(
            "Microphone Permission Required",
            "Microphone access has been permanently denied. Please enable it manually in your device settings to continue.",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Open Settings", 
                onPress: async () => {
                  try {
                    if (Platform.OS === 'android') {
                      await Linking.openSettings();
                    } else {
                      await Linking.openURL('app-settings:');
                    }
                  } catch (error) {
                    console.error('Failed to open settings:', error);
                    Alert.alert("Error", "Could not open settings. Please manually enable microphone permission in your device settings.");
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert(
            "Microphone Permission Required",
            "This app needs microphone access to record audio with videos. Please grant permission to continue.",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Try Again", 
                onPress: () => {
                  setTimeout(() => {
                    setMicPermissionRequesting(false);
                    handleMicrophonePermissionRequest();
                  }, 500);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Microphone permission request error:', error);
      Alert.alert(
        "Permission Error", 
        "Failed to request microphone permission. Please try again or check your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Try Again", 
            onPress: () => {
              setTimeout(() => {
                setMicPermissionRequesting(false);
                handleMicrophonePermissionRequest();
              }, 500);
            }
          }
        ]
      );
    } finally {
      setMicPermissionRequesting(false);
    }
  };

  // Check permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (permission === null) {
        console.log('Camera permission is null, requesting...');
        setTimeout(() => {
          handleCameraPermissionRequest();
        }, 100);
      }
      
      if (microphonePermission === null) {
        console.log('Microphone permission is null, requesting...');
        setTimeout(() => {
          handleMicrophonePermissionRequest();
        }, 200);
      }
    };

    checkPermissions();
  }, []);

  if (!permission || !microphonePermission) {
    return (
      <View style={cameraStyles.permissionContainer}>
        <Text style={cameraStyles.permissionTitle}>
          Loading Permissions...
        </Text>
      </View>
    );
  }

  if (!permission.granted || !microphonePermission.granted) {
    const needsCameraPermission = !permission.granted;
    const needsMicPermission = !microphonePermission.granted;

    return (
      <View style={cameraStyles.permissionContainer}>
        <Ionicons
          name={needsCameraPermission ? "camera-outline" : "mic-outline"}
          size={64}
          color="#666"
          style={cameraStyles.permissionIcon}
        />
        <Text style={cameraStyles.permissionTitle}>
          {needsCameraPermission
            ? "Camera Access Needed"
            : "Microphone Access Needed"}
        </Text>
        <Text style={cameraStyles.permissionMessage}>
          {needsCameraPermission
            ? "To record videos, we need access to your device's camera. Please grant permission to continue."
            : "To record video with audio, we need access to your device's microphone. Please grant permission to continue."}
        </Text>
        
        <TouchableOpacity
          onPress={needsCameraPermission ? handleCameraPermissionRequest : handleMicrophonePermissionRequest}
          style={[
            cameraStyles.permissionButton,
            (cameraPermissionRequesting || micPermissionRequesting) && cameraStyles.permissionButtonDisabled
          ]}
          activeOpacity={0.7}
          disabled={cameraPermissionRequesting || micPermissionRequesting}
        >
          <Text style={cameraStyles.permissionButtonText}>
            {(cameraPermissionRequesting || micPermissionRequesting) 
              ? "Requesting..." 
              : needsCameraPermission 
                ? "Grant Camera Permission" 
                : "Grant Microphone Permission"
            }
          </Text>
        </TouchableOpacity>

        {/* Settings button for permanently denied permissions */}
        {((needsCameraPermission && permission?.canAskAgain === false) || 
          (needsMicPermission && microphonePermission?.canAskAgain === false)) && (
          <TouchableOpacity
            onPress={async () => {
              try {
                if (Platform.OS === 'android') {
                  await Linking.openSettings();
                } else {
                  await Linking.openURL('app-settings:');
                }
              } catch (error) {
                console.error('Failed to open settings:', error);
              }
            }}
            style={[cameraStyles.permissionButton, { marginTop: 10, backgroundColor: '#FF6B6B' }]}
            activeOpacity={0.7}
          >
            <Text style={cameraStyles.permissionButtonText}>
              Open Settings
            </Text>
          </TouchableOpacity>
        )}
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
          quality: "480p",
          maxDuration: videoTime,
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

    const token = await AsyncStorage.getItem("AUTH_TOKEN");
    const net = await isConnected();

    const payload = {
      activity: activity.id,
      latitude: activity.location_lat,
      longitude: activity.location_lng,
      fileUri,
      fileName,
      fileType,
      driver_score: activity.on_app ? points : null,
      type: "video",
    };

    if (!net) {
      try {
        const rawQueue = await AsyncStorage.getItem("offline_submissions1");
        const offlineQueue = rawQueue ? JSON.parse(rawQueue) : {};
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        offlineQueue[uniqueId] = payload;
        await AsyncStorage.setItem("offline_submissions1", JSON.stringify(offlineQueue));
        Alert.alert("Offline", "You're offline. Video saved locally.");
        addPagePoints(Score);
        onNext();
      } catch (err) {
        console.error("❌ Failed to save offline video:", err);
        Alert.alert("Error", "Could not save submission offline.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Online submission
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

    try {
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
    } catch (error) {
      console.error("❌ Upload failed:", error.response?.data || error.message);
      Alert.alert("Upload Failed", "Please try again.");
    } finally {
      setIsSubmitting(false);
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
              <ThemedButton
                title={isSubmitting ? "Submitting..." : "Submit"}
                disabled={isSubmitting}
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
    marginBottom: 60,
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
    width: "80%",
    height: "45%",
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
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8f8f8",
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
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
  permissionButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
 