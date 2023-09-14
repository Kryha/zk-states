import type { JsonProof, fetchAccount } from "o1js";
import { v4 as uuid } from "uuid";
import type {
  Assertion,
  FetchAccountArgs,
  InitArgs,
  QueuedAssertion,
  SetMinaNetworkArgs,
  TxRes,
  UIUpdate,
  WorkerStateUpdate,
} from "./types";
import { logger } from "./utils";
import {
  type WorkerFunctions,
  type ZkappWorkerReponse,
  type ZkappWorkerRequest,
} from "./zkAppWorker";

type UIUpdateFunction = (updatePayload: UIUpdate) => void;

const stringifyUpdateQueue = (assertions: QueuedAssertion[]) => {
  const res = assertions.flatMap((call) =>
    call.methods.flatMap((assertion) => assertion.name),
  );
  return res;
};

export class ZkAppWorkerClient {
  private worker: Worker;

  private promises: {
    [id: number]: {
      resolve: (res: unknown) => void;
      reject: (err: unknown) => void;
    };
  };

  private nextId: number;

  // Key is an uuid that is generated whenever an action gets triggered
  // value is the state when that action got triggered
  // when proof succeeds, delete the value of the corresponding key
  // if proof fails, set the current state to the value present at that key
  private stateHistory: Record<string, unknown>;
  private latestAssertions: Assertion[];

  private updateQueue: QueuedAssertion[];
  private isProving = false;
  private latestProof?: JsonProof;

  private updateUI?: UIUpdateFunction;

  constructor(worker: Worker) {
    this.worker = worker;
    this.promises = {};
    this.nextId = 0;
    this.stateHistory = {};
    this.latestAssertions = [];
    this.updateQueue = [];

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };

    setInterval(async () => {
      if (
        this.isProving ||
        !this.latestProof ||
        !this.updateQueue.length ||
        !this.updateUI
      ) {
        return;
      }

      const nextAssertion = this.updateQueue.at(0);
      if (!nextAssertion) return;
      const { callId, methods } = nextAssertion;

      this.isProving = true;
      this.updateUI({ updateType: "isProving", data: this.isProving });

      let localProof = this.latestProof;
      let hasSucceeded = true;

      for (const method of methods) {
        if (hasSucceeded) {
          try {
            const res = (await this.call("proveAssertion", method)) as
              | JsonProof
              | undefined;

            if (!res) throw new Error("proof generation failed");

            localProof = res;

            this.updateUI({
              updateType: "latestProof",
              data: localProof,
            });
          } catch (error) {
            logger.error("Update queue error:", error);

            hasSucceeded = false;
            this.updateQueue = [];

            this.updateUI({ updateType: "proofError", callId });
            this.updateUI({
              updateType: "latestProof",
              data: this.latestProof,
            });
          }
        }
      }

      if (hasSucceeded) {
        this.updateQueue.shift();
        this.latestProof = localProof;

        this.updateUI({
          updateType: "proofSuccess",
          callId,
        });
        this.updateUI({
          updateType: "updateQueue",
          data: stringifyUpdateQueue(this.updateQueue),
        });
      }

      this.isProving = false;
      this.updateUI({
        updateType: "isProving",
        data: this.isProving,
      });
    }, 3000);
  }

  private call(fn: WorkerFunctions, args: unknown) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkappWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };

      this.worker.postMessage(message);

      this.nextId++;
    });
  }

  async setMinaNetwork(args: SetMinaNetworkArgs) {
    await this.call("setMinaNetwork", args);
  }

  async fetchAccount(args: FetchAccountArgs) {
    const res = await this.call("fetchAccount", args);
    return res as ReturnType<typeof fetchAccount>;
  }

  async init(
    args: InitArgs,
    onWorkerStateUpdate: (workerRes: WorkerStateUpdate) => void,
    updateUI: UIUpdateFunction,
  ) {
    this.worker.onmessage = (
      event: MessageEvent<ZkappWorkerReponse | WorkerStateUpdate>,
    ) => {
      if ("updateType" in event.data) {
        onWorkerStateUpdate(event.data);
      } else {
        this.promises[event.data.id].resolve(event.data.data);
        delete this.promises[event.data.id];
      }
    };

    this.updateUI = updateUI;

    const result = (await this.call("init", args)) as JsonProof;
    this.latestProof = result;

    return result;
  }

  async verify() {
    if (this.updateQueue.length !== 0) {
      throw new Error("Update queue must be empty");
    }

    const result = (await this.call("verify", {})) as TxRes;
    this.latestProof = result.proof;

    return result;
  }

  proveAction<T extends object>(oldState: T) {
    if (!this.updateUI) throw new Error("Update UI callback not defined");
    if (!this.latestAssertions.length) return;

    const callId = uuid();
    const args: QueuedAssertion = { callId, methods: this.latestAssertions };

    this.stateHistory[callId] = oldState;
    this.updateQueue.push(args);
    this.latestAssertions = [];

    this.updateUI({
      updateType: "updateQueue",
      data: stringifyUpdateQueue(this.updateQueue),
    });
  }

  queueAssertions(assertions: Assertion[]) {
    this.latestAssertions.push(...assertions);
  }

  clearAssertions() {
    this.latestAssertions = [];
  }

  getState(callId: string) {
    return this.stateHistory[callId];
  }

  deleteState(callId: string) {
    delete this.stateHistory[callId];
  }

  clearHistory() {
    this.stateHistory = {};
    this.latestAssertions = [];
  }
}

export const createZKAppWorkerClient = (worker: Worker) =>
  new ZkAppWorkerClient(worker);
