import { Board, HistoryButtons } from "./components";
import { Loading } from "./components/loading";
import { usePlayerturn } from "./hooks";
import { useInitZKStore, useZKStore, useIsInitialized } from "./store";
import "./styles.css";

export default function TicTacToe() {
  const { jumpTo, playerTurn, status } = usePlayerturn();
  const history = useZKStore((state) => state.history);
  const board = useZKStore((state) => state.board);
  const isInitialized = useIsInitialized();

  useInitZKStore();

  const handleClick = (i: number) => {
    playerTurn(i);
  };

  return (
    <div className={"outerDiv"}>
      <Board
        enableClick={isInitialized}
        squares={board}
        onClick={(i) => handleClick(i)}
      />
      <div className="game-info">
        {isInitialized ? (
          <div>
            <div>{status}</div>
            <HistoryButtons history={history} onClick={jumpTo} />
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}
