import { Board, HistoryButtons } from "./components/";
import { useInitZkStore, useZKStore, useStore } from "./store";
import "./styles.css";
import { usePlayerturn } from "./hooks";

export default function TicTacToe() {
  const { jumpTo, playerTurn, status } = usePlayerturn();
  const history = useStore((state) => state.history);
  const board = useZKStore((state) => state.board);
  

  useInitZkStore();

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
