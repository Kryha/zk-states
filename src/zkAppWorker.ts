import {
  CircuitString,
  type Field,
  MerkleTree,
  Poseidon,
  type Proof,
} from "snarkyjs";
import { StateTracker } from "./program";
import {
  type TransitionRes,
  type WorkerState,
  transitionStateArgsSchema,
} from "./types";
import { INITIAL_STATE, MERKLE_TREE_HEIGHT, MerkleWitness20 } from "./utils";

let post = postMessage;

const state: WorkerState = {
  tree: new MerkleTree(MERKLE_TREE_HEIGHT),
  transitionIndex: 0n, // should increment on state transition and is used to index the tree
  updateQueue: [],
  executingUpdate: false,
};

setInterval(() => {
  if (
    !state.latestProof ||
    state.executingUpdate ||
    !state.updateQueue.length
  ) {
    return;
  }

  const nextUpdate = state.updateQueue.shift();
  if (!nextUpdate) return;

  state.executingUpdate = true;

  nextUpdate(state.latestProof)
    .then((proof) => {
      state.latestProof = proof;

      const message: ZkappWorkerReponse = {
        resType: "proof-update",
        id: 0,
        data: proof.toJSON(),
      };
      post(message);

      state.executingUpdate = false;
    })
    .catch((err) => {
      console.warn("Update queue error:", err);
      state.executingUpdate = false;
    });
}, 3000);

const generateStateUpdate =
  (newState: string, leafIndex: bigint) =>
  async (prevProof: Proof<Field, void>) => {
    const newStateCircuit = CircuitString.fromString(newState);

    state.tree.setLeaf(leafIndex, Poseidon.hash(newStateCircuit.toFields()));

    const witness = new MerkleWitness20(state.tree.getWitness(leafIndex));

    console.info("[zk-states worker] creating update proof...");
    const proof = await StateTracker.update(
      state.tree.getRoot(),
      prevProof,
      newStateCircuit,
      witness,
    );
    console.info("[zk-states worker] update proof generated:", proof.toJSON());

    return proof;
  };

const workerFunctions = {
  getTreeRoot: (_args: unknown) => {
    return state.tree.getRoot().toString();
  },

  init: async (_args: unknown): Promise<TransitionRes> => {
    console.info("[zk-states worker] compiling program...");
    // TODO: check if we can cache the compiled program
    await StateTracker.compile();
    console.info("[zk-states worker] program compiled");

    const initialStateCircuit = CircuitString.fromString(INITIAL_STATE);

    state.transitionIndex++;

    state.tree.setLeaf(
      state.transitionIndex,
      Poseidon.hash(initialStateCircuit.toFields()),
    );

    const witness = new MerkleWitness20(
      state.tree.getWitness(state.transitionIndex),
    );

    console.info("[zk-states worker] creating init proof...");
    const creationProof = await StateTracker.create(
      state.tree.getRoot(),
      initialStateCircuit,
      witness,
    );
    state.latestProof = creationProof;

    console.info("[zk-states worker] init done");

    return { proof: creationProof.toJSON() };
  },

  transitionState: (args: unknown) => {
    if (!state.latestProof) return;

    const { newState } = transitionStateArgsSchema.parse(args);

    state.transitionIndex++;
    const prove = generateStateUpdate(newState, state.transitionIndex);
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
