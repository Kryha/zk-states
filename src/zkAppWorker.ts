import { Mina, PublicKey, fetchAccount } from "o1js";
import { Assert, type AssertProgramProof } from "./contract";
import { prove } from "./prove";
import {
  type AssertMethod,
  type MinaNetwork,
  type QueuedAssertion,
  type TransitionRes,
  type TxRes,
  type WorkerState,
  type WorkerStateUpdate,
  callAssertionArgsSchema,
  fetchAccountArgsSchema,
  initArgsSchema,
  setMinaNetworkArgsSchema,
} from "./types";
import { logger } from "./utils";

let post = (res: ZkappWorkerReponse | WorkerStateUpdate) => postMessage(res);

const minaEndpoints: Record<MinaNetwork, string> = {
  berkeley: "https://proxy.berkeley.minaexplorer.com/graphql",
};

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
  const method = async (prevProof: AssertProgramProof) => {
    logger.info("[zk-states worker] creating update proof...");
    const proof = await prove(prevProof, methodName, methodArgs);
    logger.info("[zk-states worker] update proof generated");

    return proof;
  };
  return { name: methodName, method };
};

const workerFunctions = {
  setMinaNetwork: async (args: unknown): Promise<void> => {
    const { networkName } = setMinaNetworkArgsSchema.parse(args);
    const network = Mina.Network(minaEndpoints[networkName]);
    Mina.setActiveInstance(network);
  },

  fetchAccount: (args: unknown) => {
    const { publicKey58 } = fetchAccountArgsSchema.parse(args);
    const publicKey = PublicKey.fromBase58(publicKey58);
    return fetchAccount({ publicKey });
  },

  init: async (args: unknown): Promise<TransitionRes> => {
    const { appPublicKey58 } = initArgsSchema.parse(args);

    logger.info("[zk-states worker] compiling program...");
    await Assert.compile();
    logger.info("[zk-states worker] program compiled");

    logger.info("[zk-states worker] compiling contract...");
    const { StatesVerifier } = await import("./contract");
    await StatesVerifier.compile();
    logger.info("[zk-states worker] contract compiled");

    state.statesVerifier = new StatesVerifier(
      PublicKey.fromBase58(appPublicKey58),
    );

    logger.info("[zk-states worker] creating init proof...");
    const creationProof = await Assert.init();
    state.latestProof = creationProof;
    logger.info("[zk-states worker] init done");

    return { proof: creationProof.toJSON() };
  },

  callAssertions: (args: unknown) => {
    if (!state.latestProof) throw new Error("Program not initialized");

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

  verify: async (_args: unknown): Promise<TxRes> => {
    if (!state.statesVerifier) throw new Error("Contract not initialized");
    if (!state.latestProof) throw new Error("No proof to verify");
    if (state.updateQueue.length !== 0) {
      throw new Error("Update queue must be empty");
    }

    logger.info("[zk-states worker] generating mina transaction...");
    const transaction = await Mina.transaction(() => {
      if (!state.statesVerifier || !state.latestProof) return;
      state.statesVerifier.verifyProof(state.latestProof);
    });

    logger.info("[zk-states worker] proving mina transaction...");
    // TODO: do we need to store this generated proof?
    await transaction.prove();

    logger.info("[zk-states worker] re-initializing program...");
    // TODO: maybe store the transaction proof instead of resetting
    state.latestProof = await Assert.init();

    logger.info("[zk-states worker] verify completed");

    return { transaction: transaction.toJSON() };
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
