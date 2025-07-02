import ThemedButton from "@/components/ThemedButton";
import { AuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getChallenges, postActiveChallenge } from "@/services/api";
import { useChallengeStore } from "@/store/challengeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { isConnected } from "@/utility/Netinfo";
import React, { useContext, useEffect, useState } from "react";
import { syncOfflineSubmissions } from "@/utility/syncOffline";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import "../ReactotronConfig";
import useAuth from "@/hooks/useAuth";

export default function SlideshowScreen() {
  const router = useRouter();
  const { company } = useTheme();
  const { challenges, setChallenges, setBrandDetails } = useChallengeStore();
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { logout } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const checkConnectionAndSync = async () => {
      const Net = await isConnected();
      if (Net) {
        syncOfflineSubmissions();
      }
    };
    checkConnectionAndSync();
  }, [router]);


  const fetchChallenges = async (pageUrl?: string) => {
    const token = await AsyncStorage.getItem("user_token");
    const online = await isConnected();
    console.log(online, "connection status index.jsx");

    if (online) {
      try {
        const data = await getChallenges(token || "", pageUrl);
        setChallenges(data?.results || []);
        setTotalCount(data?.count || 0);
        setNextPageUrl(data?.next || null);
        setPrevPageUrl(data?.previous || null);

        // Save to AsyncStorage
        await AsyncStorage.setItem("cached_challenges", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch online challenges:", error);
      }
    } else {
      try {
        const cached = await AsyncStorage.getItem("cached_challenges");
        if (cached) {
          const data = JSON.parse(cached);
          setChallenges(data?.results || []);
          setTotalCount(data?.count || 0);
          setNextPageUrl(null); // Pagination offline is not supported
          setPrevPageUrl(null);
        }
      } catch (err) {
        console.log("No cached data available", err);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChallenges();
    }
  }, [setChallenges, isAuthenticated, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  };

  const handleNext = () => {
    if (nextPageUrl) {
      fetchChallenges(nextPageUrl);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (prevPageUrl) {
      fetchChallenges(prevPageUrl);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem("USER_EMAIL");
      await AsyncStorage.removeItem("USER_PIN");

      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleStartActivity = async (challengeId: number) => {
    if (challengeId && challenges.length) {
      const foundChallenge = challenges.find(
        (ch) => ch.id === Number(challengeId)
      );
      if (foundChallenge?.brand) {
        const { image, color_scheme } = foundChallenge?.brand;
        setBrandDetails(image, color_scheme);
        // console.log("brand details saved to store:" ,{image,color_scheme})
      }
    }
    // const payload = {
    //   challenge_id: challengeId,
    //   is_active: true,
    // };
    // await postActiveChallenge(payload);

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
      <ThemedButton
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
      <View style={styles.topRightContainer}>
        <Image
          source={require("@/assets/icons/Vector.png")}
          style={styles.logo}
        />

        <View style={styles.divider} />
        <Image source={company.logo} style={styles.logo} />
      </View>

      {/* Challenge List */}
      <ScrollView
        contentContainerStyle={styles.challengeList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
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

      {/* Pagination Controls */}
      {totalCount > 10 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={!prevPageUrl}
            style={[
              styles.paginationButton,
              !prevPageUrl && styles.disabledButton,
            ]}
          >
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>Page {currentPage}</Text>

          <TouchableOpacity
            onPress={handleNext}
            disabled={!nextPageUrl}
            style={[
              styles.paginationButton,
              !nextPageUrl && styles.disabledButton,
            ]}
          >
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "70%",
    bottom: 0,
  },
  topRightContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 40,
    marginRight: 20,
  },
  logoutButton: {
    backgroundColor: "#003366",
    position: "absolute",
    top: 40,
    left: 20,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  divider: {
    width: 1,
    height: 60,
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
    backgroundColor: "#003366",
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: "#333",
  },
  pageText: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 8,
  },
});
