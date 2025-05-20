import "../ReactotronConfig";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthContext } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Pressable, Text, View } from "react-native";

export default function HomePage() {
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/onboarding"); // ✅ safe inside useEffect
    }
  }, [isAuthenticated]);

  // Optionally show a loading or empty screen while redirecting
  if (isAuthenticated) return null;

  return (
    <ProtectedRoute>
      <View>
        <Text>Welcome to the Home Page!</Text>
        <Pressable>
          <Text
            style={{
              color: "blue",
              textDecorationLine: "underline",
              marginTop: 20,
              fontSize: 20,
            }}
            onPress={() => {
              router.push("/onboarding");
            }}
          >
            Login
          </Text>
        </Pressable>
      </View>
    </ProtectedRoute>
  );
}
