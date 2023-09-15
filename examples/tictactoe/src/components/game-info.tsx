import { type FC } from "react";
import { Loading } from "./loading";
import { ProofQueue } from "./proof-queue";
import { VerifyButton } from "./verify-button";
import { InitializationProgress } from "zk-states/dist/types";

type GameInfoProps = {
  isInitialized: boolean;
  assertionQueue: string[];
  isGameFinished: boolean;
  status: string;
  initProgress: InitializationProgress;
};

export const GameInfo: FC<GameInfoProps> = ({
  isInitialized,
  assertionQueue,
  isGameFinished,
  status,
  initProgress,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        height: "100%",
        width: "17rem",
      }}
    >
      {isInitialized ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            height: "100%",
          }}
        >
          <div>
            <h3>Game Info</h3>
            <p>{status}</p>
          </div>

          <ProofQueue assertionQueue={assertionQueue} />
          <VerifyButton
            gameFinished={isGameFinished}
            assertionQueue={assertionQueue}
          />
        </div>
      ) : (
        <Loading initProgress={initProgress} />
      )}
    </div>
  );
};
