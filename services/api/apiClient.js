import axios from "axios";
import { getStoredToken, clearStorage } from "../storage/asyncStorage";

// Create Axios instance
const createApiClient = (baseURL) => {
  const apiClient = axios.create({
    baseURL,
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
        const token = await getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
export default createApiClient("https://backend.ecity.estelatechnologies.com/api");
