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

export interface QueuedAssertion {
  callId: string;
  proveFunctions: {
    name: AssertMethod;
    method: TransitionFunction;
  }[];
}

export interface WorkerState {
  latestProof?: AssertProof;
  updateQueue: QueuedAssertion[];
  isProving: boolean;
}

export const assertMethodsPayloadSchema = z.array(
  z.object({ name: assertMethodSchema, args: z.array(z.string()) }),
);
export type AssertMethodsPayload = z.infer<typeof assertMethodsPayloadSchema>;

export const callAssertionArgsSchema = z.object({
  callId: z.string().uuid(),
  methods: assertMethodsPayloadSchema,
});
export type CallAssertionArgs = z.infer<typeof callAssertionArgsSchema>;

export interface TransitionRes {
  proof: JsonProof;
}

interface LatestProofUpdate {
  updateType: "latestProof";
  data: JsonProof;
}

interface UpdateQueueUpdate {
  updateType: "updateQueue";
  data: string[];
}

interface IsProvingUpdate {
  updateType: "isProving";
  data: boolean;
}

interface ProofErrorUpdate {
  updateType: "proofError";
  callId: string;
}

interface ProofSuccessUpdate {
  updateType: "proofSuccess";
  callId: string;
}

export type WorkerStateUpdate =
  | LatestProofUpdate
  | UpdateQueueUpdate
  | IsProvingUpdate
  | ProofErrorUpdate
  | ProofSuccessUpdate;
