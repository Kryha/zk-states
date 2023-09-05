import type { JsonProof, Proof } from "snarkyjs";
import { z } from "zod";
import { type StatesVerifier } from "./contract";

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

export interface TxRes {
  transaction: string;
}
