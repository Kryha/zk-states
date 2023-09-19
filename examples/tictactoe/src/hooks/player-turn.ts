import { useEffect } from "react";
import { useZKStore } from "../store";
import { calculateWinner } from "../util";

export const usePlayerturn = () => {
  const turnNumber = useZKStore((state) => state.turnNumber);
  const finished = useZKStore((state) => state.finished);
  const currentPlayer = useZKStore((state) => state.currentPlayer);
  const setFinished = useZKStore((state) => state.setFinished);
  const updateBoard = useZKStore((state) => state.markCell);

  const board = useZKStore((state) => state.board);

  const winner = calculateWinner(board);

  useEffect(() => {
    if (winner) {
      setFinished(true);
    }
  }, [winner, setFinished]);

  const getPlayerIcon = (player: number) => {
    if (player === 2) {
      return "X";
    } else if (player === 1) {
      return "O";
    }
    return;
  };

  const status = winner
    ? "Winner: " + getPlayerIcon(winner)
    : "Next player: " + getPlayerIcon(currentPlayer);

  const makeMove = (i: number) => {
    if (finished) {
      return;
    }
    if (turnNumber >= 9) {
      setFinished(true);
      return;
    }

    if (board[i]) {
      return;
    }

    updateBoard(i);
  };

  return { finished, makeMove, status };
};
