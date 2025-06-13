import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";
import {storeToken} from "../storage/asyncStorage";

const AuthAPI = {
  // Login Method
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/user/token/", {
        email,
        password,
      });

      if (response?.data?.token) {
        storeToken(response?.data?.token);
        AsyncStorage.setItem("AUTH_TOKEN", response?.data?.token);
      } else {
        console.log("token not set");
      }
      return response.data;
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Logout Method
  logout: async () => {
  try {
    await AsyncStorage.removeItem("AUTH_TOKEN"); 
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
}

};

export default AuthAPI;
