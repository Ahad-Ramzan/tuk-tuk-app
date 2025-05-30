import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import ThemedButton from "@/components/ThemedButton";

const screenWidth = Dimensions.get("window").width;

const options = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
];
export default function ImagePage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { company } = useTheme(); 

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("@/assets/images/bgonboarding.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Logo */}
      <Image
        source={company.fulllogo}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.heading}>Answer the question</Text>

        <Image
          source={require("@/assets/images/placeholder.png")}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <OptionCard
              key={index}
              text={option}
              selected={selectedOption === index}
              onPress={() => setSelectedOption(index)}
            />
          ))}
        </View>

        <ThemedButton
          title={submitted ? "Assign Score" : "Submit"}
          onPress={() =>
            submitted ? console.log("Assign Score") : setSubmitted(true)
          }
        />
      </View>

    </View>
  );
}

type OptionCardProps = {
  text: string;
  selected: boolean;
  onPress: () => void;
};

function OptionCard({ text, selected, onPress }: OptionCardProps) {
  const { company } = useTheme();
  return (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <View style={styles.optionInner}>
        <Ionicons
          name={
            selected ? "radio-button-on-outline" : "radio-button-off-outline"
          }
          size={20}
          color={selected ? company.theme.primaryDark : company.theme.primary} // Use company primary for selected option
          style={{ marginRight: 8 }}
        />
        <Text style={styles.optionText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF0F3", // lightGray
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
    zIndex: 1,
  },
  content: {
    width: "90%",
    padding: 16,
    alignItems: "center",
    zIndex: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#414264", // darkGray
    marginBottom: 16,
    textAlign: "center",
  },
  illustration: {
    width: 680,
    height: 360,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#414264",
    marginBottom: 16,
  },
  optionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between", // Even spacing between 3 cards
    marginBottom: 16,
  },

  optionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "32%", // roughly 3 cards with spacing (100% - 2 * gap)
  },

  optionInner: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  optionText: {
    color: "#414264", // gray-700
    flexShrink: 1,
    fontSize: 18,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
