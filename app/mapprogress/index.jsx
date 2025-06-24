import TukOnMeLogo from "@/assets/icons/tukonmefull.png";
import StartActivity from "@/components/StartActivity";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import PasswordModal from "../../components/PasswordModel";

export default function MapPage() {
  const {
    activeChallenge,
    completedTaskIds,
    setSelectedTask,
    resetAllPoints,
    resetCompletedTaskIds,
    ThemedColor,
    ThemedLogo,
  } = useChallengeStore();
  const { company } = useTheme();
  const [progress, setProgress] = useState();
  const randomOrder = activeChallenge?.random_order;

  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [markerPositions, setMarkerPositions] = useState([]);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get("window"));

  const convertToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  const [timer, setTimer] = useState(() =>
    convertToSeconds(activeChallenge?.time_limit || "00:00:00")
  );

  const [showStartActivity, setShowStartActivity] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExitPasswordModal, setShowExitPasswordModal] = useState(false);

  const handlePasswordSuccess = () => {
    setShowStartActivity(true);
  };

  const handleExitPasswordSuccess = () => {
    resetAllPoints();
    resetCompletedTaskIds();
    router.push("/");
  };

  const totalDots = 6;

  // Function to truncate text
  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  // Listen for screen dimension changes (rotation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Function to convert lat/lng to screen coordinates
  const coordinateToPoint = (coordinate, region, screenWidth, screenHeight) => {
    if (!region) return { x: 0, y: 0 };

    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

    const x =
      ((coordinate.longitude - longitude) / longitudeDelta + 0.5) * screenWidth;
    const y =
      ((latitude - coordinate.latitude) / latitudeDelta + 0.5) * screenHeight;

    return { x, y };
  };

  useEffect(() => {
    setSelectedTask(selectedTaskId);
  }, [selectedTaskId, setSelectedTask]);

  useEffect(() => {
    if (progress === 100) {
      router.push("/thankyou");
    }
  }, [progress, router]);

  useEffect(() => {
    if (activeChallenge?.tasks?.length) {
      const total = activeChallenge.tasks.length;
      const completed = completedTaskIds?.length;
      const percent = Math.round((completed / total) * 100);
      setProgress(percent);
    }
  }, [completedTaskIds, activeChallenge]);

  // Function to check if a task is available based on randomOrder
  const isTaskAvailable = (taskId, taskIndex) => {
    if (randomOrder === true) {
      return !completedTaskIds.includes(taskId);
    } else {
      if (completedTaskIds.includes(taskId)) {
        return false;
      }
      const tasksBeforeThis = activeChallenge.tasks.slice(0, taskIndex);
      const allPreviousCompleted = tasksBeforeThis.every((task) =>
        completedTaskIds.includes(task.id)
      );
      return allPreviousCompleted;
    }
  };

  const extractTaskLocations = (activeChallenge) => {
    if (!activeChallenge?.tasks) return [];
    return activeChallenge.tasks
      .map((task, index) => {
        const firstActivity = task.activities?.[0];
        if (
          firstActivity?.location_lat != null &&
          firstActivity?.location_lng != null
        ) {
          return {
            id: task.id,
            latitude: firstActivity.location_lat,
            longitude: firstActivity.location_lng,
            title: task.task_name,
            index: index,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const markers = extractTaskLocations(activeChallenge);

  // Update marker positions when map region changes OR screen rotates
  useEffect(() => {
    if (mapRegion && markers.length > 0) {
      const positions = markers.map((marker) => {
        const point = coordinateToPoint(
          { latitude: marker.latitude, longitude: marker.longitude },
          mapRegion,
          screenDimensions.width,
          screenDimensions.height
        );
        return {
          ...marker,
          x: point.x,
          y: point.y,
        };
      });
      setMarkerPositions(positions);
    }
  }, [mapRegion, markers, screenDimensions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    setShowExitPasswordModal(true);
  };

  function getDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  useEffect(() => {
    let locationSubscription;

    const startLocationUpdates = async () => {
      await Location.requestForegroundPermissionsAsync();

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 20000,
          distanceInterval: 30,
        },
        (location) => {
          const userLoc = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCurrentLocation(userLoc);

          markers.forEach((marker) => {
            const distance = getDistance(
              userLoc.latitude,
              userLoc.longitude,
              marker.latitude,
              marker.longitude
            );

            if (
              distance < 50 &&
              !showStartActivity &&
              isTaskAvailable(marker.id, marker.index)
            ) {
              setSelectedTaskId(marker.id);
              setShowStartActivity(true);
            }
          });
        }
      );
    };

    startLocationUpdates();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [markers, showStartActivity, completedTaskIds, randomOrder]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: markers[0]?.latitude || 0,
          longitude: markers[0]?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={(region) => {
          setMapRegion(region);
        }}
      >
        {/* Simple dot markers without labels */}
        {markers.map((marker, index) => {
          const isCompleted = completedTaskIds.includes(marker.id);
          const isAvailable = isTaskAvailable(marker.id, marker.index);

          let pinColor = ThemedColor || company.theme.primary;
          if (isCompleted) {
            pinColor = "#B0B0B0";
          } else if (!isAvailable) {
            pinColor = "#666666";
          }

          return (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
            >
              <View style={[styles.simpleDot, { backgroundColor: pinColor }]}>
                <Ionicons
                  name={
                    isCompleted
                      ? "checkmark"
                      : !isAvailable
                      ? "lock-closed"
                      : "location-sharp"
                  }
                  size={12}
                  color="#fff"
                />
              </View>
            </Marker>
          );
        })}

        {currentLocation && (
          <Marker coordinate={currentLocation}>
            <View style={styles.currentLocationOuter}>
              <View
                style={[
                  styles.currentLocationInner,
                  { backgroundColor: ThemedColor || company.theme.primary },
                ]}
              />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Custom marker labels positioned absolutely - only show when no modals are open */}
      {!showStartActivity && !showPasswordModal && !showExitPasswordModal && markerPositions.map((marker, index) => {
        const isCompleted = completedTaskIds.includes(marker.id);
        const isAvailable = isTaskAvailable(marker.id, marker.index);

        // Don't render if marker is off-screen - use current screen dimensions
        if (
          marker.x < -100 ||
          marker.x > screenDimensions.width + 100 ||
          marker.y < -100 ||
          marker.y > screenDimensions.height + 100
        ) {
          return null;
        }

        const displayText = truncateText(marker.title || `Task ${index + 1}`);
        const lockText = !isAvailable && !isCompleted ? " 🔒" : "";

        return (
          <TouchableOpacity
            key={`label-${marker.id}`}
            style={[
              styles.customMarkerLabel,
              {
                left: marker.x - 75, // Center the label (150/2 = 75)
                top: marker.y - 80, // Position above the marker
              },
            ]}
            onPress={() => {
              if (isAvailable && !isCompleted) {
                setSelectedTaskId(marker.id);
                setShowPasswordModal(true);
              } else if (!isAvailable && !isCompleted) {
                if (randomOrder === false) {
                  alert("Complete previous tasks first!");
                }
              }
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.labelContainer,
                {
                  backgroundColor: isCompleted
                    ? "rgba(176, 176, 176, 0.9)"
                    : !isAvailable
                    ? "rgba(102, 102, 102, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                },
              ]}
            >
              <Text style={styles.labelTextCustom} numberOfLines={2}>
                {displayText + lockText}
              </Text>
            </View>
            {/* Arrow pointing down to marker */}
            <View
              style={[
                styles.labelArrow,
                {
                  borderTopColor: isCompleted
                    ? "rgba(176, 176, 176, 0.9)"
                    : !isAvailable
                    ? "rgba(102, 102, 102, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                },
              ]}
            />
          </TouchableOpacity>
        );
      })}

      {showStartActivity && selectedTaskId && (
        <StartActivity
          onClose={() => setShowStartActivity(false)}
          ID={selectedTaskId}
        />
      )}

      <View style={styles.header}>
        <ThemedButton
          title="Exit"
          onPress={handleExit}
          style={styles.exitButton}
        />

        <View style={styles.progressBarContainer}>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>Your progress</Text>
            <Text style={styles.progressPercentage}>{progress}% complete</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: ThemedColor || company.theme.primary,
                },
              ]}
            />
            <View style={styles.dotsContainer}>
              {[...Array(totalDots)].map((_, index) => {
                const dotPosition = (index / (totalDots - 1)) * 100;
                return (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      dotPosition <= progress
                        ? styles.dotFilled
                        : {
                            backgroundColor:
                              ThemedColor || company.theme.primary,
                          },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <ThemedButton
          title=" Re-center"
          style={styles.recenterButton}
          icon={<Feather name="navigation" style={styles.recenterIcon} />}
          onPress={() => {
            if (currentLocation && mapRef.current) {
              mapRef.current.animateToRegion({
                ...currentLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }}
        />
      </View>

      {/* Password Modal for Task Start */}
      {showPasswordModal && (
        <PasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordSuccess}
        />
      )}

      {/* Password Modal for Exit */}
      {showExitPasswordModal && (
        <PasswordModal
          visible={showExitPasswordModal}
          onClose={() => setShowExitPasswordModal(false)}
          onSuccess={handleExitPasswordSuccess}
        />
      )}

      <View style={styles.timerContainer}>
        <View
          style={[styles.timerBox, timer <= 30 ? styles.timerWarning : null]}
        >
          <Ionicons
            name="stopwatch-outline"
            style={[
              styles.timerIcon,
              timer <= 30 ? styles.timerwarningicon : null,
            ]}
          />
          <Text
            style={[
              styles.timerText,
              timer <= 30 ? styles.timerwarningtext : null,
            ]}
          >
            {timer === 0 ? (
              <Text style={styles.timerExpiredText}>Times Up</Text>
            ) : (
              formatTime(timer)
            )}
          </Text>
        </View>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={{ uri: ThemedLogo } || company.fulllogo || TukOnMeLogo}
          style={styles.logoImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBarContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    width: "60%",
    maxWidth: 550,
  },
  progressTextContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
    color: "#A0A0AA",
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#414264",
  },
  progressBar: {
    position: "relative",
    width: "100%",
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#003366",
    borderRadius: 5,
  },
  dotsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  dotFilled: {
    backgroundColor: "white",
  },
  // Simple dot marker styles
  simpleDot: {
    width: 34,
    height: 34,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // Custom label styles
  customMarkerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    zIndex: 100, // Reduced z-index to stay below modals
  },
  labelContainer: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 150,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  labelTextCustom: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  labelArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    alignSelf: "center",
    marginTop: -1,
  },
  currentLocationOuter: {
    width: 25,
    height: 25,
    borderRadius: 50,
    backgroundColor: "#003C5F55",
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationInner: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: "#003C5F",
  },
  recenterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  recenterIcon: {
    color: "white",
    fontSize: 20,
    marginRight: 8,
  },
  timerContainer: {
    position: "absolute",
    bottom: 60,
    right: 20,
    zIndex: 1,
  },
  timerBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timerWarning: {
    backgroundColor: "#fce4e4",
    borderColor: "#FF3E3E",
    borderWidth: 2,
  },
  timerwarningicon: {
    color: "#FF3E3E",
  },
  timerIcon: {
    fontSize: 24,
    color: "#414264",
    marginRight: 12,
  },
  timerText: {
    fontSize: 18,
    color: "#414264",
  },
  timerwarningtext: {
    color: "#FF3E3E",
  },
  timerExpiredText: {
    color: "#FF3E3E",
    fontWeight: "bold",
  },
  logoContainer: {
    position: "absolute",
    backgroundColor: "transparent",
    borderRadius: 20,
    padding: 10,
    bottom: 60,
    left: 20,
    zIndex: 1,
  },
  logoImage: {
    width: 100,
    height: 60,
    resizeMode: "contain",
  },
});