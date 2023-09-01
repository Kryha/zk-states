import type { JsonProof } from "snarkyjs";
import { create } from "zustand";

export interface LibStateVars {
  proof?: JsonProof;
  isInitialized: boolean;
  isProving: boolean;
  proofFailed: boolean;
  queuedAssertions: string[];
}

export interface LibStateActions {
  setProof: (proof: JsonProof) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsProving: (isProving: boolean) => void;
  setQueuedAssertions: (assertions: string[]) => void;
  setProofFailed: (proofFailed: boolean) => void;
  reset: () => void;
}

export type LibState = LibStateVars & LibStateActions;

export const useLibStore = create<LibState>((set) => ({
  isInitialized: false,
  isProving: false,
  queuedAssertions: [],
  hasBeenReset: false,
  proofFailed: false,

  setProof: (proof) => set({ proof }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsProving: (isProving) => set({ isProving }),
  setQueuedAssertions: (queuedAssertions) => set({ queuedAssertions }),
  setProofFailed: (proofFailed) => set({ proofFailed }),
  reset: () => set({ queuedAssertions: [] }),
}));
