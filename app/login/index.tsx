import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useRef, useState } from "react";
// Adjust the import path as necessary
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AuthContext } from "@/context/AuthContext";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { isAuthenticated } = useContext(AuthContext);
  if (isAuthenticated) {
    router.push("/onboarding");
  }

  const [email, setEmail] = useState("");
  //   const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState(["", "", "", ""]);
  const inputRefs = useRef<TextInput[]>([]);
  // const navigation = useNavigation();

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newPass = [...password];
      newPass[index] = value;
      setPassword(newPass);
      if (value && index < password.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (e.nativeEvent.key === "Backspace" && !password[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const pin = password.join("") || null;
    // console.log(email, password.join(""));
    if (!email && !pin) return;

    try {
      await login(email, pin);

      router.push("/onboarding");
    } catch (error) {
      console.error("Login failed:", error);
    }
    // router.push("/onboarding");
  };

  useAuth();
  return (
    <LinearGradient
      colors={["#DBEAFE", "#ffffff", "#DBEAFE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <Image
          source={require("@/assets/icons/Vector.png")} // Update the path accordingly
          style={styles.logo}
        />

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="name@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
          <View style={styles.passwordRow}>
            {password.map((num, i) => (
              <TextInput
                key={i}
                ref={(el) => (inputRefs.current[i] = el!)}
                value={num}
                maxLength={1}
                keyboardType="number-pad"
                onChangeText={(text) => handleChange(i, text)}
                onKeyPress={(e) => handleKeyDown(i, e)}
                style={styles.pinInput}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  pinInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
  },
  button: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 28,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
