import type { JsonProof, PublicKey } from "snarkyjs";
import { create } from "zustand";

export interface LibStateVars {
  proof?: JsonProof;
  isInitialized: boolean;
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
  queuedAssertions: [],
  hasBeenReset: false,
  proofFailed: false,
  hasWallet: true,
  accountExists: false,

  initLibStore: (proof, userPublicKey, accountExists) =>
    set({ proof, userPublicKey, accountExists, isInitialized: true }),
  setHasWallet: (hasWallet) => set({ hasWallet }),
  setProof: (proof) => set({ proof }),
  setIsProving: (isProving) => set({ isProving }),
  setQueuedAssertions: (queuedAssertions) => set({ queuedAssertions }),
  setProofFailed: (proofFailed) => set({ proofFailed }),
  resetQueue: () => set({ queuedAssertions: [] }),
}));
