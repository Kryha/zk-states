import { type JsonProof } from "snarkyjs";
import type { TransitionRes, TransitionStateArgs } from "./types";
import {
  type WorkerFunctions,
  type ZkappWorkerReponse,
  type ZkappWorkerRequest,
} from "./zkAppWorker";

class ZkAppWorkerClient {
  worker: Worker;

  promises: {
    [id: number]: {
      resolve: (res: unknown) => void;
      reject: (err: unknown) => void;
    };
  };

  nextId: number;

  latestProof: JsonProof | undefined;

  constructor() {
    this.worker = new Worker(new URL("./zkappWorker.ts", import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      switch (event.data.resType) {
        case "function-call": {
          const nextPromise = this.promises[event.data.id];
          if (!nextPromise) return;

          nextPromise.resolve(event.data.data);
          delete this.promises[event.data.id];
          break;
        }

        case "proof-update":
          this.latestProof = event.data.data as JsonProof | undefined;
          break;
      }
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

  getLatestProof() {
    return this.latestProof;
  }

  async getTreeRoot(args: unknown) {
    const root = await this.call("getTreeRoot", args);
    return root as string;
  }

  async init(args: unknown) {
    const result = (await this.call("init", args)) as TransitionRes;
    this.latestProof = result.proof;
    return result;
  }

  async transitionState(args: TransitionStateArgs) {
    await this.call("transitionState", args);
  }
}

export const zkAppWorkerClient = new ZkAppWorkerClient();
