import type { JsonProof, Proof } from "snarkyjs";
import { z } from "zod";

export type AssertProof = Proof<void, void>;

export const assertMethodSchema = z.enum([
  "fieldEquals",
  "fieldNotEquals",
  "fieldGreaterThan",
  "fieldGreaterThanOrEqual",
  "fieldLessThan",
  "fieldLessThanOrEqual",
]);
export type AssertMethod = z.infer<typeof assertMethodSchema>;

export type TransitionFunction = (
  prevProof: AssertProof,
) => Promise<AssertProof>;

export interface WorkerState {
  latestProof?: AssertProof;
  updateQueue: TransitionFunction[];
  isProving: boolean;
}

export const callAssertionArgsSchema = z.object({
  methodName: assertMethodSchema,
  methodArgs: z.array(z.string()),
});
export type CallAssertionArgs = z.infer<typeof callAssertionArgsSchema>;

export interface TransitionRes {
  proof: JsonProof;
}
