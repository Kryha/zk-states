import type { FC } from "react";
import "./styles.css";

export const Loading: FC = () => {
  return (
    <div>
      <p>
        Currently we are compiling the ZK-Program and initializing the
        application!
      </p>
      <br />
      <h3>Please wait...</h3>
      <img
        style={{ marginTop: "1rem" }}
        src="../public/loading.svg"
        height="80px"
        width="80px"
      />
    </div>
  );
};
