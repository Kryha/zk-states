import type { JsonProof } from "snarkyjs";
import { create } from "zustand";

export interface LibStateVars {
  proof?: JsonProof;
  isInitialized: boolean;
  isProving: boolean;
  actionsToProve: number;
}

export interface LibStateActions {
  setProof: (proof: JsonProof) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsProving: (isProving: boolean) => void;
  setActionsToProve: (actionsToProve: number) => void;
  rollback: (oldState: LibStateVars) => void;
}

export type LibState = LibStateVars & LibStateActions;

export const useLibStore = create<LibState>((set) => ({
  isInitialized: false,
  isProving: false,
  actionsToProve: 0,

  setProof: (proof) => set({ proof }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsProving: (isProving) => set({ isProving }),
  setActionsToProve: (actionsToProve) => set({ actionsToProve }),
  rollback: (oldState) => set({ ...oldState }),
}));
