import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { clearStorage } from "../storage/asyncStorage";
export const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const createApiClient = () => {
  const apiClient = axios.create({
    baseURL: BASEURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem("AUTH_TOKEN");

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

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            await clearStorage();

            break;
          case 403:
            console.error("Access Forbidden");
            break;
          case 404:
            console.error("Resource Not Found");
            break;
          case 500:
            console.error("Internal Server Error");
            break;
        }
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

const apiClient = createApiClient();
export default apiClient;
