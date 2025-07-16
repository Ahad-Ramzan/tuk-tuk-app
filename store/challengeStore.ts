import { typeActivity, typeChallengeData } from "@/types";
import { create } from "zustand";

// Add convertToSeconds utility
function convertToSeconds(timeString?: string) {
  if (!timeString) return 0;
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

interface ChallengeState {
  challenges: typeChallengeData[];
  setChallenges: (challenges: typeChallengeData[]) => void;
  activeChallenge: typeChallengeData | null;
  setActiveChallenge: (challenge: typeChallengeData | null) => void;
  activeTask: typeActivity[] | null;
  setActiveTask: (task: typeActivity[] | null) => void;
  // Points tracking
  currentActivityPoints: number;
  grandTotalPoints: number;
  addPagePoints: (points: number) => void;
  completeActivity: () => void;
  resetAllPoints: () => void;

  points: number;
  setPoints: (newScore: number) => void;
  completedTaskIds: number[];
  completedTask: (id: number) => void;
  selectedTask: number | null;
  setSelectedTask: (id: number | null) => void;
  resetCompletedTaskIds: () => void;

  ThemedLogo: string | null;
  ThemedColor: string | null;
  setBrandDetails: (image: string, color: string) => void;
  disabled: boolean;
  setDisabled: (status: boolean) => void;
  timerEndTimestamp: number | null;
  setTimerEndTimestamp: (timestamp: number | null) => void;
  resetTimerEndTimestamp: () => void;
  getTimer: () => number;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  setChallenges: (challenges) => set({ challenges }),
  activeChallenge: null,
  setActiveChallenge: (challenge) => {
    set({ activeChallenge: challenge });
    // Reset timerEndTimestamp when a new challenge is started
    if (challenge) {
      const duration =
        convertToSeconds(challenge.time_limit || "00:00:00") * 1000;
      set({ timerEndTimestamp: Date.now() + duration });
    } else {
      set({ timerEndTimestamp: null });
    }
  },
  activeTask: null,
  setActiveTask: (task) => set({ activeTask: task }),
  // Points state
  currentActivityPoints: 0,
  grandTotalPoints: 0,

  addPagePoints: (points: number) =>
    set((state) => ({
      currentActivityPoints: state.currentActivityPoints + points,
    })),

  completeActivity: () =>
    set((state) => ({
      grandTotalPoints: state.grandTotalPoints + state.currentActivityPoints,
      currentActivityPoints: 0,
    })),

  resetAllPoints: () =>
    set({
      currentActivityPoints: 0,
      grandTotalPoints: 0,
      points: 0,
    }),

  points: 0,
  setPoints: (newScore) => set({ points: newScore }),

  selectedTask: null,
  setSelectedTask: (id) => set({ selectedTask: id }),
  completedTaskIds: [],
  completedTask: (id) =>
    set((state) => ({
      completedTaskIds: [...state.completedTaskIds, id],
    })),
  resetCompletedTaskIds: () => set(() => ({ completedTaskIds: [] })),

  ThemedLogo: null,
  ThemedColor: null,
  setBrandDetails: (image, color) =>
    set({ ThemedLogo: image, ThemedColor: color }),
  disabled: false,
  setDisabled: (status) => set({ disabled: status }),
  timerEndTimestamp: null,
  setTimerEndTimestamp: (timestamp) => set({ timerEndTimestamp: timestamp }),
  resetTimerEndTimestamp: () => set({ timerEndTimestamp: null }),
  getTimer: () => {
    const { timerEndTimestamp } = get();
    if (!timerEndTimestamp) return 0;
    const remaining = Math.floor((timerEndTimestamp - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  },
}));
