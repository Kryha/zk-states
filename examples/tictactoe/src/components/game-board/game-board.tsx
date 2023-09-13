import type { FC } from "react";
import type { PlayField } from "../../types";
import { Square } from "../square";
import "./styles.css";

type Props = {
  squares: Array<PlayField>;
  onClick: (i: number) => void;
  enableClick?: boolean;
};

export const Board: FC<Props> = ({ squares, onClick, enableClick }) => {
  const renderSquare = (i: number) => (
    <Square value={squares[i]} onClick={() => onClick(i)} />
  );

  return (
    <div className={enableClick ? "gameboard" : "gameboard-disabled"}>
      <div className="boardRow">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="boardRow">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="boardRow">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
};
