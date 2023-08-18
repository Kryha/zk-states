import React from "react";
import { render } from "@testing-library/react";
import { it } from "vitest";
import { createZKState } from "zk-states";

it("initializes state in a react component", async () => {
  interface ZKState {
    num: number;
    incNum: () => void;
  }

  const { useInitZkStore } = createZKState<ZKState>(
    new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
    (set) => ({
      num: 0,
      incNum: () => set((state) => ({ num: state.num + 1 })),
    }),
  );

  const Component = () => {
    useInitZkStore();
    return <>hello world!</>;
  };

  const { findByText } = render(<Component />);

  await findByText("hello world!");
});
