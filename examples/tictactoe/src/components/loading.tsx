import type { FC } from "react";
import "./styles.css";

type LoadingProps = {
  initProgress: string;
};

export const Loading: FC<LoadingProps> = ({ initProgress }) => {
  return (
    <div>
      <p>
        Currently we are compiling the ZK-Program and initializing the
        application!
      </p>
      <br />
      <h3>{initProgress}</h3>
      <img
        style={{ marginTop: "1rem" }}
        src="../public/loading.svg"
        height="80px"
        width="80px"
      />
    </div>
  );
};
