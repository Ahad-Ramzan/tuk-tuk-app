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

import { router } from "expo-router";

export default function ImagePage() {
  const { activeTask } = useChallengeStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activity: typeActivity | undefined = activeTask?.[currentIndex];

  const handleNext = () => {
    if (activeTask && currentIndex < activeTask.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (activeTask) {
      router.push("/feedback");
    }
  };

  const renderActivityComponent = (
    activity: typeActivity,
    onNext: () => void,
    isLast: boolean
  ) => {
    const props = {
      activity,
      onNext,
      buttonLabel: isLast ? "Finish" : "Next Activity",
    };

    switch (activity.task_type) {
      case "photo":
        return <PhotoPage {...props} />;
      case "selection":
        return <ActivityOptions {...props} />;
      case "video":
        return <VideoPage {...props} />;
      case "text":
        return <TextQuiz {...props} />;
      case "drawing":
        return <DrawingPage {...props} />;
      case "activity":
        return <ActivityPage {...props} />;
      default:
        return (
          <View style={{flex : 1, padding: 20, alignItems: "center", justifyContent: "center" }}>
            <Text>Unknown activity type: {activity.task_type}</Text>
          </View>
        );
    }
  };

  if (!activeTask || activeTask.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No activities available.</Text>
      </View>
    );
  }

  const isLast = currentIndex === activeTask.length - 1;

  return (
    <View style={{ flex: 1 }}>
      {activity ? (
        renderActivityComponent(activity, handleNext, isLast)
      ) : (
        <View style={{ padding: 20 }}>
          <Text>No activity found.</Text>
        </View>
      )}
    </View>
  );
}
