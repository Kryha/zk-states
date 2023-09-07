import { type FC } from "react";
import "./styles.css";

type LoadingSpinnerProps = {
  isSmall?: boolean;
};

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ isSmall }) => {
  return (
    <div className={isSmall ? "lds-roller-small" : "lds-roller"}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
