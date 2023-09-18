import type { FC } from "react";
import "./styles.css";
import { InitializationProgress } from "zk-states/dist/types";

type LoadingProps = {
  initProgress: InitializationProgress;
};

export const Loading: FC<LoadingProps> = ({ initProgress }) => {
  const getProgress = (progress: InitializationProgress) => {
    switch (progress) {
      case "pendingStart":
        return "Initializing";
      case "compilingProgram":
        return "Compiling ZK-Program";
      case "compilingContract":
        return "Compiling ZK-Contract";
      case "creatingInitialProof":
        return "Creating Initial Proof";
      case "done":
        return "Done";
    }
  };

  return (
    <div>
      <p>
        Currently we are compiling the ZK-Program and initializing the
        application!
      </p>
      <br />
      <h3>{getProgress(initProgress)}</h3>
      <img
        style={{ marginTop: "1rem" }}
        src="../public/loading.svg"
        height="80px"
        width="80px"
      />
    </div>
  );
};
