import type { JsonProof, PublicKey } from "o1js";
import { create } from "zustand";
import { type initializationProgress } from "./types";

export interface LibStateVars {
  proof?: JsonProof;
  isInitialized: boolean;
  initializationProgress: initializationProgress;
  isProving: boolean;
  proofFailed: boolean;
  queuedAssertions: string[];
  hasWallet: boolean;
  userPublicKey?: PublicKey;
  accountExists: boolean;
}

export interface LibStateActions {
  initLibStore: (
    proof: JsonProof,
    userPublicKey: PublicKey,
    accountExists: boolean,
  ) => void;
  setProof: (proof: JsonProof) => void;
  setInitializationProgress: (status: initializationProgress) => void;
  setHasWallet: (hasWallet: boolean) => void;
  setIsProving: (isProving: boolean) => void;
  setQueuedAssertions: (assertions: string[]) => void;
  setProofFailed: (proofFailed: boolean) => void;
  resetQueue: () => void;
}

export type LibState = LibStateVars & LibStateActions;

export const useLibStore = create<LibState>((set) => ({
  isInitialized: false,
  isProving: false,
  initializationProgress: "initializing",
  queuedAssertions: [],
  hasBeenReset: false,
  proofFailed: false,
  hasWallet: true,
  accountExists: false,

  initLibStore: (proof, userPublicKey, accountExists) =>
    set({ proof, userPublicKey, accountExists, isInitialized: true }),
  setHasWallet: (hasWallet) => set({ hasWallet }),
  setProof: (proof) => set({ proof }),
  setInitializationProgress: (initializationProgress) =>
    set({ initializationProgress }),
  setIsProving: (isProving) => set({ isProving }),
  setQueuedAssertions: (queuedAssertions) => set({ queuedAssertions }),
  setProofFailed: (proofFailed) => set({ proofFailed }),
  resetQueue: () => set({ queuedAssertions: [] }),
}));
