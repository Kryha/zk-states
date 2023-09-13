import { type FC } from "react";

type ProofQueueProps = {
  assertionQueue: string[];
};

export const ProofQueue: FC<ProofQueueProps> = ({ assertionQueue }) => {
  const queueLength = assertionQueue.length;

  return (
    <div>
      <h3>Proof Queue</h3>
      {queueLength === 0 && <p>No proofs are being generated</p>}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        {queueLength > 0 && (
          <>
            <img src="../public/loading.svg" height="20px" width="20px" />
            <p>
              {queueLength} proof{queueLength === 1 ? "" : "s"} still need
              {queueLength === 1 ? "s" : ""} to be generated
            </p>
          </>
        )}
      </div>
    </div>
  );
};
