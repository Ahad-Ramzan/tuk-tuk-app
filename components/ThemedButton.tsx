import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useChallengeStore } from "@/store/challengeStore";

type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  icon?: ReactNode;
};

const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  style,
  disabled,
  icon,
}) => {
  const { company } = useTheme();
const {ThemedColor} =useChallengeStore()
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: ThemedColor || company.theme.primaryDark },
        disabled && { backgroundColor: "#ccc" },
        style,
      ]}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {/* Icon + Text horizontally */}
      <Text style={styles.text}>
        {icon && <>{icon} </>}
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 999, // pill shape
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ThemedButton;
