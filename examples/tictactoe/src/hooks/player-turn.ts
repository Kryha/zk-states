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

    if (board[i]) {
      return;
    }

    if (winner) {
      setFinished(true);
      return;
    }
    updateBoard(i);
  };

  return { finished, playerTurn, status };
};
