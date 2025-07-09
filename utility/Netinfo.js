import NetInfo from "@react-native-community/netinfo";

// More reliable connectivity check
export const isConnected = async () => {
  const state = await NetInfo.fetch();

  // If state.isInternetReachable is null (unknown), or true but still unreachable
  if (state.isConnected && state.isInternetReachable !== false) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  return false;
};
