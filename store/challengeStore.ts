import { typeActivity, typeChallengeData, typeTask } from "@/types";
import { create } from "zustand";


interface ChallengeState {
  challenges: typeChallengeData[];
  setChallenges: (challenges: typeChallengeData[]) => void;
  activeChallenge: typeChallengeData | null;
  setActiveChallenge: (challenge: typeChallengeData | null) => void;
  activeTask: typeActivity[] | null;
  setActiveTask: (task: typeActivity[] | null) => void;
  
}

export const useChallengeStore = create<ChallengeState>((set) => ({

  challenges: [],
  setChallenges: (challenges) => set({ challenges }),
  activeChallenge: null,
  setActiveChallenge: (challenge) => set({ activeChallenge: challenge }),
  activeTask: null,
  setActiveTask: (task) => set({ activeTask: task  }),
}));
