import React, { useEffect, useState, useCallback, JSX } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useChallengeStore } from "@/store/challengeStore";
import { typeActivity } from "@/types";
import { router } from "expo-router";

// Fallback components
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading activity...</Text>
  </View>
);

const NoActivityFallback = ({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackTitle}>No Activity Available</Text>
    <Text style={styles.fallbackMessage}>
      We couldn&apos;t find any activities to display right now.
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Refresh</Text>
    </TouchableOpacity>
  </View>
);

const UnknownActivityFallback = ({
  activityType,
  onNext,
  onSkip,
}: {
  activityType: string;
  onNext: () => void;
  onSkip: () => void;
}) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackTitle}>Unsupported Activity</Text>
    <Text style={styles.fallbackMessage}>
      Activity type &quot;{activityType}&quot; is not supported.
    </Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipButtonText}>Skip Activity</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.retryButton} onPress={onNext}>
        <Text style={styles.retryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ImagePage() {
  const { activeTask } = useChallengeStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activityComponent, setActivityComponent] =
    useState<JSX.Element | null>(null);
  const [loading, setLoading] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const activity: typeActivity | undefined = activeTask?.[currentIndex];
  console.log("Current Activity:", activity);

  const handleNext = useCallback(() => {
    if (activeTask && currentIndex < activeTask.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.push("/feedback");
    }
  }, [activeTask, currentIndex]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleRetry = useCallback(() => {
    setComponentError(null);
    setRetryKey((prev) => prev + 1);
  }, []);

  // Load the correct activity component
  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      if (!activity) return;
      console.log("Loading activity component for:", activity.task_type);
      setLoading(true);
      setActivityComponent(null);
      setComponentError(null);

      try {
        let Component: React.ComponentType<any> | null = null;
        switch (activity.task_type) {
          case "photo":
            Component = (await import("@/app/activityphoto")).default;
            break;
          case "selection":
            Component = (await import("@/app/activityoptions")).default;
            break;
          case "video":
            Component = (await import("@/app/activityvideo")).default;
            break;
          case "text":
            Component = (await import("@/app/activitytext")).default;
            break;
          case "drawing":
            Component = (await import("@/app/activitydrawing")).default;
            break;
          case "activity":
            Component = (await import("@/app/activitycomplete")).default;
            break;
          default:
            Component = null;
        }

        if (isMounted) {
          if (Component) {
            setActivityComponent(

              <Component activity={activity} onNext={handleNext} />
            );
          } else {
            setActivityComponent(
              <UnknownActivityFallback
                activityType={activity.task_type}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            );
          }
        }
      } catch (error) {
        console.error("Error loading activity component:", error);
        if (isMounted) {
          setComponentError("Failed to load activity component.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadComponent();
    return () => {
      isMounted = false;
    };
  }, [activity, handleNext, handleSkip, retryKey]);

  if (componentError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Component Error</Text>
        <Text style={styles.errorMessage}>{componentError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!activeTask || activeTask.length === 0) {
    return <NoActivityFallback onRetry={handleRetry} />;
  }

  if (!activity) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Activity Not Found</Text>
        <Text style={styles.fallbackMessage}>Unable to load activity.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} key={retryKey}>
      {loading || !activityComponent ? <LoadingFallback /> : activityComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 12,
    textAlign: "center",
  },
  fallbackMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  skipButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  skipButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
