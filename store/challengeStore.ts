import { typeChallengeData } from "@/types";
import { create } from "zustand";


interface ChallengeState {
  challenges: typeChallengeData[];
  setChallenges: (challenges: typeChallengeData[]) => void;
  
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  challenges: [],
  setChallenges: (challenges) => set({ challenges }),
}));
