import axios from "axios";
import { clearStorage, getStoredToken } from "../storage/asyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const BASEURL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://backend.ecity.estelatechnologies.com/api";
// Create Axios instance
const createApiClient = () => {
  const apiClient = axios.create({
    baseURL: BASEURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request Interceptor
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        // Retrieve and add token to headers
        const token = await AsyncStorage.getItem("AUTH_TOKEN");
        console.log("token gya AJAX ly k", token);
        if (token) {
          config.headers.Authorization = `token ${token}`;
        }
        return config;
      } catch (error) {
        console.error("Request Interceptor Error:", error);
        return config;
      }
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Handle specific error scenarios
      if (error.response) {
        switch (error.response.status) {
          case 401: // Unauthorized
            // Token might be expired, clear storage and redirect to login
            await clearStorage();
            // Optionally trigger navigation to login screen
            break;
          case 403: // Forbidden
            console.error("Access Forbidden");
            break;
          case 404: // Not Found
            console.error("Resource Not Found");
            break;
          case 500: // Server Error
            console.error("Internal Server Error");
            break;
        }
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

// Export configured API client
const apiClient = createApiClient();
export default apiClient;
