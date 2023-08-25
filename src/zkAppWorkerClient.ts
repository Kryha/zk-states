import type {
  CallAssertionArgs,
  TransitionRes,
  WorkerStateUpdate,
} from "./types";
import {
  type WorkerFunctions,
  type ZkappWorkerReponse,
  type ZkappWorkerRequest,
} from "./zkAppWorker";

export class ZkAppWorkerClient {
  worker: Worker;

  promises: {
    [id: number]: {
      resolve: (res: unknown) => void;
      reject: (err: unknown) => void;
    };
  };

  nextId: number;

  constructor(worker: Worker) {
    this.worker = worker;
    this.promises = {};
    this.nextId = 0;
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

  async init(
    args: unknown,
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

  async callAssertion(args: CallAssertionArgs) {
    await this.call("callAssertion", args);
  }
}
