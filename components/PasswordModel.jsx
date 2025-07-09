import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Vibration,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemedButton from "./ThemedButton";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Custom Keyboard Component
const CustomKeyboard = ({ onNumberPress, onBackspace, disabled }) => {
  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["", 0, "backspace"],
  ];

  const handlePress = (value) => {
    if (disabled) return;
    Vibration.vibrate(50);
    if (value === "backspace") {
      onBackspace();
    } else if (value !== "") {
      onNumberPress(value.toString());
    }
  };

  return (
    <View style={keyboardStyles.container}>
      {numbers.map((row, rowIndex) => (
        <View key={rowIndex} style={keyboardStyles.row}>
          {row.map((num, colIndex) => (
            <TouchableOpacity
              key={colIndex}
              style={[
                keyboardStyles.key,
                num === "" && keyboardStyles.emptyKey,
                disabled && keyboardStyles.disabledKey,
              ]}
              onPress={() => handlePress(num)}
              disabled={num === "" || disabled}
              activeOpacity={0.7}
            >
              {num === "backspace" ? (
                <Ionicons name="backspace-outline" size={24} color="#333" />
              ) : (
                <Text
                  style={[
                    keyboardStyles.keyText,
                    disabled && keyboardStyles.disabledKeyText,
                  ]}
                >
                  {num}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const PasswordModal = ({ visible, onClose, onSuccess }) => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (visible) {
      resetPin();
    }
  }, [visible]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      handleDimensionChange
    );
    return () => subscription?.remove();
  }, []);

  const handleDimensionChange = () => {
    // Handle any additional logic on dimension change if necessary
  };

  const resetPin = () => {
    setPin(["", "", "", ""]);
    setCurrentIndex(0);
    setShowError(false);
  };

  const handleNumberPress = (number) => {
    if (currentIndex < 4) {
      const newPin = [...pin];
      newPin[currentIndex] = number;
      setPin(newPin);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex === 4) {
        setTimeout(() => verifyPin(newPin), 300);
      }
    }
  };

  const handleBackspace = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const newPin = [...pin];
      newPin[newIndex] = "";
      setPin(newPin);
      setCurrentIndex(newIndex);
      setShowError(false);
    }
  };

  const verifyPin = async (enteredPin) => {
    setIsLoading(true);
    try {
      const storedPin = await AsyncStorage.getItem("USER_PIN");
      const enteredPinString = enteredPin.join("");
      if (storedPin === enteredPinString) {
        setShowError(false);
        setTimeout(() => {
          onSuccess();
          onClose();
          resetPin();
        }, 500);
      } else {
        setShowError(true);
        Vibration.vibrate([0, 100, 50, 100]);
        setTimeout(() => {
          resetPin();
        }, 1000);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to verify PIN. Please try again.");
      console.error("PIN verification error:", error);
      resetPin();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetPin();
    onClose();
  };

  const handleContinue = () => {
    if (pin.every((digit) => digit !== "")) {
      verifyPin(pin);
    } else {
      Alert.alert("Incomplete PIN", "Please enter all 4 digits.");
      Vibration.vibrate(200);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.title}>Enter your password</Text>
              <Text style={styles.subtitle}>To start the challenge</Text>

              

              <View style={styles.pinContainer}>
                {pin.map((digit, index) => (
                  <View
                    key={index}
                    style={[
                      styles.pinBox,
                      currentIndex === index && styles.activePinBox,
                      digit && styles.filledPinBox,
                      showError && styles.errorPinBox,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pinDot,
                        digit && styles.filledPinDot,
                        showError && styles.errorPinDot,
                      ]}
                    >
                      {digit ? "●" : ""}
                    </Text>
                  </View>
                ))}
              </View>

              {showError && (
                <Text style={styles.errorText}>
                  Incorrect PIN. Please try again.
                </Text>
              )}

              <CustomKeyboard
                onNumberPress={handleNumberPress}
                onBackspace={handleBackspace}
                disabled={isLoading}
              />

              <View style={styles.buttonContainer}>
                {/* <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      isLoading && styles.disabledButtonText,
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity> */}

                <ThemedButton
                  onPress={handleContinue}
                  title={isLoading ? "Verifying..." : "Continue"}
                  disabled={isLoading || pin.some((digit) => digit === "")}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    maxHeight: height * 0.75,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "70%",
    maxWidth: 250,
  },
  pinBox: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  activePinBox: {
    borderColor: "#3B82F6",
    backgroundColor: "#F0F9FF",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filledPinBox: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  errorPinBox: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  pinDot: {
    fontSize: 24,
    color: "transparent",
  },
  filledPinDot: {
    color: "#333",
  },
  errorPinDot: {
    color: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#999",
  },
});

const keyboardStyles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 300,
    maxHeight: 200,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  key: {
    width: 70,
    height: 60,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyKey: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledKey: {
    opacity: 0.5,
    backgroundColor: "#F1F3F4",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  disabledKeyText: {
    color: "#999",
  },
});

export default PasswordModal;
