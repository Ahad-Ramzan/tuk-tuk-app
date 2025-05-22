import ThemedButton from "@/components/ThemedButton";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";
import { typeChallengeData, typeSlide } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function SlideshowScreen() {
  const router = useRouter();
  const { company } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const imageSize = isLandscape ? height * 0.5 : width * 0.7;

  const { id } = useLocalSearchParams();
  const { challenges,setActiveChallenge } = useChallengeStore();
  const [challengeData, setChallengeData] = useState<typeChallengeData | null>(
    null
  );
  const [slides, setSlides] = useState<typeSlide[]>([]);
  // console.log("challengeData", challengeData);

  useEffect(() => {
    if (id && challenges.length) {
      const foundChallenge = challenges.find((ch) => ch.id === Number(id));

      if (foundChallenge) {
        console.log(foundChallenge)
        setChallengeData(foundChallenge);
        setActiveChallenge(foundChallenge);
      }

      if (foundChallenge?.prompt) {
        const prompts = foundChallenge.prompt;
        const generatedSlides: typeSlide[] = Object.entries(prompts)
          .filter(([_, value]) => !!value)
          .map(([key, value], index) => ({
            id: index + 1,
            paragraph: value,
            image:
              index === 0
                ? require("@/assets/images/onboarding1.png")
                : index === 1
                ? require("@/assets/images/onboarding2.png")
                : require("@/assets/images/onboarding3.png"),
          }));

        setSlides(generatedSlides);
      }
    }
  }, [id, challenges]);

  if (!challengeData) {
    return (
      <View>
        <Text>Loading challenge...</Text>
      </View>
    );
  }

  const isLastSlide = currentIndex === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      router.push("/mapprogress");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
          {currentIndex !== 0 ? (
            <Ionicons name="chevron-back" size={16} color="#333" />
          ) : null}
          <Text style={styles.exitLabel}>
            {currentIndex === 0 ? "" : "Back"}
          </Text>
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <Image
            source={require("@/assets/icons/Vector.png")}
            style={styles.logo}
          />
          <View style={styles.divider} />
          <Image source={company.logo} style={styles.logo} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.paragraph}>{slides[currentIndex].paragraph}</Text>

        <Image
          source={slides[currentIndex].image}
          style={{
            width: imageSize,
            height: imageSize,
            marginBottom: 24,
          }}
          resizeMode="contain"
        />

        <ThemedButton
          title={isLastSlide ? "Start" : "Next"}
          onPress={handleNext}
          style={styles.nextButton}
        />

        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && {
                  backgroundColor: company.theme.primary,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  bgImage: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "70%",
    zIndex: 0,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  exitButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  exitLabel: {
    color: "#414264",
    marginLeft: 4,
    fontSize: 18,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  divider: {
    width: 3,
    height: 60,
    backgroundColor: "#aaa",
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  paragraph: {
    textAlign: "center",
    color: "#414264",
    fontSize: 20,
    marginBottom: 20,
  },
  dots: {
    flexDirection: "row",
    marginTop: 20,
  },
  dot: {
    width: 20,
    height: 20,
    backgroundColor: "#ccc",
    borderRadius: 50,
    marginHorizontal: 10,
  },
  nextButton: {
    marginTop: -30,
    paddingHorizontal: 50,
    paddingVertical: 15,
  },
});
