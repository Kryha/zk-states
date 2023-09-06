import { produce } from "immer";
import {
  createZKAppWorkerClient,
  createZKAssert,
  createZKState,
} from "zk-states";
import type { GameBoard, PlayField, Player } from "../types";

const worker = new Worker(
  new URL("../worker/zkStatesWebWorker.ts", import.meta.url),
  {
    type: "module",
  },
);

const workerClient = createZKAppWorkerClient(worker);

//TODO:: use this variable when there are string assertions avaliable
const zkAssert = createZKAssert(workerClient);

const EMPTY_BOARD = [{ squares: new Array<PlayField>(9).fill(0) }];

// ZK store for the TicTacToe game these values generate a proof on state change
interface ZKState {
  board: PlayField[];
  history: GameBoard[];
  turnNumber: number;
  currentPlayer: Player;
  finished: boolean;

  updateBoard: (index: number, value: PlayField) => void;
  setBoard: (board: PlayField[]) => void;
  newTurn: (turnNumber: number) => void;
  clearHistory: () => void;
  setFinished: (finished: boolean) => void;
  setHistory: (history: GameBoard[]) => void;
}

export const { useInitZKStore, useZKStore, useProof, useIsInitialized } =
  createZKState<ZKState>(workerClient, (set) => ({
    board: EMPTY_BOARD[0].squares,
    history: EMPTY_BOARD,
    turnNumber: 0,
    currentPlayer: 1,
    finished: false,

    newTurn: (turnNumber) =>
      set(() => ({
        turnNumber: turnNumber,
        currentPlayer: turnNumber % 2 === 0 ? 1 : 2,
      })),
    setHistory: (history) => set(() => ({ history: history })),
    clearHistory: () => set(() => ({ history: EMPTY_BOARD })),
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
    setBoard: (board) => set(() => ({ board: board })),
  }));
