import { GameBoard, Player } from "../types";
import { createZKState } from "zk-states";
import { create } from "zustand";
import { produce } from "immer";

export interface TicTacToeStore {
  history: GameBoard[];
  turnNumber: number;
  xIsNext: boolean;
  finished: boolean;

  newTurn: (turnNumber: number) => void;
  clearHistory: () => void;
  setXIsNext: () => void;
  setFinished: (finished: boolean) => void;
  setHistory: (history: GameBoard[]) => void;
}

const EMPTY_BOARD = [{ squares: new Array<Player>(9).fill("") }];

// Zustand store for the TicTacToe game genereates no proof on state change
export const useStore = create<TicTacToeStore>()((set) => ({
  history: EMPTY_BOARD,
  turnNumber: 0,
  xIsNext: true,
  finished: false,

  newTurn: (turnNumber) => set(() => ({ turnNumber: turnNumber })),
  setHistory: (history) => set(() => ({ history: history })),
  clearHistory: () => set(() => ({ history: EMPTY_BOARD })),
  setXIsNext: () => set((state) => ({ xIsNext: state.turnNumber % 2 === 0 })),
  setFinished: (finished) => set(() => ({ finished: finished })),
}));

// ZK store for the TicTacToe game these values generate a proof on state change
interface ZKState {
  board: Player[];
  updateBoard: (index: number, value: Player) => void;
  setBoard: (board: Player[]) => void;
}

export const { useInitZkStore, useZKStore, useGetLatestProof } =
  createZKState<ZKState>(
    new Worker(new URL("../worker/zkStatesWebWorker.ts", import.meta.url), {
      type: "module",
    }),
    (set) => ({
      board: new Array<Player>(9).fill(""),
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
