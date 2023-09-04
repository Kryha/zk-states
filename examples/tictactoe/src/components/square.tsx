import type { FC } from "react";
import type { PlayField } from "../types";
import "./styles.css";

type Props = {
  value: PlayField;
  onClick: () => void;
};

export const Square: FC<Props> = ({ value, onClick }) => {
  const renderIcon = (value: number) => {
    return value === 2 ? (
      <div className={"cross"}></div>
    ) : (
      <div className={"circle"}></div>
    );
  };
  return (
    <div className={"square"} onClick={onClick}>
      {value !== 0 && renderIcon(value)}
    </div>
  );
};
