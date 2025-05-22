import React, { useState } from "react";
import { View, Text, TextInput, Image, StyleSheet } from "react-native";

import ThemedButton from "@/components/ThemedButton"; // Imported ThemedButton
import { useTheme } from "@/context/ThemeContext";
import { typeActivity } from "@/types";

export default function TextQuiz({ activity }:{ activity: typeActivity }) {
  const [answer, setAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { company } = useTheme();
  

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImage}
      />


      {/* Logo in the top right corner */}
      <View style={styles.logoContainer}>
        <Image
          source={company.fulllogo} // Check this path!
          style={styles.logo}
        />
      </View>

      <View style={styles.contentContainer}>
        {/* Main content */}
        <View style={styles.card}>
          <Text style={styles.heading}>Answer the question</Text>

          {/* Circular Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require("@/assets/images/activityframe1.png")}
              style={styles.circularImage}
            />
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {activity.prompt}
          </Text>

          {/* Answer Input */}
          <TextInput
            style={[
              styles.textInput,
              { minHeight: 150, textAlignVertical: "top" },
            ]}
            placeholder="Your answer goes here"
            multiline
            numberOfLines={8}
            value={answer}
            onChangeText={setAnswer}
          />

          {/* Submit / Assign Score Button */}
          <View style={styles.buttonContainer}>
            <ThemedButton
              onPress={() => setSubmitted(true)}
              title={submitted ? "Assign Score" : "Submit"}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3", // Light Gray background color
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "60%",
    zIndex: 1, // Ensure background image is behind other content
  },
  nextButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 2,
  },
  contentContainer: {
    width: "90%",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // ensure it overlaps correctly
    backgroundColor: "transparent", // Make this transparent
    zIndex: 2,
  },
  logoContainer: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  logo: {
    width: 140,
    height: 60,
    resizeMode: "contain",
  },
  card: {
    width: "100%",
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#414264", // darkGray
    marginBottom: 16,
    textAlign: "center",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  circularImage: {
    width: 280,
    height: 260,
    borderRadius: 90, // make image circular
    resizeMode: "contain",
  },
  subtitle: {
    textAlign: "center",
    color: "#414264", // darkGray
    marginBottom: 16,
  },
  textInput: {
    width: "100%",
    padding: 16,
    borderColor: "#CACACA",
    backgroundColor: "#F9FAFB",

    borderRadius: 8,
    color: "#374151", // darkGray
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center", // Center the button inside the container
  },
  defaultButtonStyle: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0f766e", // primaryDark color
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "auto", // Ensure button doesn't stretch to full width
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
