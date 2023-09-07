import { type FC } from "react";
import { LoadingSpinner } from "./loading-spinner";

type ProofQueueProps = {
  assertionQueue: string[];
};

export const ProofQueue: FC<ProofQueueProps> = ({ assertionQueue }) => {
  return (
    <div>
      <h3>Proof Queue</h3>
      {assertionQueue.length === 0 && <p>No proofs are being generated</p>}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {assertionQueue.length === 1 && (
          <>
            <LoadingSpinner isSmall />
            <p> {assertionQueue.length} proof still needs to be generated</p>
          </>
        )}
        {assertionQueue.length > 1 && (
          <>
            <LoadingSpinner isSmall />
            <p> {assertionQueue.length} proofs still needs to be generated</p>
          </>
        )}
      </div>
    </div>
  );
};
