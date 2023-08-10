import type { Field, JsonProof, MerkleTree, Proof } from "snarkyjs";
import { z } from "zod";

export type TransitionFunction = (
  prevProof: Proof<Field, void>,
) => Promise<Proof<Field, void>>;

export interface WorkerState {
  tree: MerkleTree;
  transitionIndex: bigint;
  latestProof?: Proof<Field, void>;
  updateQueue: TransitionFunction[];
  executingUpdate: boolean;
}

export const transitionStateArgsSchema = z.object({
  newState: z.string(),
});
export type TransitionStateArgs = z.infer<typeof transitionStateArgsSchema>;

export interface TransitionRes {
  proof: JsonProof;
}
