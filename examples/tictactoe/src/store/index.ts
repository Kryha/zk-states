import { produce } from "immer";
import { createZKAppWorkerClient, createZKAssert, createZKState } from "zk-states";
import type { GameBoard, Player } from "../types";


const worker = new Worker(new URL("../worker/zkStatesWebWorker.ts", import.meta.url), {
  type: "module",
});

const workerClient = createZKAppWorkerClient(worker);

//TODO:: use this variable when there are string assertions avaliable
const zkAssert = createZKAssert(workerClient);

const EMPTY_BOARD = [{ squares: new Array<Player>(9).fill("") }];

// ZK store for the TicTacToe game these values generate a proof on state change
interface ZKState {
  board: Player[];
  history: GameBoard[];
  turnNumber: number;
  xIsNext: boolean;
  finished: boolean;

  updateBoard: (index: number, value: Player) => void;
  setBoard: (board: Player[]) => void;
  newTurn: (turnNumber: number) => void;
  clearHistory: () => void;
  setXIsNext: () => void;
  setFinished: (finished: boolean) => void;
  setHistory: (history: GameBoard[]) => void;
}

export const { useInitZKStore, useZKStore, useProof, useIsInitialized } = createZKState<ZKState>(workerClient,
  (set) => ({
    board: new Array<Player>(9).fill(""),
    history: EMPTY_BOARD,
    turnNumber: 0,
    xIsNext: true,
    finished: false,

    newTurn: (turnNumber) => set(() => ({ turnNumber: turnNumber })),
    setHistory: (history) => set(() => ({ history: history })),
    clearHistory: () => set(() => ({ history: EMPTY_BOARD })),
    setXIsNext: () =>
      set((state) => ({ xIsNext: state.turnNumber % 2 === 0 })),
    setFinished: (finished) => set(() => ({ finished: finished })),
    updateBoard: (index, value) => {
      set(
        produce((state: ZKState) => {
          state.board[index] = value;
        }),
      );
    },
    setBoard: (board) => set(() => ({ board: board })),
  }),
  );
