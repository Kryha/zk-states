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

//TODO:: use this variable when there are string assertions avaliable
const zkAssert = createZKAssert(workerClient);

// ZK store for the TicTacToe game these values generate a proof on state change
interface ZKState {
  board: PlayField[];
  turnNumber: number;
  currentPlayer: Player;
  finished: boolean;

  updateBoard: (index: number) => void;
  newTurn: (turnNumber: number) => void;
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

  newTurn: (turnNumber) =>
    set(() => ({
      turnNumber: turnNumber,
      currentPlayer: turnNumber % 2 === 0 ? 1 : 2,
    })),
  setFinished: (finished) => set(() => ({ finished: finished })),
  updateBoard: (index) => {
    set(
      produce((state: ZKState) => {
        zkAssert.numeric.equals(state.board[index], 0);
        state.board[index] = state.currentPlayer;
        state.currentPlayer = state.currentPlayer === 2 ? 1 : 2;
      }),
    );
  },
}));
