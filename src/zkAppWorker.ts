import { Assert } from "./program";
import { prove } from "./prove";
import {
  type AssertMethod,
  type AssertProof,
  type TransitionRes,
  type WorkerState,
  callAssertionArgsSchema,
} from "./types";

let post = postMessage;

const state: WorkerState = {
  updateQueue: [],
  isProving: false,
};

setInterval(() => {
  if (!state.latestProof || state.isProving || !state.updateQueue.length) {
    return;
  }

  const nextUpdate = state.updateQueue.shift();
  if (!nextUpdate) return;

  state.isProving = true;

  nextUpdate(state.latestProof)
    .then((proof) => {
      state.latestProof = proof;

      const message: ZkappWorkerReponse = {
        resType: "proof-update",
        id: 0,
        data: proof.toJSON(),
      };
      post(message);

      state.isProving = false;
    })
    .catch((err) => {
      console.warn("Update queue error:", err);
      state.isProving = false;
    });
}, 3000);

const generateAssertion =
  (methodName: AssertMethod, methodArgs: string[]) =>
  async (prevProof: AssertProof) => {
    console.info("[zk-states worker] creating update proof...");
    const proof = await prove(prevProof, methodName, methodArgs);
    console.info("[zk-states worker] update proof generated:", proof.toJSON());

    return proof;
  };

const workerFunctions = {
  init: async (_args: unknown): Promise<TransitionRes> => {
    console.info("[zk-states worker] compiling program...");
    await Assert.compile();
    console.info("[zk-states worker] program compiled");

    console.info("[zk-states worker] creating init proof...");
    const creationProof = await Assert.init();
    state.latestProof = creationProof;
    console.info("[zk-states worker] init done");

    return { proof: creationProof.toJSON() };
  },

  callAssertion: (args: unknown) => {
    if (!state.latestProof) return;

    const { methodName, methodArgs } = callAssertionArgsSchema.parse(args);

    const prove = generateAssertion(methodName, methodArgs);
    state.updateQueue.unshift(prove);
  },
};

export type WorkerFunctions = keyof typeof workerFunctions;

export interface ZkappWorkerRequest {
  id: number;
  fn: WorkerFunctions;
  args: unknown;
}

export interface ZkappWorkerReponse {
  resType: "function-call" | "proof-update";
  id: number;
  data: unknown;
}

const onMessage = async (event: MessageEvent<ZkappWorkerRequest>) => {
  try {
    const returnData = await workerFunctions[event.data.fn](event.data.args);

    const message: ZkappWorkerReponse = {
      resType: "function-call",
      id: event.data.id,
      data: returnData,
    };
    post(message);
  } catch (error) {
    console.warn("Worker Error:", error);
  }
};

/**
 * Sets the message listener in the worker. Read the README for informations on how to use in your own code.
 *
 * @param testRef reference to the worker file when testing the library, do not use when developing
 */
export const initZKWorker = (testRef?: Window & typeof globalThis) => {
  console.info("[zk-states worker] adding event listener");

  if (testRef) {
    post = testRef.postMessage;
    testRef.onmessage = onMessage;
  } else {
    onmessage = onMessage;
  }

  console.info("[zk-states worker] added worker service listener.");
};
