import type { FC } from "react";
import "./styles.css";
import { LoadingSpinner } from "./loading-spinner";

export const Loading: FC = () => {
  return (
    <div>
      <p>
        Currently we are compiling the ZK-Program and initializing the
        application!
      </p>
      <br />
      <h3>Please wait...</h3>
      <LoadingSpinner />
    </div>
  );
};
