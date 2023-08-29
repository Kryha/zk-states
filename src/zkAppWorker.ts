import { Assert } from "./program";
import { prove } from "./prove";
import {
  type AssertMethod,
  type AssertProof,
  type TransitionRes,
  type WorkerState,
  type WorkerStateUpdate,
  callAssertionArgsSchema,
} from "./types";

let post = (res: ZkappWorkerReponse | WorkerStateUpdate) => postMessage(res);

const state: WorkerState = {
  updateQueue: [],
  isProving: false,
};

setInterval(async () => {
  if (!state.latestProof || state.isProving || !state.updateQueue.length) {
    return;
  }

  const nextUpdate = state.updateQueue.shift();
  if (!nextUpdate) return;
  const { callId, proveFunctions } = nextUpdate;

  state.isProving = true;
  post({
    updateType: "isProving",
    data: state.isProving,
  });

  let localProof = state.latestProof;
  for (const prove of proveFunctions) {
    try {
      localProof = await prove(localProof);

      post({
        updateType: "latestProof",
        data: localProof.toJSON(),
      });
    } catch (error) {
      console.warn("Update queue error:", error);

      localProof = state.latestProof;
      state.updateQueue = [];
      state.isProving = false;

      post({ updateType: "proofError", callId });
      post({
        updateType: "latestProof",
        data: localProof.toJSON(),
      });

      break;
    }
  }

  state.latestProof = localProof;
  state.isProving = false;

  post({
    updateType: "proofSuccess",
    callId,
  });
  post({
    updateType: "isProving",
    data: state.isProving,
  });
  post({
    updateType: "updateQueue",
    data: state.updateQueue.length,
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

  callAssertions: (args: unknown) => {
    if (!state.latestProof) return;

    const { methods, callId } = callAssertionArgsSchema.parse(args);

    const proveFunctions = methods.map(({ name, args }) =>
      generateAssertion(name, args),
    );

    state.updateQueue.unshift({ callId, proveFunctions });

    post({
      updateType: "updateQueue",
      data: state.updateQueue.length,
    });
  },
};

export type WorkerFunctions = keyof typeof workerFunctions;

export interface ZkappWorkerRequest {
  id: number;
  fn: WorkerFunctions;
  args: unknown;
}

export interface ZkappWorkerReponse {
  id: number;
  data: unknown;
}

const onMessage = async (event: MessageEvent<ZkappWorkerRequest>) => {
  try {
    const returnData = await workerFunctions[event.data.fn](event.data.args);

    const message: ZkappWorkerReponse = {
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
    post = (res: ZkappWorkerReponse | WorkerStateUpdate) =>
      testRef.postMessage(res);

    testRef.onmessage = onMessage;
  } else {
    onmessage = onMessage;
  }

  console.info("[zk-states worker] added worker service listener.");
};
