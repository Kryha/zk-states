import type { fetchAccount } from "o1js";
import { v4 as uuid } from "uuid";
import type {
  AssertMethodsPayload,
  CallAssertionArgs,
  FetchAccountArgs,
  InitArgs,
  SetMinaNetworkArgs,
  TransitionRes,
  TxRes,
  WorkerStateUpdate,
} from "./types";
import {
  type WorkerFunctions,
  type ZkappWorkerReponse,
  type ZkappWorkerRequest,
} from "./zkAppWorker";

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
  private latestAssertions: AssertMethodsPayload;

  constructor(worker: Worker) {
    this.worker = worker;
    this.promises = {};
    this.nextId = 0;
    this.stateHistory = {};
    this.latestAssertions = [];

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
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
    onWorkerStateUpdate?: (workerRes: WorkerStateUpdate) => void,
  ) {
    this.worker.onmessage = (
      event: MessageEvent<ZkappWorkerReponse | WorkerStateUpdate>,
    ) => {
      if ("updateType" in event.data) {
        onWorkerStateUpdate && onWorkerStateUpdate(event.data);
      } else {
        this.promises[event.data.id].resolve(event.data.data);
        delete this.promises[event.data.id];
      }
    };

    const result = (await this.call("init", args)) as TransitionRes;
    return result;
  }

  async verify() {
    const result = (await this.call("verify", {})) as TxRes;
    return result;
  }

  callAssertions<T extends object>(oldState: T) {
    if (!this.latestAssertions.length) return;

    const callId = uuid();
    const args: CallAssertionArgs = { callId, methods: this.latestAssertions };

    this.stateHistory[callId] = oldState;

    this.call("callAssertions", args);

    this.latestAssertions = [];
  }

  queueAssertions(assertions: AssertMethodsPayload) {
    this.latestAssertions.push(...assertions);
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