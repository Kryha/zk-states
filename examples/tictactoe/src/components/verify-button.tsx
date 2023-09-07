import { type FC } from "react";

type VerifyButtonProps = {
  gameFinished: boolean;
  assertionQueue: string[];
  onClickReplay: () => void;
};

export const VerifyButton: FC<VerifyButtonProps> = ({
  gameFinished,
  assertionQueue,
  onClickReplay,
}) => {
  return (
    <div>
      <h3 style={{ marginBottom: "0.5rem" }}>Verify</h3>
      <div style={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
        <button disabled={!gameFinished || assertionQueue.length > 0}>
          Verify the game
        </button>
        <button disabled={!gameFinished} onClick={onClickReplay}>
          Replay the game
        </button>
      </div>
    </div>
  );
};
