import TukOnMeLogo from "@/assets/icons/tukonmefull.png";
import StartActivity from "@/components/StartActivity";
import ThemedButton from "@/components/ThemedButton";
import { useChallengeStore } from "@/store/challengeStore";
import { useTheme } from "@/context/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapPage() {
  const { activeChallenge } = useChallengeStore();
  const { company } = useTheme();
  const [progress, setProgress] = useState(45);
  const [timer, setTimer] = useState(60);
  const [showStartActivity, setShowStartActivity] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const totalDots = 6;

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleExit = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
           latitude: markers[0].latitude,
      longitude: markers[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={`Task ${index + 1}`}
            description="Activity Location"
            pinColor={company.theme.primary}
            onPress={() => {
              setSelectedTaskId(marker.id);
              // console.log(marker.id);
              setShowStartActivity(true);
            }}
          />
        ))}
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
    width: 12,
    height: 12,
    borderRadius: 50,
    borderWidth: 1,
    // borderColor: "#003366",
  },
  dotFilled: {
    backgroundColor: "white",
  },
  // dotEmpty: {
  //   backgroundColor: "#003366",
  // },
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
