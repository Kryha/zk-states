import { type FC } from "react";

type VerifyButtonProps = {
  gameFinished: boolean;
  assertionQueue: string[];
};

export const VerifyButton: FC<VerifyButtonProps> = ({
  gameFinished,
  assertionQueue,
}) => {
  return (
    <div>
      <h3 style={{ marginBottom: "0.5rem" }}>Verify</h3>
      <div style={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
        <button disabled={!gameFinished || assertionQueue.length > 0}>
          Verify the game
        </button>
      </div>
    </div>
  );
};
