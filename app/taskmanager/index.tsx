import { useChallengeStore } from "@/store/challengeStore";
import { typeActivity } from "@/types";
import React, { useState } from "react";
import { Text, View } from "react-native";

// Activity Pages
import ActivityPage from "@/app/activitycomplete";
import DrawingPage from "@/app/activitydrawing";
import ActivityOptions from "@/app/activityoptions";
import PhotoPage from "@/app/activityphoto";
import TextQuiz from "@/app/activitytext";
import VideoPage from "@/app/activityvideo";
import ThemedButton from "@/components/ThemedButton";
import { router } from "expo-router";

export default function ImagePage() {
  const { activeTask } = useChallengeStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activity: typeActivity | undefined = activeTask?.[currentIndex];

  const renderActivityComponent = (activity: typeActivity) => {
    switch (activity.task_type) {
      case "photo":
        return <PhotoPage activity={activity} />;
      case "selection":
        return <ActivityOptions activity={activity} />;
      case "video":
        return <VideoPage activity={activity} />;
      case "text":
        return <TextQuiz activity={activity} />;
      case "drawing":
        return <DrawingPage activity={activity} />;
      case "activity":
        return <ActivityPage activity={activity} />;
      default:
        return (
          <View style={{ padding: 20 }}>
            <Text>Unknown activity type: {activity.task_type}</Text>
          </View>
        );
    }
  };

  const handleNext = () => {
    if (activeTask && currentIndex < activeTask.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (activeTask) {
      router.push("/mapprogress");
    }
  };

  if (!activeTask || activeTask.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No activities available.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {activity ? (
        renderActivityComponent(activity)
      ) : (
        <View style={{ padding: 20 }}>
          <Text>No activity found.</Text>
        </View>
      )}
      <View
        style={{ position: "absolute", bottom: 20, right: 20, zIndex: 100 }}
      >
        <ThemedButton
          title={
            currentIndex < activeTask.length - 1 ? "Next Activity" : "Finish"
          }
          onPress={handleNext}
        />
      </View>
    </View>
  );
}
