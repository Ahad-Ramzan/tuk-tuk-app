import AsyncStorage from "@react-native-async-storage/async-storage";
import { isConnected } from "./Netinfo";

export const syncOfflineSubmissions = async () => {
  try {
    const net = await isConnected();
    console.log(net, "net syncoffline page");
    if (!net) return;

    const token = await AsyncStorage.getItem("AUTH_TOKEN");
    if (!token) return;

    const rawQueue = await AsyncStorage.getItem("offline_submissions1");
    // await AsyncStorage.removeItem("offline_submissions");
    const offlineQueue = rawQueue ? JSON.parse(rawQueue) : {};

    const updatedQueue = { ...offlineQueue };

    for (const [id, item] of Object.entries(offlineQueue)) {
      try {
        const formData = new FormData();
        formData.append("activity", item.activity);
        formData.append("latitude", item.latitude);
        formData.append("longitude", item.longitude);
        formData.append("file", {
          uri: item.fileUri,
          name: item.fileName,
          type: `image/${item.fileType}`,
        });

        if (item.driver_score !== null) {
          formData.append("driver_score", item.driver_score);
        }

        const response = await fetch(
          "https://backend.ecity.estelatechnologies.com/api/ecity/Activity/submissions/",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
              Authorization: `token ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          delete updatedQueue[id];
          console.log(`✅ Synced activity [${id}]`);
        } else {
          console.log(`❌ Server error syncing activity [${id}]`);
        }
      } catch (error) {
        console.log(`⚠️ Retry failed for activity [${id}]:`, error.message);
      }
    }

    await AsyncStorage.setItem(
      "offline_submissions1",
      JSON.stringify(updatedQueue)
    );
  } catch (error) {
    console.error("Failed to sync offline submissions:", error.message);
  }
};
