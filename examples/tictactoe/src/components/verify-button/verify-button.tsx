import { type FC } from "react";
import { useVerify } from "../../store";
import "./styles.css";

type VerifyButtonProps = {
  gameFinished: boolean;
  assertionQueue: string[];
};

export const VerifyButton: FC<VerifyButtonProps> = ({
  gameFinished,
  assertionQueue,
}) => {
  const { verify, verificationStatus } = useVerify();

  const getStatus = () => {
    if (assertionQueue.length > 0 || !gameFinished) {
      return "Game not finished or proofs are still being generated";
    }
    switch (verificationStatus) {
      case "none":
        return "Currently not verifying";
      case "pending":
        return "Verifying...";
      case "success":
        return "Verification successful";
      case "failure":
        return "Verification failed";
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: "0.5rem" }}>Verify</h3>
      <div style={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
        <p>{getStatus()}</p>
        <button
          className={"verifybutton"}
          disabled={!gameFinished || assertionQueue.length > 0}
          onClick={() => {
            verify();
          }}
        >
          Verify the game
        </button>
      </div>
    </div>
  );
};
