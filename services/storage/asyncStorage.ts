import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage Keys
const STORAGE_KEYS = {
  USER_TOKEN: "user_token",
  USER_INFO: "user_info",
};

// Store Token
export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

// Get Stored Token
export const getStoredToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    console.log(token, "getStoredToken");
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};
//
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("user_token");
    console.log("Retrieved token:", token);
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};
// Store User Info
export const storeUserInfo = async (userInfo) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_INFO,
      JSON.stringify(userInfo)
    );
  } catch (error) {
    console.error("Error storing user info:", error);
  }
};

// Get User Info
export const getUserInfo = async () => {
  try {
    const userInfoString = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfoString ? JSON.parse(userInfoString) : null;
  } catch (error) {
    console.error("Error retrieving user info:", error);
    return null;
  }
};

// Clear All Storage
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TOKEN,
      STORAGE_KEYS.USER_INFO,
    ]);
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
};
