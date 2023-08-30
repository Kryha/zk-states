import type { JsonProof } from "snarkyjs";
import { create } from "zustand";

export interface LibStateVars {
  proof?: JsonProof;
  isInitialized: boolean;
  isProving: boolean;
  queuedAssertions: string[];
}

export interface LibStateActions {
  setProof: (proof: JsonProof) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsProving: (isProving: boolean) => void;
  setQueuedAssertions: (assertions: string[]) => void;
  reset: () => void;
}

export type LibState = LibStateVars & LibStateActions;

export const useLibStore = create<LibState>((set) => ({
  isInitialized: false,
  isProving: false,
  queuedAssertions: [],

  setProof: (proof) => set({ proof }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsProving: (isProving) => set({ isProving }),
  setQueuedAssertions: (queuedAssertions) => set({ queuedAssertions }),
  reset: () => set({ queuedAssertions: [] }),
}));
