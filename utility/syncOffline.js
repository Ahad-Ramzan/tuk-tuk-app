import AsyncStorage from "@react-native-async-storage/async-storage";
import { isConnected } from "./Netinfo";

export const syncOfflineSubmissions = async () => {
  try {
    const net = await isConnected();
    if (!net) return;

    const token = await AsyncStorage.getItem("AUTH_TOKEN");
    if (!token) return;

    const rawQueue = await AsyncStorage.getItem("offline_submissions1");
    const offlineQueue = rawQueue ? JSON.parse(rawQueue) : {};
    const updatedQueue = { ...offlineQueue };

    for (const [id, item] of Object.entries(offlineQueue)) {
      try {
        let response;

        if (item.fileUri && item.fileName && item.fileType) {
          const isVideo = item.fileType === "mp4" || item.fileType === "mov" || item.fileType === "avi";
          const isSvg = item.fileType === "svg";

          const formData = new FormData();
          formData.append("activity", item.activity);
          formData.append("latitude", item.latitude);
          formData.append("longitude", item.longitude);
          formData.append("file", {
            uri: item.fileUri,
            name: item.fileName,
            type: isSvg ? "image/svg+xml" : `${isVideo ? "video" : "image"}/${item.fileType}`,
          });

          if (item.driver_score !== null) {
            formData.append("driver_score", item.driver_score);
          }

          response = await fetch(
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
        } else {
          response = await fetch(
            "https://backend.ecity.estelatechnologies.com/api/ecity/Activity/submissions/",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `token ${token}`,
              },
              body: JSON.stringify(item),
            }
          );
        }

        if (response.ok) {
          delete updatedQueue[id];
        }
      } catch {}
    }

    await AsyncStorage.setItem(
      "offline_submissions1",
      JSON.stringify(updatedQueue)
    );
  } catch {}
};
