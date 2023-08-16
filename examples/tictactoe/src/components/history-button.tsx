import { FC } from "react";
import { GameBoard } from "../types";

interface HistoryButtonsProps {
  history: GameBoard[];
  onClick: (move: number) => void;
}

export const HistoryButtons: FC<HistoryButtonsProps> = ({
  history,
  onClick,
}) => {
  const moves = history.map((_, move) => {
    const desc = move ? "Go to move #" + move.toString() : "Go to game start";
    return (
      <li key={move}>
        <button onClick={() => onClick(move)}>{desc}</button>
      </li>
    );
  });

  return <ol>{moves}</ol>;
};
