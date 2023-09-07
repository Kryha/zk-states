import { Board } from "./components";
import { GameInfo } from "./components/game-info";
import { usePlayerturn } from "./hooks";
import {
  useInitZKStore,
  useIsInitialized,
  useQueuedAssertions,
  useZKStore,
} from "./store";
import "./styles.css";

export default function TicTacToe() {
  const { playerTurn, status, finished } = usePlayerturn();
  const board = useZKStore((state) => state.board);
  const isInitialized = useIsInitialized();
  const assertionQueue = useQueuedAssertions();
  useInitZKStore();

  const handleClick = (i: number) => {
    playerTurn(i);
  };

  return (
    <div className={"outerDiv"}>
      <div className={"headerDiv"}>
        <img src="../public/logo.png" alt="logo" width="130" height="50" />
      </div>
      <div className={"titleDiv"}>
        <h1 style={{ fontSize: "4rem" }}>Verifiable Tic Tac Toe</h1>
      </div>
      <div className={"gameDiv"}>
        <Board
          enableClick={isInitialized}
          squares={board}
          onClick={(i) => handleClick(i)}
        />
        <GameInfo
          isInitialized={isInitialized}
          assertionQueue={assertionQueue}
          status={status}
          isGameFinished={finished}
        />
      </div>
      <div className={"footerDiv"}>
        <p>
          Made with ❤️ by
          <a style={{ color: "inherit" }} href="https://kryha.io">
            Kryha
          </a>
        </p>
        <a href="https://github.com/kryha" target="_self">
          <img
            src="../public/github-mark.png"
            alt="GitHub Logo"
            height="25px"
            width="25px"
          />
        </a>
      </div>
    </div>
  );
}
