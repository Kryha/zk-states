import { render } from "@testing-library/react";
import { it } from "vitest";
import { useMyStore } from "zk-state";

it("checks value of num", async () => {
  const Component = () => {
    const num = useMyStore((state) => state.num);
    return <div>num: {num}</div>;
  };

  const { findByText } = render(<Component />);

  await findByText("num: 1");
});
