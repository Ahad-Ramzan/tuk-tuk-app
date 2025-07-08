import AsyncStorage from "@react-native-async-storage/async-storage";


const STORAGE_KEYS = {
  USER_TOKEN: "user_token",
  USER_INFO: "user_info",
};

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};


export const getStoredToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);

    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};


export const getUserInfo = async () => {
  try {
    const userInfoString = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfoString ? JSON.parse(userInfoString) : null;
  } catch (error) {
    console.error("Error retrieving user info:", error);
    return null;
  }
};


export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TOKEN,
     
    ]);
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
};
