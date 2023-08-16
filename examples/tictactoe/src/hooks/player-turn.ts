import { calculateWinner } from "../util";
import { useStore, useZKStore } from "../store";
import { Player } from "../types";

export const usePlayerturn = () => {
  const history = useStore((state) => state.history);
  const turnNumber = useStore((state) => state.turnNumber);
  const finished = useStore((state) => state.finished);
  const xIsNext = useStore((state) => state.xIsNext);
  const setFinished = useStore((state) => state.setFinished);
  const setXIsNext = useStore((state) => state.setXIsNext);
  const newTurn = useStore((state) => state.newTurn);
  const updateBoard = useZKStore((state) => state.updateBoard);
  const setBoard = useZKStore((state) => state.setBoard);
  const setHistory = useStore((state) => state.setHistory);

  const board = useZKStore((state) => state.board);

  const winner = calculateWinner(board);

  const status = winner
    ? "Winner: " + winner
    : "Next player: " + (xIsNext ? "X" : "O");

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

    squares[i] = xIsNext ? "X" : "O";

    updateBoard(i, getActivePlayer());
    setHistory([...history, { squares: squares }]);
    newTurn(historySlice.length);
    setXIsNext();
  };

  const jumpTo = (step: number) => {
    setBoard(history[step].squares);
    setHistory(history.slice(0, step + 1));
    newTurn(step);
    setXIsNext();
    setFinished(false);
  };

  const getActivePlayer = (): Player => {
    return xIsNext ? "X" : "O";
  };
  return { jumpTo, getActivePlayer, finished, playerTurn, status };
};
