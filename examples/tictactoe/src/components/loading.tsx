import type { FC } from "react";
import "./styles.css";

export const Loading: FC = () => {
  const style = {
    color: "#CCFF00",
  };
  return (
    <div>
      <p style={style}>
        Currently we are compiling the ZK-Program and initializing the
        application!
      </p>
      <br />
      <h3 style={style}>Please wait...</h3>
    </div>
  );
};
