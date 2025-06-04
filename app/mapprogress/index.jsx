import TukOnMeLogo from "@/assets/icons/tukonmefull.png";
import StartActivity from "@/components/StartActivity";
import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { postActiveChallenge } from "@/services/api";

export default function MapPage() {
  const { activeChallenge, completedTaskIds, setSelectedTask, resetAllPoints, resetCompletedTaskIds } =
    useChallengeStore();
  const { company } = useTheme();
  const [progress, setProgress] = useState();

  const mapRef = useRef(null);
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
 

  const totalDots = 6;
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

  const extractTaskLocations = (activeChallenge) => {
    if (!activeChallenge?.tasks) return [];
    return activeChallenge.tasks
      .map((task) => {
        const firstActivity = task.activities?.[0];
        if (
          firstActivity?.location_lat != null &&
          firstActivity?.location_lng != null
        ) {
          return {
            id: task.id,
            latitude: firstActivity.location_lat,
            longitude: firstActivity.location_lng,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const markers = extractTaskLocations(activeChallenge);

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
     const payload = {
          challenge_id: activeChallenge?.id ,
          is_active: false,
        }
        
        postActiveChallenge(payload);
        resetAllPoints();
        resetCompletedTaskIds();
    router.push("/");
  };

  function getDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // meters
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
          timeInterval: 2000,
          distanceInterval: 5,
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

            if (distance < 30 && !showStartActivity) {
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
  }, [markers, showStartActivity]);

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
      >
        {markers.map((marker, index) => {
          const isCompleted = completedTaskIds.includes(marker.id);

          return (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => {
                if (!isCompleted) {
                  setSelectedTaskId(marker.id);
                  setShowStartActivity(true);
                }
              }}
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.markerIcon,
                    {
                      backgroundColor: isCompleted
                        ? "#B0B0B0" // Gray for completed
                        : company.theme.primary,
                      opacity: isCompleted ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons name="location-sharp" size={16} color="#fff" />
                </View>
                <View style={styles.labelBox}>
                  <Text style={styles.labelText}>{`Stop ${index + 1}`}</Text>
                </View>
              </View>
            </Marker>
          );
        })}

        {currentLocation && (
          <Marker coordinate={currentLocation}>
            <View style={[styles.currentLocationOuter]}>
              <View
                style={[
                  styles.currentLocationInner,
                  { backgroundColor: company.theme.primary },
                ]}
              />
            </View>
          </Marker>
        )}
      </MapView>

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
                  backgroundColor: company.theme.primary,
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
                        : { backgroundColor: company.theme.primary },
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
          source={company.fulllogo || TukOnMeLogo}
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
  mapImageContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    // borderWidth: 1,
    // borderColor: "#003366",
  },
  dotFilled: {
    backgroundColor: "white",
  },
  // dotEmpty: {
  //   backgroundColor: "#003366",
  // },
  markerContainer: {
    alignItems: "center",
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#003C5F", // default (will be overridden by company.theme.primary)
    borderWidth: 2,
    borderColor: "#fff",
  },
  labelBox: {
    marginTop: 4,
    backgroundColor: "#",
    paddingVertical: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  labelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D1B20",
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
    // borderRadius: 25,
  },
  recenterIcon: {
    color: "white",
    fontSize: 20,
    marginRight: 8,
  },
  recenterText: {
    color: "white",
    fontSize: 14,
  },
  timerContainer: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: [{ translateX: -150 }],
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
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    bottom: 40,
    left: 20,
    zIndex: 1,
  },
  logoImage: {
    width: 140,
    height: 60,
    resizeMode: "contain",
  },
  nextButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
});
