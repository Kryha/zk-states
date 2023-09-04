import { Board, HistoryButtons } from "./components";
import { usePlayerturn } from "./hooks";
import { useInitZKStore, useZKStore } from "./store";
import "./styles.css";

export default function TicTacToe() {
  const { jumpTo, playerTurn, status } = usePlayerturn();
  const history = useZKStore((state) => state.history);
  const board = useZKStore((state) => state.board);

  useInitZKStore();

  const handleClick = (i: number) => {
    playerTurn(i);
  };

  return (
    <div className={"outerDiv"}>
      <Board squares={board} onClick={(i) => handleClick(i)} />
      <div className="game-info">
        <div>{status}</div>
        <HistoryButtons history={history} onClick={jumpTo} />
      </div>
    </div>
  );
}
