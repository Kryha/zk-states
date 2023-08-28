import type { JsonProof } from "snarkyjs";
import { create } from "zustand";

export interface ContractState {
  proof?: JsonProof;
  isInitialized: boolean;
  isProving: boolean;
  proofsLeft: number;

  setProof: (proof: JsonProof) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsProving: (isProving: boolean) => void;
  setProofsLeft: (proofsLeft: number) => void;
}

export const useContractStore = create<ContractState>((set) => ({
  isInitialized: false,
  isProving: false,
  proofsLeft: 0,

  setProof: (proof) => set({ proof }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsProving: (isProving) => set({ isProving }),
  setProofsLeft: (proofsLeft) => set({ proofsLeft }),
}));
