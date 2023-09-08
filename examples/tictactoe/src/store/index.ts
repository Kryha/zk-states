import { produce } from "immer";
import {
  createZKAppWorkerClient,
  createZKAssert,
  createZKState,
} from "zk-states";
import type { PlayField, Player } from "../types";

const worker = new Worker(
  new URL("../worker/zkStatesWebWorker.ts", import.meta.url),
  {
    type: "module",
  },
);

const workerClient = createZKAppWorkerClient(worker);

// use this to assert conditions in your state to create proofs
const zkAssert = createZKAssert(workerClient);

interface ZKState {
  board: PlayField[];
  turnNumber: number;
  currentPlayer: Player;
  finished: boolean;

  markCell: (index: number) => void;
  setFinished: (finished: boolean) => void;
}

export const {
  useQueuedAssertions,
  useInitZKStore,
  useZKStore,
  useProof,
  useIsInitialized,
} = createZKState<ZKState>(workerClient, (set) => ({
  board: new Array<PlayField>(9).fill(0),
  turnNumber: 0,
  currentPlayer: 1,
  finished: false,

  setFinished: (finished) => set(() => ({ finished: finished })),
  markCell: (index) => {
    set(
      produce((state: ZKState) => {
        // By asserting that the cell is empty, we can prove that the Player
        // is not cheating by marking a cell that is already marked.
        zkAssert.numeric.equals(state.board[index], 0);
        state.board[index] = state.currentPlayer;
        state.currentPlayer = state.currentPlayer === 2 ? 1 : 2;
        state.turnNumber++;
      }),
    );
  },
}));
