import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearStorage,
  storeToken,
  storeUserInfo,
} from "../storage/asyncStorage";
import apiClient from "./apiClient";

const AuthAPI = {
  // Login Method
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/user/token/", {
        email,
        password,
      });

      console.log("response -------> ", response);
      // Store token and user info
      if (response?.data?.token) {
        let tokk = AsyncStorage.setItem("AUTH_TOKEN", response?.data?.token);
      } else {
        console.log("token not set");
      }
      // await storeUserInfo(response?.data.user || );
      return response.data;
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Register Method
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);

      // Store token and user info after successful registration
      await storeToken(response.data.token);
      await storeUserInfo(response.data.user);

      return response.data;
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Logout Method
  logout: async () => {
    try {
      // Optional: Call logout endpoint if required by backend
      await apiClient.post("/auth/logout");

      // Clear local storage
      await clearStorage();

      return true;
    } catch (error) {
      console.error("Logout Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default AuthAPI;
