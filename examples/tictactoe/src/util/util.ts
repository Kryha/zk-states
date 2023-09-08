import { type PlayField, type Player } from "../types";

export const calculateWinner = (squares: PlayField[]): Player | undefined => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let result: Player | null = null;

  lines.forEach((line) => {
    const [a, b, c] = line;
    const player = squares[a];
    if (player && player === squares[b] && player === squares[c]) {
      result = player;
    }
  });

  return result;
};
