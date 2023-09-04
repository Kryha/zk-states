import { useZKStore } from "../store";
import type { PlayField } from "../types";
import { calculateWinner } from "../util";

export const usePlayerturn = () => {
  const history = useZKStore((state) => state.history);
  const turnNumber = useZKStore((state) => state.turnNumber);
  const finished = useZKStore((state) => state.finished);
  const currentPlayer = useZKStore((state) => state.currentPlayer);
  const setFinished = useZKStore((state) => state.setFinished);
  const newTurn = useZKStore((state) => state.newTurn);
  const updateBoard = useZKStore((state) => state.updateBoard);
  const setBoard = useZKStore((state) => state.setBoard);
  const setHistory = useZKStore((state) => state.setHistory);

  const board = useZKStore((state) => state.board);

  const winner = calculateWinner(board);

  const status = winner
    ? "Winner: " + (winner === 2 ? "X" : "O")
    : "Next player: " + (currentPlayer === 2 ? "X" : "O");

  const playerTurn = (i: number) => {
    if (finished) {
      return;
    }
    if (turnNumber >= 9) {
      setFinished(true);
      return;
    }
    const historySlice = history.slice(0, turnNumber + 1);
    const squares = [...historySlice[history.length - 1].squares];

    if (squares[i]) {
      return;
    }
    if (winner) {
      setFinished(true);
      return;
    }

    squares[i] = currentPlayer ? 2 : 1;

    updateBoard(i, getActivePlayer());
    setHistory([...history, { squares: squares }]);
    newTurn(historySlice.length);
  };

  const jumpTo = (step: number) => {
    setBoard(history[step].squares);
    setHistory(history.slice(0, step + 1));
    newTurn(step);
    setFinished(false);
  };

  const getActivePlayer = (): PlayField => {
    return currentPlayer ? 2 : 1;
  };
  return { jumpTo, getActivePlayer, finished, playerTurn, status };
};
