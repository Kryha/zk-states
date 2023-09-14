import { Mina, PublicKey, fetchAccount } from "o1js";
import { Assert, StatesVerifier } from "zk-states-contracts";
import { prove } from "./prove";
import {
  type MinaNetwork,
  type TxRes,
  type WorkerState,
  type WorkerStateUpdate,
  assertionSchema,
  fetchAccountArgsSchema,
  initArgsSchema,
  setMinaNetworkArgsSchema,
} from "./types";
import { logger } from "./utils";

let post = (res: ZkappWorkerReponse | WorkerStateUpdate) => postMessage(res);

const minaEndpoints: Record<MinaNetwork, string> = {
  berkeley: "https://proxy.berkeley.minaexplorer.com/graphql",
};

const state: WorkerState = {
  isProving: false,
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

  init: async (args: unknown) => {
    const { appPublicKey58 } = initArgsSchema.parse(args);

    logger.info("[zk-states worker] compiling program...");
    await Assert.compile();
    logger.info("[zk-states worker] program compiled");

    logger.info("[zk-states worker] compiling contract...");
    await StatesVerifier.compile();
    logger.info("[zk-states worker] contract compiled");

    state.statesVerifier = new StatesVerifier(
      PublicKey.fromBase58(appPublicKey58),
    );

    logger.info("[zk-states worker] creating init proof...");
    const creationProof = await Assert.init();
    state.latestProof = creationProof;
    logger.info("[zk-states worker] init done");

    return creationProof.toJSON();
  },

  proveAssertion: async (args: unknown) => {
    if (state.isProving || !state.latestProof) return;

    try {
      logger.info("[zk-states worker] generating update proof...");
      const assertion = assertionSchema.parse(args);
      state.latestProof = await prove(
        state.latestProof,
        assertion.name,
        assertion.args,
      );
      logger.info("[zk-states worker] update proof generated");
    } catch (error) {
      return;
    }

    return state.latestProof.toJSON();
  },

  verify: async (_args: unknown): Promise<TxRes> => {
    if (!state.statesVerifier) throw new Error("Contract not initialized");
    if (!state.latestProof) throw new Error("No proof to verify");

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

    return {
      transaction: transaction.toJSON(),
      proof: state.latestProof.toJSON(),
    };
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
