import { Assert } from "./program";
import { prove } from "./prove";
import {
  type AssertMethod,
  type AssertProof,
  type QueuedAssertion,
  type TransitionRes,
  type WorkerState,
  type WorkerStateUpdate,
  callAssertionArgsSchema,
} from "./types";
import { logger } from "./utils";

let post = (res: ZkappWorkerReponse | WorkerStateUpdate) => postMessage(res);

const stringifyUpdateQueue = (assertions: QueuedAssertion[]) => {
  const res = assertions.flatMap((call) =>
    call.proveFunctions.flatMap((assertion) => assertion.name),
  );
  return res;
};

const state: WorkerState = {
  updateQueue: [],
  isProving: false,
};

setInterval(async () => {
  if (!state.latestProof || state.isProving || !state.updateQueue.length) {
    return;
  }

  const nextUpdate = state.updateQueue.at(0);
  if (!nextUpdate) return;
  const { callId, proveFunctions } = nextUpdate;

  state.isProving = true;
  post({
    updateType: "isProving",
    data: state.isProving,
  });

  let localProof = state.latestProof;
  let hasSucceeded = true;

  for (const prove of proveFunctions) {
    if (hasSucceeded) {
      try {
        localProof = await prove.method(localProof);

        post({
          updateType: "latestProof",
          data: localProof.toJSON(),
        });
      } catch (error) {
        logger.error("Update queue error:", error);

        hasSucceeded = false;
        state.updateQueue = [];

        post({ updateType: "proofError", callId });
        post({
          updateType: "latestProof",
          data: state.latestProof.toJSON(),
        });
      }
    }
  }

  if (hasSucceeded) {
    state.updateQueue.shift();
    state.latestProof = localProof;

    post({
      updateType: "proofSuccess",
      callId,
    });
    post({
      updateType: "updateQueue",
      data: stringifyUpdateQueue(state.updateQueue),
    });
  }

  state.isProving = false;
  post({
    updateType: "isProving",
    data: state.isProving,
  });
}, 3000);

const generateAssertion = (methodName: AssertMethod, methodArgs: string[]) => {
  const method = async (prevProof: AssertProof) => {
    logger.info("[zk-states worker] creating update proof...");
    const proof = await prove(prevProof, methodName, methodArgs);
    logger.info("[zk-states worker] update proof generated");

    return proof;
  };
  return { name: methodName, method };
};

const workerFunctions = {
  init: async (_args: unknown): Promise<TransitionRes> => {
    logger.info("[zk-states worker] compiling program...");
    await Assert.compile();
    logger.info("[zk-states worker] program compiled");

    logger.info("[zk-states worker] creating init proof...");
    const creationProof = await Assert.init();
    state.latestProof = creationProof;
    logger.info("[zk-states worker] init done");

    return { proof: creationProof.toJSON() };
  },

  callAssertions: (args: unknown) => {
    if (!state.latestProof) return;

    const { methods, callId } = callAssertionArgsSchema.parse(args);

    const proveFunctions = methods.map(({ name, args }) =>
      generateAssertion(name, args),
    );

    state.updateQueue.push({ callId, proveFunctions });

    post({
      updateType: "updateQueue",
      data: stringifyUpdateQueue(state.updateQueue),
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
    logger.error("Worker Error:", error);
  }
};

/**
 * Sets the message listener in the worker. Read the README for informations on how to use in your own code.
 *
 * @param testRef reference to the worker file when testing the library, do not use when developing
 */
export const initZKWorker = (testRef?: Window & typeof globalThis) => {
  logger.info("[zk-states worker] adding event listener");

  if (testRef) {
    post = (res: ZkappWorkerReponse | WorkerStateUpdate) =>
      testRef.postMessage(res);

    testRef.onmessage = onMessage;
  } else {
    onmessage = onMessage;
  }
  logger.info("[zk-states worker] added worker service listener.");
};
