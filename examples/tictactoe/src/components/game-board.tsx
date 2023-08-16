import { FC } from "react";
import { Square } from "../components";
import { Player } from "../types";
import "./styles.css";

type Props = {
  squares: Array<Player>;
  onClick: (i: number) => void;
};

export const Board: FC<Props> = ({ squares, onClick }) => {
  const renderSquare = (i: number) => (
    <Square value={squares[i]} onClick={() => onClick(i)} />
  );

  return (
    <div className={"gameboard"}>
      <div className={"boardRow"}>
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className={"boardRow"}>
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className={"boardRow"}>
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
};
