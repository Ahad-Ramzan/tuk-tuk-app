import { typeActivity, typeChallengeData } from "@/types";
import { create } from "zustand";

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
  completedTaskIds: number;
  setCompletedTaskIds: () => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  challenges: [],
  setChallenges: (challenges) => set({ challenges }),
  activeChallenge: null,
  setActiveChallenge: (challenge) => set({ activeChallenge: challenge }),
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
      completedTaskIds: 0
    }),

  points: 0,
  setPoints: (newScore) => set({ points: newScore }),

   completedTaskIds: 0, // just a counter
  setCompletedTaskIds: () =>
    set((state) => ({
      completedTaskIds: state.completedTaskIds + 1,
    })),
   

    
}));
