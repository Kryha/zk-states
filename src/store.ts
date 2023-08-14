import type { JsonProof } from "snarkyjs";
import { create } from "zustand";

export interface ContractState {
  proof?: JsonProof;
  isInitialized: boolean;

  setProof: (proof: JsonProof) => void;
  setIsInitialized: (isInitialized: boolean) => void;
}

export const useContractStore = create<ContractState>((set) => ({
  isInitialized: false,

  setProof: (proof) => set({ proof }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
}));
