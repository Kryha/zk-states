import { type FC } from "react";

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
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        {assertionQueue.length === 1 && (
          <>
            <img src="../public/loading.svg" height="20px" width="20px" />
            <p> {assertionQueue.length} proof still needs to be generated</p>
          </>
        )}
        {assertionQueue.length > 1 && (
          <>
            <img src="../public/loading.svg" height="20px" width="20px" />
            <p> {assertionQueue.length} proofs still needs to be generated</p>
          </>
        )}
      </div>
    </div>
  );
};
