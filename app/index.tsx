import ThemedButton from "@/components/ThemedButton";
import { AuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getChallenges, postActiveChallenge } from "@/services/api";
import { useChallengeStore } from "@/store/challengeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import "../ReactotronConfig";

export default function SlideshowScreen() {
  const router = useRouter();
  const { company } = useTheme();
  const { challenges, setChallenges } = useChallengeStore();
  const { isAuthenticated } = useContext(AuthContext);
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        const data = await getChallenges(token || "");
        setChallenges(data?.results || []);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      }
    };
    if (isAuthenticated) {
      fetchChallenges();
    }
  }, [setChallenges, isAuthenticated, router]);

  const handleStartActivity = (challengeId: number) => {
    const payload = {
      challenge_id: challengeId,
      is_active: true,
    };
    postActiveChallenge(payload);

    router.push({
      pathname: "/onboarding",
      params: { id: challengeId.toString() },
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* Top Right Logos */}
      <View style={styles.topRightContainer}>
        <Image
          source={require("@/assets/icons/Vector.png")}
          style={styles.logo}
        />
        <View style={styles.divider} />
        <Image source={company.logo} style={styles.logo} />
      </View>

      {/* Challenge List */}
      <ScrollView contentContainerStyle={styles.challengeList}>
        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeItem}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.timeLimit}>
                Time Limit: {challenge.time_limit} seconds
              </Text>
            </View>
            <ThemedButton
              title="Start Activity"
              onPress={() => handleStartActivity(challenge.id)}
              style={styles.activityButton}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  topRightContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 40,
    marginRight: 20,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#ccc",
    marginHorizontal: 10,
  },
  challengeList: {
    padding: 20,
    paddingTop: 100,
  },
  challengeItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeInfo: {
    flex: 1,
    paddingRight: 10,
  },
  activityButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  challengeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  timeLimit: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
});
