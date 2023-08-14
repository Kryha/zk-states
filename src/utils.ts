import {
  type JsonProof,
  MerkleWitness,
  type Proof,
  type ZkappPublicInput,
} from "snarkyjs";

export const INITIAL_STATE = "{}";
export const MERKLE_TREE_HEIGHT = 20;

export class MerkleWitness20 extends MerkleWitness(MERKLE_TREE_HEIGHT) {}

export const wait = (ms = 2000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const proofsToJSON = (
  proofs: (Proof<ZkappPublicInput, undefined> | undefined)[],
): JsonProof[] => {
  return proofs.filter((p) => !!p).map((p) => p?.toJSON()) as JsonProof[];
};
