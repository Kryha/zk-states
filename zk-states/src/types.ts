import type { JsonProof } from "o1js";
import type { AssertProgramProof, StatesVerifier } from "zk-states-contracts";
import { z } from "zod";

interface SignMessageArgs {
  message: string;
}

interface SignedData {
  publicKey: string;
  data: string;
  signature: {
    field: string;
    scalar: string;
  };
}

type SignFieldsArguments = {
  message: (string | number)[];
};

type SignedFieldsData = {
  data: (string | number)[];
  signature: string;
};

interface MinaWallet {
  requestAccounts: () => Promise<string[]>;
  sendTransaction: (options: {
    transaction: string;
    feePayer?: {
      fee?: number;
      memo?: string;
    };
  }) => Promise<{ hash: string }>;
  signMessage: (args: SignMessageArgs) => Promise<SignedData>;
  signFields: (args: SignFieldsArguments) => Promise<SignedFieldsData>;
}

declare global {
  interface Window {
    mina?: MinaWallet;
  }
}

// TODO: add devnet and mainnet
export const minaNetworkSchema = z.enum(["berkeley"]);
export type MinaNetwork = z.infer<typeof minaNetworkSchema>;

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
  prevProof: AssertProgramProof,
) => Promise<AssertProgramProof>;

export interface WorkerState {
  latestProof?: AssertProgramProof;
  isProving: boolean;
  statesVerifier?: StatesVerifier;
}

export const setMinaNetworkArgsSchema = z.object({
  networkName: minaNetworkSchema,
});
export type SetMinaNetworkArgs = z.infer<typeof setMinaNetworkArgsSchema>;

export const fetchAccountArgsSchema = z.object({ publicKey58: z.string() });
export type FetchAccountArgs = z.infer<typeof fetchAccountArgsSchema>;

export const initArgsSchema = z.object({
  appPublicKey58: z.string(),
});
export type InitArgs = z.infer<typeof initArgsSchema>;

export const assertionSchema = z.object({
  name: assertMethodSchema,
  args: z.array(z.string()),
});
export type Assertion = z.infer<typeof assertionSchema>;

export const queuedAssertionSchema = z.object({
  callId: z.string().uuid(),
  methods: z.array(assertionSchema),
});
export type QueuedAssertion = z.infer<typeof queuedAssertionSchema>;

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
export type InitializationProgress =
  | "pendingStart"
  | "compilingProgram"
  | "compilingContract"
  | "creatingInitialProof"
  | "done";

interface InititializationProgressUpdate {
  updateType: "initializationProgress";
  status: InitializationProgress;
}

export type UIUpdate =
  | LatestProofUpdate
  | UpdateQueueUpdate
  | IsProvingUpdate
  | ProofErrorUpdate
  | ProofSuccessUpdate;

interface WorkerErrorUpdate {
  updateType: "workerError";
}

export type WorkerStateUpdate =
  | WorkerErrorUpdate
  | InititializationProgressUpdate;

export interface TxRes {
  transaction: string;
  proof: JsonProof;
}
