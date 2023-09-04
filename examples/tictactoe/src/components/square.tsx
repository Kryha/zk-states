import type { FC } from "react";
import type { Player } from "../types";
import "./styles.css";

type Props = {
  value: Player;
  onClick: () => void;
};

export const Square: FC<Props> = ({ value, onClick }) => {
  const renderIcon = (value: string) => {
    return value === "X" ? (
      <div className={"cross"}></div>
    ) : (
      <div className={"circle"}></div>
    );
  };
  return (
    <div className={"square"} onClick={onClick}>
      {value !== "" && renderIcon(value)}
    </div>
  );
};
