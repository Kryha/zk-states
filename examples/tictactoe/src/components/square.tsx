import React from "react";
import { Player } from "../types";
import "./styles.css";

type Props = {
  value: Player;
  onClick: () => void;
};

export const Square: React.FC<Props> = ({ value, onClick }) => {
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
